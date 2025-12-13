import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Vereinfachte Login-API ohne Sessions für Vercel-Deployment
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Vereinfachter Login gestartet...');
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    console.log('📧 Suche User:', email);

    // Direkte Prisma-Verbindung ohne Sessions
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true
      }
    });

    console.log('👤 User gefunden:', user ? 'Ja' : 'Nein');

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Ihr Konto ist deaktiviert' },
        { status: 401 }
      );
    }

    console.log('🔑 Prüfe Passwort...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    console.log('✅ Passwort korrekt');

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    console.log('🎫 Erstelle JWT Token...');
    
    // Erstelle JWT Token ohne Session-ID
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    console.log('🎉 Login erfolgreich!');

    return NextResponse.json({
      success: true,
      message: 'Erfolgreich angemeldet',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    });

  } catch (error) {
    console.error('❌ Login-Fehler:', error);
    console.error('Error details:', {
      name: error?.constructor?.name,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
