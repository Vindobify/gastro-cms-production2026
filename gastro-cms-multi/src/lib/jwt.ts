// JWT Utility mit sicherer Secret-Validierung
import jwt from 'jsonwebtoken';

// JWT Secret zur Laufzeit validieren (nicht beim Build)
function getJwtSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required but not set. Application cannot start without a secure JWT secret.');
  }

  if (JWT_SECRET === 'fallback-secret-key' || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long and cannot be the default fallback value.');
  }
  
  return JWT_SECRET;
}

export const jwtConfig = {
  expiresIn: '24h' as const,
  rememberMeExpiresIn: '7d' as const
};

export function signToken(payload: any, rememberMe: boolean = false): string {
  const secret = getJwtSecret(); // Runtime-Check
  const options: jwt.SignOptions = {
    expiresIn: rememberMe ? jwtConfig.rememberMeExpiresIn : jwtConfig.expiresIn
  };
  
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): any {
  try {
    const secret = getJwtSecret(); // Runtime-Check
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
