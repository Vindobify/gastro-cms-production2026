import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/jwt';
import { validatePassword } from '@/lib/passwordValidation';
import { sanitizeEmail, sanitizeName, sanitizePhone, sanitizeAddress, sanitizeCity, sanitizePostalCode } from '@/lib/inputSanitization';
import { applyRateLimit } from '@/lib/rateLimit';

// GET - Alle Benutzer abrufen (nur für Admins)
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // JWT Token verifizieren
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Alle Benutzer abrufen
    const users = await prisma.user.findMany({
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// POST - Neuen Benutzer erstellen (nur für Admins)
export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // JWT Token verifizieren
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const { 
      email: rawEmail, 
      password, 
      firstName: rawFirstName, 
      lastName: rawLastName, 
      role, 
      phone: rawPhone, 
      address: rawAddress, 
      city: rawCity, 
      postalCode: rawPostalCode,
      isActive = true
    } = await request.json();

    // Input Sanitization
    const email = sanitizeEmail(rawEmail);
    const firstName = sanitizeName(rawFirstName, 'firstName');
    const lastName = sanitizeName(rawLastName, 'lastName');
    const phone = rawPhone ? sanitizePhone(rawPhone) : undefined;
    const address = rawAddress ? sanitizeAddress(rawAddress) : undefined;
    const city = rawCity ? sanitizeCity(rawCity) : undefined;
    const postalCode = rawPostalCode ? sanitizePostalCode(rawPostalCode) : undefined;

    // Validierung
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    // Starke Passwort-Validierung
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: `Passwort-Anforderungen nicht erfüllt: ${passwordValidation.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 409 }
      );
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaktion: User und Profile erstellen
    const result = await prisma.$transaction(async (tx) => {
      // User erstellen
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role,
          isActive: isActive,
          profile: {
            create: {
              firstName,
              lastName,
              phone,
              address,
              city,
              postalCode,
              country: 'Österreich'
            }
          }
        },
        include: {
          profile: true
        }
      });

      return user;
    });

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich erstellt',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        isActive: result.isActive,
        profile: result.profile
      }
    });

  } catch (error) {
    console.error('Fehler beim Erstellen des Benutzers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Benutzers' },
      { status: 500 }
    );
  }
}
