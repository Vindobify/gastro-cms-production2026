import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Auth credentials
const AUTH_EMAIL = 'office@gastro-cms.at';
const AUTH_PASSWORD = 'ComPaq1987!';

// Session storage (in production, use Redis or database)
const sessions = new Map<string, { email: string; expires: number }>();

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate credentials
function validateCredentials(email: string, password: string): boolean {
  return email === AUTH_EMAIL && password === AUTH_PASSWORD;
}

// Create session
function createSession(email: string): string {
  const token = generateSessionToken();
  const expires = Date.now() + SESSION_TIMEOUT;
  
  sessions.set(token, { email, expires });
  
  // Clean up expired sessions
  for (const [key, session] of sessions.entries()) {
    if (session.expires < Date.now()) {
      sessions.delete(key);
    }
  }
  
  return token;
}

// Validate session
function validateSession(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  
  return true;
}

// Get user from session
function getUserFromSession(token: string): string | null {
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    return null;
  }
  return session.email;
}

// Login endpoint
export async function login(email: string, password: string) {
  if (!validateCredentials(email, password)) {
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
  
  const token = createSession(email);
  
  return {
    success: true,
    token,
    user: { email }
  };
}

// Logout endpoint
export async function logout(token: string) {
  sessions.delete(token);
  return { success: true };
}

// Auth middleware for API routes
export function withAuth(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            message: 'Please provide a valid authorization token'
          },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // For now, accept any token that looks like a valid hex string (32+ chars)
      // In production, you would validate the JWT token properly
      if (!token || token.length < 32 || !/^[a-f0-9]+$/i.test(token)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid token format',
            message: 'Please login again'
          },
          { status: 401 }
        );
      }
      
      // Add user info to request headers for the handler
      req.headers.set('x-user-email', AUTH_EMAIL);
      
      // Call the original handler
      return await handler(req, ...args);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed',
          message: 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

// Public auth endpoints (no auth required)
export async function handleLogin(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }
    
    const result = await login(email, password);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed' 
      },
      { status: 500 }
    );
  }
}

export async function handleLogout(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 400 }
      );
    }
    
    const token = authHeader.substring(7);
    await logout(token);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed' 
      },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function handleVerifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 400 }
      );
    }
    
    const token = authHeader.substring(7);
    const isValid = validateSession(token);
    const user = getUserFromSession(token);
    
    return NextResponse.json({
      success: isValid,
      valid: isValid,
      user: isValid ? { email: user } : null
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token verification failed' 
      },
      { status: 500 }
    );
  }
}
