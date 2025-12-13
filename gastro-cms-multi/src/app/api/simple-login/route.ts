import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Einfache Login-API ohne Routing-Konflikte
export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🔐 Simple Login gestartet...');
    
    // Request Body parsen
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort erforderlich' },
        { status: 400 }
      );
    }

    // Prisma Client
    prisma = new PrismaClient();
    await prisma.$connect();

    // WICHTIG: Prüfe ob Tabellen existieren (Vercel /tmp ist ephemeral!)
    let tablesExist = false;
    try {
      await prisma.user.findFirst();
      tablesExist = true;
    } catch (error) {
      console.log('🔄 Tabellen existieren nicht, erstelle sie...');
      
      // Erstelle Users Tabelle
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "emailVerified" BOOLEAN NOT NULL DEFAULT false,
          "emailVerificationToken" TEXT,
          "passwordResetToken" TEXT,
          "passwordResetExpires" DATETIME,
          "lastLoginAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Erstelle User Profiles Tabelle (vollständig nach schema.prisma)
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "user_profiles" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL UNIQUE,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "phone" TEXT,
          "address" TEXT,
          "city" TEXT,
          "postalCode" TEXT,
          "country" TEXT NOT NULL DEFAULT 'Österreich',
          "avatar" TEXT,
          "preferences" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
        )
      `);

      // Erstelle Admin-User falls nicht vorhanden
      const adminEmail = 'office@gastro-cms.at';
      const adminPassword = 'ComPaq1987!';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO users (email, password, role, isActive, emailVerified, createdAt, updatedAt)
        VALUES (?, ?, 'ADMIN', 1, 1, datetime('now'), datetime('now'))
      `, adminEmail, hashedPassword);

      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO user_profiles (userId, firstName, lastName, country, createdAt, updatedAt)
        VALUES (1, 'Admin', 'Gastro-CMS', 'Österreich', datetime('now'), datetime('now'))
      `);

      console.log('✅ Auto-Initialisierung abgeschlossen');
    }

    // User suchen
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // Passwort prüfen
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // JWT erstellen
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET nicht gesetzt');
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(jwtSecret));

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Response mit Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login erfolgreich! 🎉',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      redirectUrl: '/dashboard'
    });

    // Auth-Cookie setzen
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 Tage
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Simple Login Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Login fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple Login API 🔐',
    instructions: 'POST mit {"email": "office@gastro-cms.at", "password": "ComPaq1987!"}',
    endpoint: 'POST /api/simple-login'
  });
}
