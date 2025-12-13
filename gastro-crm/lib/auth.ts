import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export interface AuthUser {
  email: string;
  role: string;
}

// Super Admin Credentials
const SUPER_ADMIN_EMAIL = 'office@nextpuls.com';
const SUPER_ADMIN_PASSWORD = 'ComPaq1987!';

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  // Hardcoded Super Admin credentials
  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
    return true;
  }
  return false;
}

export async function signToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  return token;
}

export async function verifyToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as AuthUser;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

