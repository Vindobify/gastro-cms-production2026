import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/database';

// GET - Einzelnen Benutzer abrufen (nur für Admins)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('🚨 JWT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error - JWT_SECRET not set' },
        { status: 500 }
      );
    }
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Benutzer-ID' },
        { status: 400 }
      );
    }

    // Benutzer abrufen
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// PATCH - Benutzer bearbeiten (nur für Admins)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('🚨 JWT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error - JWT_SECRET not set' },
        { status: 500 }
      );
    }
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Benutzer-ID' },
        { status: 400 }
      );
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone, 
      address, 
      city, 
      postalCode,
      isActive
    } = await request.json();

    // Validierung
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits existiert (außer bei diesem Benutzer)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        id: { not: id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 409 }
      );
    }

    // Transaktion: User und Profile aktualisieren
    const result = await prisma.$transaction(async (tx: any) => {
      // Update-Daten vorbereiten
      const updateData: any = {
        email: email.toLowerCase(),
        role: role,
        isActive: isActive
      };

      // Passwort nur aktualisieren wenn angegeben
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      // User aktualisieren
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        include: {
          profile: true
        }
      });

      // Profile aktualisieren
      await tx.userProfile.update({
        where: { userId: id },
        data: {
          firstName,
          lastName,
          phone,
          address,
          city,
          postalCode,
          country: 'Österreich'
        }
      });

      return user;
    });

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich aktualisiert',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        isActive: result.isActive,
        profile: result.profile
      }
    });

  } catch (error) {
    console.error('Fehler beim Bearbeiten des Benutzers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Bearbeiten des Benutzers' },
      { status: 500 }
    );
  }
}

// DELETE - Benutzer löschen (nur für Admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('🚨 JWT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error - JWT_SECRET not set' },
        { status: 500 }
      );
    }
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Benutzer-ID' },
        { status: 400 }
      );
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: { select: { firstName: true, lastName: true } }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Benutzer sich selbst löschen möchte
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'Sie können sich nicht selbst löschen' },
        { status: 400 }
      );
    }

    // Soft-Delete: Benutzer deaktivieren statt löschen
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${existingUser.email}` // Email freigeben
      }
    });

    console.log(`🗑️ Admin hat Benutzer ${existingUser.profile?.firstName} ${existingUser.profile?.lastName} gelöscht`);

    return NextResponse.json({
      success: true,
      message: `Benutzer ${existingUser.profile?.firstName} ${existingUser.profile?.lastName} wurde erfolgreich gelöscht`
    });

  } catch (error) {
    console.error('Fehler beim Löschen des Benutzers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Benutzers' },
      { status: 500 }
    );
  }
}
