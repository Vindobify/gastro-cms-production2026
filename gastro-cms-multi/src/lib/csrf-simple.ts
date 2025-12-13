// Vereinfachte aber sichere CSRF-Implementation für Produktionseinsatz
import crypto from 'crypto';
import { NextRequest } from 'next/server';

// CSRF Secret aus Umgebungsvariablen laden
const CSRF_SECRET = process.env.CSRF_SECRET || 'fallback-csrf-secret-for-development-only-32-chars-long';

// In-Memory Token Store (in Production würde man Redis verwenden)
const csrfTokens = new Map<string, { expires: number; userId?: number }>();

// Cleanup-Funktion für abgelaufene Token
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(token);
    }
  }
}, 5 * 60 * 1000); // Alle 5 Minuten

export function generateCSRFToken(userId?: number): string {
  // Generiere einen einfachen, sicheren Token
  const tokenData = `${Date.now()}:${crypto.randomBytes(16).toString('hex')}:${userId || 'anonymous'}`;
  const signature = crypto.createHmac('sha256', CSRF_SECRET).update(tokenData).digest('hex');
  const token = Buffer.from(`${tokenData}:${signature}`).toString('base64');
  
  // Token speichern mit 24h Ablaufzeit
  csrfTokens.set(token, {
    expires: Date.now() + (24 * 60 * 60 * 1000),
    userId
  });
  
  return token;
}

export function validateCSRFToken(token: string, userId?: number): boolean {
  try {
    // Prüfe ob Token im Store existiert
    const tokenData = csrfTokens.get(token);
    if (!tokenData) {
      console.log('CSRF: Token nicht im Store gefunden');
      return false;
    }
    
    // Prüfe Ablaufzeit
    if (tokenData.expires < Date.now()) {
      console.log('CSRF: Token abgelaufen');
      csrfTokens.delete(token);
      return false;
    }
    
    // Dekodiere und validiere Token-Struktur
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) {
      console.log('CSRF: Ungültige Token-Struktur');
      return false;
    }
    
    const [timestamp, randomBytes, tokenUserId, providedSignature] = parts;
    
    // Prüfe User-ID falls angegeben
    if (userId && tokenUserId !== userId.toString()) {
      console.log('CSRF: User-ID stimmt nicht überein');
      return false;
    }
    
    // Verifikation der Signatur
    const expectedData = `${timestamp}:${randomBytes}:${tokenUserId}`;
    const expectedSignature = crypto.createHmac('sha256', CSRF_SECRET).update(expectedData).digest('hex');
    
    if (providedSignature !== expectedSignature) {
      console.log('CSRF: Signatur ungültig');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('CSRF: Validierungsfehler:', error);
    return false;
  }
}

export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Priorität: Header > Cookie
  return request.headers.get('x-csrf-token') || 
         request.headers.get('csrf-token') ||
         request.cookies.get('csrf-token')?.value ||
         null;
}

export function requireCSRFToken(request: NextRequest, userId?: number): {
  valid: boolean;
  error?: string;
} {
  const token = getCSRFTokenFromRequest(request);
  
  if (!token) {
    return {
      valid: false,
      error: 'CSRF-Token fehlt'
    };
  }
  
  if (!validateCSRFToken(token, userId)) {
    return {
      valid: false,
      error: 'Ungültiger oder abgelaufener CSRF-Token'
    };
  }
  
  return { valid: true };
}

// Cookie-Konfiguration für CSRF-Token
export const csrfConfig = {
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: false, // Muss für JS-Zugriff false sein
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60, // 24 Stunden
    path: '/'
  }
};

export function getCSRFStats(): {
  totalTokens: number;
  activeTokens: number;
} {
  const now = Date.now();
  let activeTokens = 0;
  
  for (const [, data] of csrfTokens.entries()) {
    if (data.expires > now) {
      activeTokens++;
    }
  }
  
  return {
    totalTokens: csrfTokens.size,
    activeTokens
  };
}
