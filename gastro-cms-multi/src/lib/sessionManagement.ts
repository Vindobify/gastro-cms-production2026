// Database-basiertes Session Management
import { NextRequest } from 'next/server';
import { prisma } from './database';
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

// Session in Datenbank erstellen
export async function createSession(userId: number, role: string, token: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionTimeoutConfig.maxSessionTime);
  
  await prisma.session.create({
    data: {
      sessionId,
      userId,
      role,
      token,
      expiresAt,
      lastActivity: now,
      sessionStart: now,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      isActive: true
    }
  });
  
  return sessionId;
}

// Session aus Datenbank validieren
export async function validateSession(request: NextRequest): Promise<{
  isValid: boolean;
  userId?: number;
  role?: string;
  reason?: string;
}> {
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

    // Session aus Datenbank laden
    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: { user: true }
    });

    if (!session || !session.isActive) {
      return { isValid: false, reason: 'Session not found or inactive' };
    }

    const now = new Date();
    
    // Prüfe Ablaufzeit
    if (now > session.expiresAt) {
      await prisma.session.update({
        where: { sessionId },
        data: { isActive: false }
      });
      return { isValid: false, reason: 'Session expired' };
    }
    
    // Prüfe maximale Inaktivitätszeit
    const lastActivity = new Date(session.lastActivity);
    if (now.getTime() - lastActivity.getTime() > sessionTimeoutConfig.maxIdleTime) {
      await prisma.session.update({
        where: { sessionId },
        data: { isActive: false }
      });
      return { isValid: false, reason: 'Session expired due to inactivity' };
    }
    
    // Prüfe maximale Gesamtsitzungszeit
    const sessionStart = new Date(session.sessionStart);
    if (now.getTime() - sessionStart.getTime() > sessionTimeoutConfig.maxSessionTime) {
      await prisma.session.update({
        where: { sessionId },
        data: { isActive: false }
      });
      return { isValid: false, reason: 'Session expired due to maximum time limit' };
    }

    // Session ist gültig - aktualisiere letzte Aktivität
    await prisma.session.update({
      where: { sessionId },
      data: { lastActivity: now }
    });

    return {
      isValid: true,
      userId: session.userId,
      role: session.role
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return { isValid: false, reason: 'Token validation failed' };
  }
}

// Session aus Datenbank löschen
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { sessionId },
    data: { isActive: false }
  });
}

// Alle Sessions eines Benutzers löschen
export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { isActive: false }
  });
}

// Abgelaufene Sessions bereinigen
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();
  
  await prisma.session.updateMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { 
          AND: [
            { isActive: true },
            { 
              lastActivity: { 
                lt: new Date(now.getTime() - sessionTimeoutConfig.maxIdleTime) 
              } 
            }
          ]
        },
        {
          AND: [
            { isActive: true },
            { 
              sessionStart: { 
                lt: new Date(now.getTime() - sessionTimeoutConfig.maxSessionTime) 
              } 
            }
          ]
        }
      ]
    },
    data: { isActive: false }
  });
}

// Session-ID generieren
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Automatische Bereinigung alle 15 Minuten
setInterval(cleanupExpiredSessions, 15 * 60 * 1000);
