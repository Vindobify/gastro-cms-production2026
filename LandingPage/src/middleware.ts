import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Admin-Schutz ohne Import von @/lib/auth (dort Prisma/bcrypt → nicht Edge-kompatibel).
 * Session ist JWT; Token-Prüfung über next-auth/jwt.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/admin/login'

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  let isLoggedIn = false
  if (secret) {
    try {
      const token = await getToken({
        req: request,
        secret,
        secureCookie: process.env.NODE_ENV === 'production',
      })
      isLoggedIn = !!token
    } catch {
      isLoggedIn = false
    }
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (!isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
