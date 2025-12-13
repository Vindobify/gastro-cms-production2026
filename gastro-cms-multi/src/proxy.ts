import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy für Vercel Edge Runtime Kompatibilität (Next.js 16)
 * JWT-Verifikation wird an API-Routen delegiert
 */

/**
 * URL Hygiene - Clean up URLs for SEO and consistency
 */
function cleanUrl(request: NextRequest): NextResponse | null {
  const { pathname, search, hostname } = request.nextUrl;
  let needsRedirect = false;
  let cleanPath = pathname;

  // 0. Canonicalize Hostname (remove www)
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.hostname = hostname.substring(4);
    return NextResponse.redirect(newUrl, 301);
  }

  // 1. Force lowercase (except for API routes and static files)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/uploads')) {
    const lowerPath = pathname.toLowerCase();
    if (pathname !== lowerPath) {
      cleanPath = lowerPath;
      needsRedirect = true;
    }
  }

  // 2. Remove trailing slash (except for root)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
    needsRedirect = true;
  }

  // 3. Remove double slashes
  const normalizedPath = cleanPath.replace(/\/+/g, '/');
  if (cleanPath !== normalizedPath) {
    cleanPath = normalizedPath;
    needsRedirect = true;
  }

  // 4. Handle SEO permalinks and legacy redirects
  const seoRedirects: { [key: string]: string } = {
    // SEO-Permalinks - jetzt direkt zu den neuen Routen
    '/bestellen': '/warenkorb',
    '/kundencenter': '/konto',
    '/gutscheine': '/aktionen',
    '/ueber-uns': '/kontakt',

    // Legacy redirects
    '/admin': '/dashboard',
    '/wp-admin': '/dashboard',
    '/backend': '/dashboard',
    '/menu': '/speisekarte',
    '/products': '/speisekarte',
    '/cart': '/warenkorb',
    '/order': '/warenkorb',
    '/account': '/konto',
    '/profile': '/konto',
    '/contact': '/kontakt',
    '/about': '/kontakt',
    '/imprint': '/impressum',
    '/privacy': '/datenschutz',
    '/terms': '/agb'
  };

  // Handle dynamic category URLs: /kategorie/[slug] -> /speisekarte
  if (cleanPath.startsWith('/kategorie/')) {
    cleanPath = '/speisekarte';
    needsRedirect = true;
  }

  // Handle dynamic product URLs: /produkt/[slug]-[id] -> /speisekarte  
  else if (cleanPath.match(/^\/produkt\/.*-\d+$/)) {
    cleanPath = '/speisekarte';
    needsRedirect = true;
  }

  // Handle order status URLs: /lieferstatus/[orderCode] -> /bestellungen
  else if (cleanPath.startsWith('/lieferstatus/')) {
    cleanPath = '/bestellungen';
    needsRedirect = true;
  }

  // Handle legacy kundencenter sub-pages: /frontend/kundencenter -> /konto
  else if (cleanPath.startsWith('/frontend/kundencenter')) {
    cleanPath = '/konto';
    needsRedirect = true;
  }

  // Static redirects
  else if (seoRedirects[cleanPath]) {
    cleanPath = seoRedirects[cleanPath];
    needsRedirect = true;
  }

  if (needsRedirect) {
    const redirectUrl = new URL(cleanPath + search, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- CORS (dynamisch per Origin/Host) ---
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const allowOrigin = origin ?? (host ? `http://${host}` : '*');

  // Handle preflight for all API routes
  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers') ?? '*',
          'Access-Control-Allow-Credentials': 'true',
          Vary: 'Origin',
        },
      });
    }
  }

  // Maintenance Mode Check - wird über API-Route gehandhabt
  // Da Prisma nicht in Edge Runtime funktioniert, wird der Maintenance-Modus
  // über eine separate API-Route und Client-Side-Check implementiert

  // First, handle URL hygiene
  const urlCleanup = cleanUrl(request);
  if (urlCleanup) {
    return urlCleanup;
  }

  // Einfache Cookie-basierte Authentifizierung für Vercel Edge Runtime
  // Geschützte Routen definieren
  const protectedRoutes = [
    '/dashboard',
    '/konto'
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route) && pathname !== '/dashboard/login'
  );

  if (isProtectedRoute) {
    // Einfache Token-Prüfung - detaillierte Validierung erfolgt in API-Routen
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Kein Token vorhanden -> zur Login-Seite umleiten
      const loginUrl = new URL('/dashboard/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token vorhanden -> zur Seite weiterleiten
    // Detaillierte Validierung erfolgt in den jeweiligen API-Routen
    return NextResponse.next();
  }

  // Alle anderen Routen durchlassen (CORS Header anhängen)
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.append('Vary', 'Origin');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};