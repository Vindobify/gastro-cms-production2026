import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Token aus Cookie oder Authorization-Header holen
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Prüfe Authorization-Header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // JWT Token verifizieren
    try {
      const decoded = verifyToken(token);
      
      // Benutzer aus Datenbank holen
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true
        }
      });

      if (!user) {
        return NextResponse.json({
          authenticated: false,
          user: null
        });
      }

      // Benutzer ist authentifiziert
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });

    } catch (jwtError) {
      // JWT ist ungültig oder abgelaufen
      console.error('JWT-Verifizierungsfehler:', jwtError);
      
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

  } catch (error) {
    console.error('Session-Fehler:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}
