// Sichere Logging-Utilities
interface LogData {
  [key: string]: any;
}

// Sensitive Felder die niemals geloggt werden sollen
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'csrf',
  'jwt',
  'hash',
  'salt'
];

// Email-Masking (zeige nur ersten 2 Zeichen + Domain)
function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '[MASKED]';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[MASKED]';
  return `${local.substring(0, 2)}***@${domain}`;
}

// IP-Masking (zeige nur erste 2 Oktette)
function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') return '[MASKED]';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.**`;
  }
  return '[MASKED]';
}

// Rekursive Bereinigung von Objekten
function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 10) return '[MAX_DEPTH]'; // Prevent infinite recursion
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Check if it looks like sensitive data
    const lower = obj.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lower.includes(field))) {
      return '[REDACTED]';
    }
    // Mask email-like strings
    if (obj.includes('@') && obj.includes('.')) {
      return maskEmail(obj);
    }
    return obj;
  }
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Sensitive Felder komplett entfernen
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Spezielle Behandlung für bekannte Felder
    if (lowerKey === 'email' && typeof value === 'string') {
      sanitized[key] = maskEmail(value);
    } else if (lowerKey === 'ip' && typeof value === 'string') {
      sanitized[key] = maskIP(value);
    } else if (lowerKey === 'user' && typeof value === 'object') {
      // User-Objekte bereinigen
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = sanitizeObject(value, depth + 1);
    }
  }
  
  return sanitized;
}

// Sichere Log-Funktionen
export function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: LogData) {
  const timestamp = new Date().toISOString();
  const sanitizedData = data ? sanitizeObject(data) : undefined;
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...(sanitizedData && { data: sanitizedData })
  };
  
  console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, sanitizedData || '');
}

export function logInfo(message: string, data?: LogData) {
  secureLog('info', message, data);
}

export function logWarn(message: string, data?: LogData) {
  secureLog('warn', message, data);
}

export function logError(message: string, error?: Error | LogData) {
  const errorData = error instanceof Error 
    ? { error: error.message, stack: error.stack }
    : error;
  
  secureLog('error', message, errorData);
}

// Auth-spezifische Logging-Funktionen
export function logAuthSuccess(action: string, userId: number, email: string, ip?: string) {
  logInfo(`Auth Success: ${action}`, {
    action,
    userId,
    email: maskEmail(email),
    ip: ip ? maskIP(ip) : undefined,
    timestamp: new Date().toISOString()
  });
}

export function logAuthFailure(action: string, email: string, reason: string, ip?: string) {
  logWarn(`Auth Failure: ${action}`, {
    action,
    email: maskEmail(email),
    reason,
    ip: ip ? maskIP(ip) : undefined,
    timestamp: new Date().toISOString()
  });
}

export function logSecurityEvent(event: string, details: LogData, severity: 'low' | 'medium' | 'high' = 'medium') {
  logWarn(`Security Event: ${event}`, {
    event,
    severity,
    details: sanitizeObject(details),
    timestamp: new Date().toISOString()
  });
}
