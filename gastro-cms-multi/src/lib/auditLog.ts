// Persistente Audit Logging System mit Datenbank-Integration
import { prisma } from './database';
import { logInfo, logWarn, logError } from './secureLogging';

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  success: boolean;
  timestamp: Date;
}

// Fallback In-Memory Store für Notfälle
const auditStore: AuditLogEntry[] = [];
const MAX_AUDIT_ENTRIES = 1000; // Reduziert, da wir jetzt Datenbank verwenden

// Audit-Event-Typen
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_ACTIVATE: 'USER_ACTIVATE',
  USER_DEACTIVATE: 'USER_DEACTIVATE',
  
  // Profile Management
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PROFILE_VIEW: 'PROFILE_VIEW',
  
  // Security Events
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_BLACKLIST: 'TOKEN_BLACKLIST',
  CSRF_VIOLATION: 'CSRF_VIOLATION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  
  // System Events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIG_CHANGE: 'CONFIG_CHANGE'
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// Audit-Log erstellen mit persistenter Speicherung
export async function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date()
  };
  
  try {
    // Primär: Datenbank-Speicherung
    await prisma.auditLog.create({
      data: {
        action: auditEntry.action,
        userId: auditEntry.userId,
        ipAddress: auditEntry.ip,
        userAgent: auditEntry.userAgent,
        details: auditEntry.details ? JSON.stringify(auditEntry.details) : undefined,
        severity: auditEntry.success ? 'INFO' : 'WARN',
        timestamp: auditEntry.timestamp
      }
    });
    
    // Logging basierend auf Erfolg/Fehler
    if (auditEntry.success) {
      logInfo(`Audit: ${auditEntry.action}`, {
        userId: auditEntry.userId,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        details: auditEntry.details
      });
    } else {
      logWarn(`Audit Failed: ${auditEntry.action}`, {
        userId: auditEntry.userId,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        details: auditEntry.details,
        ip: auditEntry.ip
      });
    }
  } catch (error) {
    // Fallback: In-Memory Store bei Datenbankfehlern
    console.error('Database audit log failed, using fallback:', error);
    
    auditStore.push(auditEntry);
    
    // Memory-Cleanup wenn zu viele Einträge
    if (auditStore.length > MAX_AUDIT_ENTRIES) {
      auditStore.shift();
    }
    
    // Logging auch bei Fallback
    if (auditEntry.success) {
      logInfo(`Audit (Fallback): ${auditEntry.action}`, {
        userId: auditEntry.userId,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        details: auditEntry.details
      });
    } else {
      logWarn(`Audit Failed (Fallback): ${auditEntry.action}`, {
        userId: auditEntry.userId,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        details: auditEntry.details,
        ip: auditEntry.ip
      });
    }
  }
}

// Convenience-Funktionen für häufige Audit-Events (async)
export async function auditLogin(userId: number, email: string, ip?: string, success: boolean = true) {
  await createAuditLog({
    userId,
    action: success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN_FAILED,
    resource: 'auth',
    details: { email },
    ip,
    success
  });
}

export async function auditLogout(userId: number, ip?: string) {
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.LOGOUT,
    resource: 'auth',
    ip,
    success: true
  });
}

export async function auditUserAction(
  action: AuditAction,
  performedBy: number,
  targetUserId?: number,
  details?: Record<string, any>,
  ip?: string
) {
  await createAuditLog({
    userId: performedBy,
    action,
    resource: 'user',
    resourceId: targetUserId,
    details,
    ip,
    success: true
  });
}

export async function auditSecurityEvent(
  action: AuditAction,
  userId?: number,
  details?: Record<string, any>,
  ip?: string
) {
  await createAuditLog({
    userId,
    action,
    resource: 'security',
    details,
    ip,
    success: false // Security events sind meist Fehlerfälle
  });
}

// Audit-Logs abrufen (für Admin-Interface) - Persistente Datenbank-Abfrage
export async function getAuditLogs(filters?: {
  userId?: number;
  action?: AuditAction;
  resource?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLogEntry[]> {
  try {
    // Datenbank-Abfrage mit Filtern
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.action) {
      where.action = filters.action;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }
    
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0
    });
    
    // Konvertiere zu AuditLogEntry-Format
    return logs.map(log => ({
      userId: log.userId || undefined,
      action: log.action,
      resource: 'system', // Wird aus action abgeleitet
      details: log.details ? JSON.parse(log.details as string) : undefined,
      ip: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      success: log.severity === 'INFO',
      timestamp: log.timestamp
    }));
    
  } catch (error) {
    console.error('Database audit log query failed, using fallback:', error);
    
    // Fallback: In-Memory Store
    let logs = [...auditStore];
    
    // Filter anwenden
    if (filters?.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    if (filters?.action) {
      logs = logs.filter(log => log.action === filters.action);
    }
    
    if (filters?.resource) {
      logs = logs.filter(log => log.resource === filters.resource);
    }
    
    // Sortierung (neueste zuerst)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 100;
    
    return logs.slice(offset, offset + limit);
  }
}

// Statistiken für Dashboard - Persistente Datenbank-Abfrage
export async function getAuditStats(): Promise<{
  totalEvents: number;
  recentLogins: number;
  failedLogins: number;
  securityEvents: number;
  last24hEvents: number;
  last7dEvents: number;
}> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Parallele Datenbank-Abfragen
    const [
      totalEvents,
      last24hLogins,
      last24hFailedLogins,
      last24hSecurityEvents,
      last24hEvents,
      last7dEvents
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          action: AUDIT_ACTIONS.LOGIN,
          timestamp: { gte: last24h }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: AUDIT_ACTIONS.LOGIN_FAILED,
          timestamp: { gte: last24h }
        }
      }),
      prisma.auditLog.count({
        where: {
          severity: 'WARN',
          timestamp: { gte: last24h }
        }
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: last24h }
        }
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: last7d }
        }
      })
    ]);
    
    return {
      totalEvents,
      recentLogins: last24hLogins,
      failedLogins: last24hFailedLogins,
      securityEvents: last24hSecurityEvents,
      last24hEvents,
      last7dEvents
    };
    
  } catch (error) {
    console.error('Database audit stats query failed, using fallback:', error);
    
    // Fallback: In-Memory Store
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = auditStore.filter(log => log.timestamp >= last24h);
    
    return {
      totalEvents: auditStore.length,
      recentLogins: recentLogs.filter(log => log.action === AUDIT_ACTIONS.LOGIN).length,
      failedLogins: recentLogs.filter(log => log.action === AUDIT_ACTIONS.LOGIN_FAILED).length,
      securityEvents: recentLogs.filter(log => log.resource === 'security').length,
      last24hEvents: recentLogs.length,
      last7dEvents: auditStore.length // Approximation
    };
  }
}

// Cleanup alte Audit-Logs (sollte regelmäßig aufgerufen werden) - Persistente Datenbank-Bereinigung
export async function cleanupOldAuditLogs(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = new Date(Date.now() - maxAge);
  
  try {
    // Datenbank-Bereinigung
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoff
        }
      }
    });
    
    if (result.count > 0) {
      logInfo(`Database audit cleanup: ${result.count} old entries removed`);
    }
    
    // Fallback In-Memory Store auch bereinigen
    const initialLength = auditStore.length;
    for (let i = auditStore.length - 1; i >= 0; i--) {
      if (auditStore[i].timestamp < cutoff) {
        auditStore.splice(i, 1);
      }
    }
    
    const memoryRemoved = initialLength - auditStore.length;
    if (memoryRemoved > 0) {
      logInfo(`Memory audit cleanup: ${memoryRemoved} old entries removed`);
    }
    
  } catch (error) {
    console.error('Database audit cleanup failed:', error);
    
    // Fallback: Nur In-Memory Store bereinigen
    const initialLength = auditStore.length;
    for (let i = auditStore.length - 1; i >= 0; i--) {
      if (auditStore[i].timestamp < cutoff) {
        auditStore.splice(i, 1);
      }
    }
    
    const removed = initialLength - auditStore.length;
    if (removed > 0) {
      logInfo(`Fallback audit cleanup: ${removed} old entries removed`);
    }
  }
}

// Automatische Bereinigung alle 6 Stunden
setInterval(() => {
  cleanupOldAuditLogs().catch(error => {
    console.error('Scheduled audit cleanup failed:', error);
  });
}, 6 * 60 * 60 * 1000);
