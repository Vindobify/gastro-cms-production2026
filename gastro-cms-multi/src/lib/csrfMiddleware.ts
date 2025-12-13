// CSRF-Middleware für API-Routen
import { NextRequest, NextResponse } from 'next/server';
import { requireCSRFToken, generateCSRFToken, csrfConfig } from './csrf';
import { verifyToken } from './jwt';

// CSRF-geschützte API-Routen
const CSRF_PROTECTED_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/users',
  '/api/products',
  '/api/categories',
  '/api/orders',
  '/api/coupons',
  '/api/customers',
  '/api/settings',
  '/api/media/upload',
  '/api/delivery-drivers'
];

// Routen die von CSRF-Schutz ausgenommen sind
const CSRF_EXEMPT_ROUTES = [
  '/api/health',
  '/api/seed',
  '/api/init',
  '/api/test',
  '/api/test-db',
  '/api/csrf-token'
];

// HTTP-Methoden die CSRF-Schutz benötigen
const CSRF_REQUIRED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function withCSRFProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { pathname, method } = request.nextUrl;
    
    // Prüfe ob Route CSRF-Schutz benötigt
    if (!shouldProtectRoute(pathname, method)) {
      return handler(request);
    }
    
    // Extrahiere User-ID aus JWT-Token falls vorhanden
    let userId: number | undefined;
    try {
      const token = request.cookies.get('auth-token')?.value;
      if (token) {
        const decoded = verifyToken(token);
        userId = decoded.userId;
      }
    } catch (error) {
      // Token ist ungültig, aber CSRF-Schutz trotzdem anwenden
    }
    
    // CSRF-Token validieren
    const csrfValidation = requireCSRFToken(request, userId);
    
    if (!csrfValidation.valid) {
      return NextResponse.json(
        {
          error: 'CSRF-Schutz aktiviert',
          message: csrfValidation.error,
          code: 'CSRF_TOKEN_REQUIRED'
        },
        { 
          status: 403,
          headers: {
            'X-CSRF-Required': 'true'
          }
        }
      );
    }
    
    // CSRF-Token ist gültig, Handler ausführen
    return handler(request);
  };
}

// Prüfe ob Route CSRF-Schutz benötigt
function shouldProtectRoute(pathname: string, method: string): boolean {
  // Prüfe HTTP-Methode
  if (!CSRF_REQUIRED_METHODS.includes(method)) {
    return false;
  }
  
  // Prüfe ob Route ausgenommen ist
  if (CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Prüfe ob Route geschützt werden soll
  return CSRF_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// CSRF-Token für Frontend bereitstellen
export async function GET(request: NextRequest) {
  try {
    // Extrahiere User-ID aus JWT-Token
    let userId: number | undefined;
    try {
      const token = request.cookies.get('auth-token')?.value;
      if (token) {
        const decoded = verifyToken(token);
        userId = decoded.userId;
      }
    } catch (error) {
      // Token ist ungültig, anonymen Token generieren
    }
    
    // CSRF-Token generieren
    const csrfToken = generateCSRFToken(userId);
    
    // Response mit CSRF-Token
    const response = NextResponse.json({
      csrfToken,
      expiresAt: Date.now() + csrfConfig.tokenExpiry
    });
    
    // CSRF-Token als Cookie setzen
    response.cookies.set(csrfConfig.cookieName, csrfToken, csrfConfig.cookieOptions);
    
    return response;
  } catch (error) {
    console.error('CSRF Token generation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des CSRF-Tokens' },
      { status: 500 }
    );
  }
}

// CSRF-Statistiken für Admin
export async function getCSRFStats() {
  const { getCSRFStats } = await import('./csrf');
  return getCSRFStats();
}

// CSRF-Token für alle User invalidieren (Admin-Funktion)
export async function invalidateAllCSRFTokens() {
  const { invalidateUserCSRFTokens } = await import('./csrf');
  
  // Hier könntest du alle User-IDs aus der Datenbank laden
  // und deren CSRF-Token invalidieren
  // Für jetzt ist es eine Placeholder-Implementierung
  
  return {
    message: 'CSRF-Token-Invalidierung nicht implementiert',
    note: 'Implementierung erfordert Datenbankzugriff auf alle User-IDs'
  };
}
