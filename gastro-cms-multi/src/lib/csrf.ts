// Robuste CSRF Protection mit Session-basierter Validierung
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { prisma } from './database';

// CSRF Secret aus Umgebungsvariablen laden
const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET || CSRF_SECRET.length < 32) {
  console.warn('CSRF_SECRET nicht gesetzt oder zu kurz, verwende Fallback');
  // Fallback für Development
  const fallbackSecret = 'fallback-csrf-secret-for-development-only-32-chars';
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CSRF_SECRET muss in Production gesetzt sein');
  }
  // @ts-ignore - Fallback für Development
  process.env.CSRF_SECRET = fallbackSecret;
}

// In-Memory Store für CSRF-Token (in Production sollte Redis verwendet werden)
const csrfTokenStore = new Map<string, {
  token: string;
  userId?: number;
  expiresAt: number;
  createdAt: number;
}>();

// Cleanup abgelaufene Token alle 5 Minuten
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of csrfTokenStore.entries()) {
    if (entry.expiresAt < now) {
      csrfTokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface CSRFTokenData {
  token: string;
  userId?: number;
  expiresAt: number;
  createdAt: number;
}

// Generiere sicheren CSRF-Token mit HMAC-Signatur
export function generateCSRFToken(userId?: number): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const data = `${timestamp}:${randomBytes}:${userId || 'anonymous'}`;
  
  // Erstelle HMAC-Signatur
  const hmac = crypto.createHmac('sha256', CSRF_SECRET!);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  // Token = data + signature
  const token = Buffer.from(`${data}:${signature}`).toString('base64');
  
  // Token im Store speichern
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 Stunden
  csrfTokenStore.set(token, {
    token,
    userId,
    expiresAt,
    createdAt: Date.now()
  });
  
  return token;
}

// Validiere CSRF-Token mit HMAC-Verifikation
export function verifyCSRFToken(token: string, userId?: number): boolean {
  try {
    // Token dekodieren
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) {
      return false;
    }
    
    const [timestamp, randomBytes, tokenUserId, signature] = parts;
    
    // Prüfe Token-Alter (max. 24 Stunden)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false;
    }
    
    // Rekonstruiere Daten für HMAC-Verifikation
    const data = `${timestamp}:${randomBytes}:${tokenUserId}`;
    
    // Verifiziere HMAC-Signatur
    const hmac = crypto.createHmac('sha256', CSRF_SECRET!);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    // Prüfe User-ID falls angegeben
    if (userId && tokenUserId !== userId.toString()) {
      return false;
    }
    
    // Prüfe ob Token im Store existiert und noch gültig ist
    const storedToken = csrfTokenStore.get(token);
    if (!storedToken || storedToken.expiresAt < Date.now()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF Token validation error:', error);
    return false;
  }
}

// CSRF-Token aus Request extrahieren
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Priorität: Header > Body > Cookie
  const headerToken = request.headers.get('x-csrf-token') || 
                     request.headers.get('csrf-token');
  
  if (headerToken) {
    return headerToken;
  }
  
  // Aus Body extrahieren (für POST-Requests)
  try {
    const body = request.body;
    if (body && typeof body === 'object' && 'csrfToken' in body) {
      return (body as any).csrfToken;
    }
  } catch (error) {
    // Body ist nicht verfügbar (z.B. bei GET-Requests)
  }
  
  // Aus Cookie extrahieren
  const cookieToken = request.cookies.get('csrf-token')?.value;
  return cookieToken || null;
}

// CSRF-Token für Session invalidieren
export function invalidateCSRFToken(token: string): boolean {
  return csrfTokenStore.delete(token);
}

// Alle CSRF-Token für einen User invalidieren
export function invalidateUserCSRFTokens(userId: number): number {
  let count = 0;
  for (const [key, entry] of csrfTokenStore.entries()) {
    if (entry.userId === userId) {
      csrfTokenStore.delete(key);
      count++;
    }
  }
  return count;
}

// CSRF-Token-Statistiken
export function getCSRFStats(): {
  totalTokens: number;
  activeTokens: number;
  expiredTokens: number;
} {
  const now = Date.now();
  let activeTokens = 0;
  let expiredTokens = 0;
  
  for (const entry of csrfTokenStore.values()) {
    if (entry.expiresAt < now) {
      expiredTokens++;
    } else {
      activeTokens++;
    }
  }
  
  return {
    totalTokens: csrfTokenStore.size,
    activeTokens,
    expiredTokens
  };
}

// CSRF-Middleware für API-Routen
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
  
  if (!verifyCSRFToken(token, userId)) {
    return {
      valid: false,
      error: 'Ungültiger oder abgelaufener CSRF-Token'
    };
  }
  
  return { valid: true };
}

// CSRF-Konfiguration
export const csrfConfig = {
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: false, // CSRF-Token muss für JavaScript zugänglich sein
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 Stunden
    path: '/'
  },
  tokenLength: 64,
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 Stunden in Millisekunden
  cleanupInterval: 5 * 60 * 1000 // 5 Minuten
};

// CSRF-Token für Frontend generieren (mit Session-Info)
export function generateFrontendCSRFToken(sessionId?: string, userId?: number): {
  token: string;
  expiresAt: number;
} {
  const token = generateCSRFToken(userId);
  const expiresAt = Date.now() + csrfConfig.tokenExpiry;
  
  return {
    token,
    expiresAt
  };
}
