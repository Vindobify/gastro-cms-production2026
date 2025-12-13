import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, checkIPBlocking, rateLimitConfigs } from './rateLimiting';

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Input validation patterns
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9\s\-_\.]+$/,
  numeric: /^\d+$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i
};

// Dangerous patterns to block
const dangerousPatterns = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /vbscript:/i,
  /data:text\/html/i,
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+set/i,
  /exec\s*\(/i,
  /system\s*\(/i,
  /shell_exec/i,
  /passthru/i,
  /proc_open/i,
  /popen/i
];

// Sanitize input
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        throw new Error('Potentially dangerous input detected');
      }
    }
    
    // Basic XSS protection
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Validate input against patterns
export function validateInput(input: string, type: keyof typeof patterns): boolean {
  return patterns[type].test(input);
}

// Check for SQL injection attempts
export function checkSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /or\s+1\s*=\s*1/i,
    /and\s+1\s*=\s*1/i,
    /'\s*or\s*'/i,
    /"\s*or\s*"/i,
    /;\s*drop/i,
    /'\s*;\s*--/i,
    /"\s*;\s*--/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Enhanced security middleware
export function withSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // 1. Check IP blocking
      if (!checkIPBlocking(req)) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403, headers: securityHeaders }
        );
      }
      
      // 2. Rate limiting
      const rateLimit = checkRateLimit(req, rateLimitConfigs.api);
      if (!rateLimit.success) {
        return NextResponse.json(
          { success: false, error: rateLimit.message },
          { 
            status: 429, 
            headers: {
              ...securityHeaders,
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      // 3. Check for suspicious headers
      const suspiciousHeaders = ['x-forwarded-host', 'x-originating-ip', 'x-remote-ip'];
      for (const header of suspiciousHeaders) {
        if (req.headers.get(header)) {
          console.warn(`Suspicious header detected: ${header}`);
        }
      }
      
      // 4. Validate content type for POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Invalid content type' },
            { status: 400, headers: securityHeaders }
          );
        }
      }
      
      // 5. Check request size
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        return NextResponse.json(
          { success: false, error: 'Request too large' },
          { status: 413, headers: securityHeaders }
        );
      }
      
      // 6. Sanitize request body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.json();
          const sanitizedBody = sanitizeInput(body);
          
          // Check for SQL injection in string fields
          const checkForSQLInjection = (obj: any): boolean => {
            if (typeof obj === 'string') {
              return checkSQLInjection(obj);
            }
            if (Array.isArray(obj)) {
              return obj.some(checkForSQLInjection);
            }
            if (typeof obj === 'object' && obj !== null) {
              return Object.values(obj).some(checkForSQLInjection);
            }
            return false;
          };
          
          if (checkForSQLInjection(sanitizedBody)) {
            return NextResponse.json(
              { success: false, error: 'Invalid input detected' },
              { status: 400, headers: securityHeaders }
            );
          }
          
          // Replace request body with sanitized version
          req.json = () => Promise.resolve(sanitizedBody);
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Invalid JSON' },
            { status: 400, headers: securityHeaders }
          );
        }
      }
      
      // 7. Call original handler
      const response = await handler(req);
      
      // 8. Add security headers to response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
      
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Security check failed' },
        { status: 500, headers: securityHeaders }
      );
    }
  };
}
