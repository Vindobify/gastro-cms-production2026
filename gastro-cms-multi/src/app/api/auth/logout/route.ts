import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { blacklistToken } from '@/lib/tokenBlacklist';

export async function POST(request: NextRequest) {
  try {
    // Token aus Cookie holen und zur Blacklist hinzufügen
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        // Token zur Blacklist hinzufügen (expires in 24h)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await blacklistToken(token, decoded.userId, expiresAt);
      } catch (error) {
        // Token bereits ungültig, trotzdem fortfahren
        console.log('Token bereits ungültig beim Logout');
      }
    }

    // Cookie löschen
    const response = NextResponse.json({
      success: true,
      message: 'Abmeldung erfolgreich'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout-Fehler:', error);
    
    // Auch bei Fehler Cookie löschen
    const response = NextResponse.json({
      success: true,
      message: 'Abmeldung erfolgreich'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/'
    });
    return response;
  }
}
