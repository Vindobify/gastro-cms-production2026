// Zentrale Authentifizierungs-Middleware mit Database-basiertem Session-Management
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './sessionManagement';
import { auditSecurityEvent, AUDIT_ACTIONS } from './auditLog';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: number;
    role: string;
  };
}

export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Session validieren
    const sessionResult = await validateSession(request);
    
    if (!sessionResult.isValid) {
      auditSecurityEvent(
        AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        undefined,
        {
          endpoint: request.url,
          method: request.method,
          reason: sessionResult.reason
        },
        request.headers.get('x-forwarded-for') || 'unknown'
      );
      
      return NextResponse.json(
        { error: 'Nicht authentifiziert', reason: sessionResult.reason },
        { status: 401 }
      );
    }

    // Authentifizierte Request erstellen
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: sessionResult.userId!,
      role: sessionResult.role!
    };

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentifizierungsfehler' },
      { status: 500 }
    );
  }
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Session validieren
    const sessionResult = await validateSession(request);
    
    if (!sessionResult.isValid) {
      auditSecurityEvent(
        AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        undefined,
        {
          endpoint: request.url,
          method: request.method,
          reason: sessionResult.reason
        },
        request.headers.get('x-forwarded-for') || 'unknown'
      );
      
      return NextResponse.json(
        { error: 'Nicht authentifiziert', reason: sessionResult.reason },
        { status: 401 }
      );
    }

    // Rolle prüfen
    if (!allowedRoles.includes(sessionResult.role!)) {
      auditSecurityEvent(
        AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        sessionResult.userId,
        {
          endpoint: request.url,
          method: request.method,
          reason: 'Insufficient permissions',
          userRole: sessionResult.role,
          requiredRoles: allowedRoles
        },
        request.headers.get('x-forwarded-for') || 'unknown'
      );
      
      return NextResponse.json(
        { error: 'Keine Berechtigung für diese Aktion' },
        { status: 403 }
      );
    }

    // Authentifizierte Request erstellen
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: sessionResult.userId!,
      role: sessionResult.role!
    };

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentifizierungsfehler' },
      { status: 500 }
    );
  }
}

// Hilfsfunktion für einfache Token-Validierung ohne Session-Management
export async function validateToken(request: NextRequest): Promise<{
  isValid: boolean;
  userId?: number;
  role?: string;
  reason?: string;
}> {
  try {
    const sessionResult = await validateSession(request);
    return sessionResult;
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, reason: 'Token validation failed' };
  }
}
