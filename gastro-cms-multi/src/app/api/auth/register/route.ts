import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { checkRateLimit, rateLimitConfigs, getRateLimitHeaders } from '@/lib/rateLimit';
import { validatePassword } from '@/lib/passwordValidation';
import { sanitizeUserInput } from '@/lib/inputSanitization';
import { sendRegistrationEmail } from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting prüfen
    const rateLimit = checkRateLimit(request, rateLimitConfigs.register);
    
    if (!rateLimit.success) {
      const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime);
      return NextResponse.json(
        { error: 'Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut.' },
        { 
          status: 429,
          headers
        }
      );
    }

    const rawData = await request.json();
    const { password, acceptTerms = false, acceptPrivacy = false } = rawData;

    // Input sanitization
    let sanitizedInput;
    try {
      sanitizedInput = sanitizeUserInput(rawData);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Validierung
    if (!sanitizedInput.email || !password || !sanitizedInput.firstName || !sanitizedInput.lastName) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    if (!acceptTerms || !acceptPrivacy) {
      return NextResponse.json(
        { error: 'AGB und Datenschutz müssen akzeptiert werden' },
        { status: 400 }
      );
    }

    // Starke Passwort-Validierung
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Passwort erfüllt nicht die Sicherheitsanforderungen',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedInput.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 409 }
      );
    }

    // Prüfe ob Customer bereits existiert
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: sanitizedInput.email }
    });

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaktion: User, Profile und Customer erstellen
    const result = await prisma.$transaction(async (tx) => {
      // User erstellen
      const user = await tx.user.create({
        data: {
          email: sanitizedInput.email,
          password: hashedPassword,
          role: 'CUSTOMER',
          profile: {
            create: {
              firstName: sanitizedInput.firstName,
              lastName: sanitizedInput.lastName,
              phone: sanitizedInput.phone,
              address: sanitizedInput.address,
              city: sanitizedInput.city,
              postalCode: sanitizedInput.postalCode,
              country: 'Österreich'
            }
          }
        },
        include: {
          profile: true
        }
      });

      // Customer aktualisieren oder erstellen
      if (existingCustomer) {
        // Verknüpfe bestehenden Customer mit neuem User
        await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { userId: user.id }
        });
      } else {
        // Erstelle neuen Customer
        await tx.customer.create({
          data: {
            userId: user.id,
            firstName: sanitizedInput.firstName,
            lastName: sanitizedInput.lastName,
            email: sanitizedInput.email,
            phone: sanitizedInput.phone,
            address: sanitizedInput.address,
            city: sanitizedInput.city,
            postalCode: sanitizedInput.postalCode,
            country: 'Österreich'
          }
        });
      }

      return user;
    });

    // Generiere Verification Token für Double Opt-in
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Speichere Token (vereinfacht - in Produktion sollte das in der DB gespeichert werden)
    // Für jetzt senden wir die E-Mail ohne Token-Speicherung
    
    // Sende Registrierungs-E-Mail mit Double Opt-in
    try {
      const customerName = `${sanitizedInput.firstName} ${sanitizedInput.lastName}`;
      await sendRegistrationEmail(sanitizedInput.email, customerName, verificationToken);
      console.log('✅ Registrierungs-E-Mail gesendet');
    } catch (emailError) {
      console.error('❌ Fehler beim Senden der Registrierungs-E-Mail:', emailError);
      // E-Mail-Fehler sollen die Registrierung nicht blockieren
    }

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Prüfen Sie Ihre E-Mails zur Bestätigung.',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        profile: result.profile
      }
    });

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung' },
      { status: 500 }
    );
  }
}
