import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const allowOrigin = origin ?? (host ? `http://${host}` : '*');

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers') ?? 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/login') || pathname.startsWith('/uploads')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // Check for auth token
  const token = request.cookies.get('auth-token');

  // If no token and trying to access protected route, redirect to login
  if (!token && !pathname.startsWith('/api/auth/')) {
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', allowOrigin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};

