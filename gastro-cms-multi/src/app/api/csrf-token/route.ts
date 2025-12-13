import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, csrfConfig } from '@/lib/csrf-simple';

export async function GET(request: NextRequest) {
  try {
    // CSRF-Token generieren
    const csrfToken = generateCSRFToken();
    
    const response = NextResponse.json({ 
      csrfToken,
      cookieName: csrfConfig.cookieName
    });

    // CSRF-Token als Cookie setzen
    response.cookies.set(csrfConfig.cookieName, csrfToken, csrfConfig.cookieOptions);

    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des CSRF-Tokens' },
      { status: 500 }
    );
  }
}
