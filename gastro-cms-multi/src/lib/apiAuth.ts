// API Authentication Middleware
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './database';
import { validateApiKey, recordApiUsage } from './apiKeyManagement.server';
import { createApiKeyRateLimiter, addRateLimitHeaders, RATE_LIMIT_PRESETS } from './rateLimiting';
import { validateSession } from './sessionManagement';
import { getTenant } from '@/lib/tenant';

// Audit logging
const AUDIT_ACTIONS = {
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  API_KEY_USAGE: 'API_KEY_USAGE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

function auditSecurityEvent(action: string, userId?: number, details?: any, ip?: string) {
  console.log(`[SECURITY AUDIT] ${action}:`, {
    timestamp: new Date().toISOString(),
    userId,
    ip,
    details
  });
}

function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('🚨 JWT_SECRET not configured in environment variables');
    console.error('🔧 Set JWT_SECRET in Vercel Dashboard -> Project Settings -> Environment Variables');
    throw new Error('JWT_SECRET not configured - check Vercel environment variables');
  }

  if (secret === 'fallback-secret-key' || secret.length < 32) {
    console.error('🚨 JWT_SECRET is using fallback or too short');
    console.error('🔧 Generate secure secret with: openssl rand -base64 64');
    throw new Error('JWT_SECRET must be at least 32 characters and not use fallback value');
  }

  return jwt.verify(token, secret) as any;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    email: string;
    role: string;
    tenantId: string;
  };
};

export interface AuthOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  allowPublicRead?: boolean; // Für GET-Requests ohne Auth
}

// Standard-Rollen-Hierarchie
const ROLE_HIERARCHY = {
  'ADMIN': 4,
  'RESTAURANT_MANAGER': 3,
  'DELIVERY_DRIVER': 2,
  'CUSTOMER': 1,
  'GUEST': 0
};

function hasRequiredRole(userRole: string, allowedRoles: string[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  return allowedRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
  });
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export function withAuth(options: AuthOptions = {}) {
  return async function authMiddleware(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const {
      requireAuth = true,
      allowedRoles = [],
      allowPublicRead = false
    } = options;

    // Öffentliche GET-Requests erlauben (z.B. Produktkatalog)
    if (allowPublicRead && request.method === 'GET' && !requireAuth) {
      return handler(request as AuthenticatedRequest);
    }

    // Authentifizierung prüfen
    if (requireAuth) {
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        auditSecurityEvent(
          AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
          undefined,
          {
            endpoint: request.url,
            method: request.method,
            reason: 'No token provided'
          },
          getClientIP(request)
        );

        return NextResponse.json(
          { error: 'Authentifizierung erforderlich' },
          { status: 401 }
        );
      }

      try {
        const decoded = verifyToken(token);

        const tenant = await getTenant();

        // Tenant Integrity Check
        if (tenant && decoded.tenantId && decoded.tenantId !== tenant.id) {
          throw new Error("Token tenant mismatch");
        }

        // Rollen-basierte Zugriffskontrolle
        if (allowedRoles.length > 0 && !hasRequiredRole(decoded.role, allowedRoles)) {
          auditSecurityEvent(
            AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
            decoded.userId,
            {
              endpoint: request.url,
              method: request.method,
              userRole: decoded.role,
              requiredRoles: allowedRoles,
              reason: 'Insufficient permissions'
            },
            getClientIP(request)
          );

          return NextResponse.json(
            { error: 'Keine Berechtigung für diese Aktion' },
            { status: 403 }
          );
        }

        // User-Informationen an Request anhängen
        (request as AuthenticatedRequest).user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          tenantId: decoded.tenantId
        };

      } catch (error) {
        auditSecurityEvent(
          AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
          undefined,
          {
            endpoint: request.url,
            method: request.method,
            reason: 'Invalid token'
          },
          getClientIP(request)
        );

        return NextResponse.json(
          { error: 'Ungültiger oder abgelaufener Token' },
          { status: 401 }
        );
      }
    }

    return handler(request as AuthenticatedRequest);
  };
}

// Vordefinierte Auth-Konfigurationen
export const AUTH_CONFIGS = {
  // Nur Admins
  ADMIN_ONLY: {
    requireAuth: true,
    allowedRoles: ['ADMIN']
  },

  // Admins und Restaurant Manager
  ADMIN_MANAGER: {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
  },

  // Alle authentifizierten Benutzer
  AUTHENTICATED: {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER', 'DELIVERY_DRIVER', 'CUSTOMER']
  },

  // Öffentlicher Lesezugriff, Auth für Schreibzugriff
  PUBLIC_READ: {
    requireAuth: false,
    allowPublicRead: true
  },

  // Kunden und höher
  CUSTOMER_PLUS: {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER', 'DELIVERY_DRIVER', 'CUSTOMER']
  }
};

// Helper-Funktion für einfache Verwendung mit Rate Limiting
export function createProtectedHandler(
  config: AuthOptions & { enableRateLimit?: boolean; rateLimitPreset?: keyof typeof RATE_LIMIT_PRESETS },
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  const authMiddleware = withAuth(config);

  // Rate Limiter erstellen falls aktiviert
  const rateLimiter = config.enableRateLimit
    ? createApiKeyRateLimiter(RATE_LIMIT_PRESETS[config.rateLimitPreset || 'STANDARD'])
    : null;

  return async (request: NextRequest) => {
    // Rate Limiting prüfen
    if (rateLimiter) {
      const rateLimitResponse = await rateLimiter(request);
      if (rateLimitResponse) {
        auditSecurityEvent(
          AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
          undefined,
          { endpoint: request.url, method: request.method },
          getClientIP(request)
        );
        return rateLimitResponse;
      }
    }

    // Authentifizierung und Handler ausführen
    const response = await authMiddleware(request, handler);

    // Rate Limit Headers hinzufügen
    return addRateLimitHeaders(response, request);
  };
}
