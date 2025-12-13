import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenant } from '@/lib/tenant';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { createSession } from '@/lib/sessionManagement';
// import { generateCSRFToken, csrfConfig, requireCSRFToken } from '@/lib/csrf-simple';
import { checkRateLimit, rateLimitConfigs, getRateLimitHeaders } from '@/lib/rateLimit';
// import { auditLogin } from '@/lib/auditLog'; // Temporär deaktiviert für lokales Testing

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting prüfen - temporär deaktiviert für lokales Testing
    // const rateLimit = checkRateLimit(request, rateLimitConfigs.auth);

    // if (!rateLimit.success) {
    //   const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime);
    //   return NextResponse.json(
    //     { error: 'Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.' },
    //     { 
    //       status: 429,
    //       headers
    //     }
    //   );
    // }

    // CSRF-Schutz temporär deaktiviert für stabilen Produktionslogin
    // TODO: CSRF-System nach Deployment-Tests wieder aktivieren
    // const csrfValidation = requireCSRFToken(request);
    // if (!csrfValidation.valid) {
    //   return NextResponse.json(
    //     {
    //       error: 'CSRF-Schutz aktiviert',
    //       message: csrfValidation.error,
    //       code: 'CSRF_TOKEN_REQUIRED'
    //     },
    //     { status: 403 }
    //   );
    // }

    const { email, password, rememberMe = false } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    const tenant = await getTenant();
    if (!tenant) {
      console.error('Login-Fehler: Tenant nicht gefunden');
      return NextResponse.json(
        { error: 'Tenant nicht gefunden. Bitte überprüfen Sie die Domain-Konfiguration.' },
        { status: 404 }
      );
    }

    // Datenbankverbindung wird automatisch beim ersten Query hergestellt
    // Multitenant Login: Suche User nur im aktuellen Tenant
    const user = await prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: email.toLowerCase(),
          tenantId: tenant.id
        }
      },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Ihr Konto ist deaktiviert. Bitte kontaktieren Sie den Support.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Erstelle JWT Token
    // Erstelle JWT Token mit Tenant ID
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id
    }, rememberMe);

    // Erstelle Session
    const sessionId = await createSession(
      user.id,
      user.role,
      token,
      request.headers.get('user-agent') || 'Unknown',
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'Unknown'
    );

    // Audit Log - temporär deaktiviert
    // await auditLogin({
    //   userId: user.id,
    //   email: user.email,
    //   success: true,
    //   ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
    //   userAgent: request.headers.get('user-agent') || 'Unknown'
    // });

    // Response mit Cookie erstellen
    const response = NextResponse.json({
      success: true,
      message: 'Erfolgreich angemeldet',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token,
      sessionId
    });

    // Auth-Token als HTTP-Only Cookie setzen
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 Tage oder 24 Stunden

    const host = request.headers.get('host') || '';
    const isLocalHost = host.includes('localhost') || host.endsWith('.local');
    const secureFlag = process.env.NODE_ENV === 'production' && !isLocalHost;

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login-Fehler:', error);

    // Audit Log für fehlgeschlagenen Login - temporär deaktiviert
    // try {
    //   const { email } = await request.json();
    //   await auditLogin({
    //     userId: null,
    //     email: email || 'Unknown',
    //     success: false,
    //     ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
    //     userAgent: request.headers.get('user-agent') || 'Unknown',
    //     error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    //   });
    // } catch (auditError) {
    //   console.error('Audit-Log-Fehler:', auditError);
    // }

    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}