// Session Timeout Management
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export interface SessionTimeoutConfig {
  maxIdleTime: number; // Maximale Inaktivitätszeit in Millisekunden
  maxSessionTime: number; // Maximale Gesamtsitzungszeit in Millisekunden
}

export const sessionTimeoutConfig: SessionTimeoutConfig = {
  maxIdleTime: parseInt(process.env.SESSION_IDLE_TIMEOUT || '1800000'), // 30 Minuten
  maxSessionTime: parseInt(process.env.SESSION_MAX_TIMEOUT || '86400000'), // 24 Stunden
};

interface SessionInfo {
  userId: number;
  lastActivity: number;
  sessionStart: number;
  role: string;
}

// In-Memory Session Store (in Production sollte Redis verwendet werden)
const sessionStore = new Map<string, SessionInfo>();

export function createSession(userId: number, role: string): string {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  sessionStore.set(sessionId, {
    userId,
    lastActivity: now,
    sessionStart: now,
    role
  });
  
  return sessionId;
}

export function validateSession(request: NextRequest): {
  isValid: boolean;
  userId?: number;
  role?: string;
  reason?: string;
} {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return { isValid: false, reason: 'No token provided' };
    }

    // JWT Token validieren
    const decoded = verifyToken(token);
    const sessionId = decoded.sessionId;
    
    if (!sessionId) {
      return { isValid: false, reason: 'No session ID in token' };
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return { isValid: false, reason: 'Session not found' };
    }

    const now = Date.now();
    
    // Prüfe maximale Inaktivitätszeit
    if (now - session.lastActivity > sessionTimeoutConfig.maxIdleTime) {
      sessionStore.delete(sessionId);
      return { isValid: false, reason: 'Session expired due to inactivity' };
    }
    
    // Prüfe maximale Gesamtsitzungszeit
    if (now - session.sessionStart > sessionTimeoutConfig.maxSessionTime) {
      sessionStore.delete(sessionId);
      return { isValid: false, reason: 'Session expired due to maximum time limit' };
    }

    // Session ist gültig - aktualisiere letzte Aktivität
    session.lastActivity = now;
    sessionStore.set(sessionId, session);

    return {
      isValid: true,
      userId: session.userId,
      role: session.role
    };

  } catch (error) {
    return { isValid: false, reason: 'Token validation failed' };
  }
}

export function invalidateSession(sessionId: string): void {
  sessionStore.delete(sessionId);
}

export function invalidateAllUserSessions(userId: number): void {
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(sessionId);
    }
  }
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  
  for (const [sessionId, session] of sessionStore.entries()) {
    const isIdleExpired = now - session.lastActivity > sessionTimeoutConfig.maxIdleTime;
    const isMaxTimeExpired = now - session.sessionStart > sessionTimeoutConfig.maxSessionTime;
    
    if (isIdleExpired || isMaxTimeExpired) {
      sessionStore.delete(sessionId);
    }
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Automatische Bereinigung alle 15 Minuten
setInterval(cleanupExpiredSessions, 15 * 60 * 1000);
