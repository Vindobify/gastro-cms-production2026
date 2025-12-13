import { NextRequest } from 'next/server';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configurations
export const rateLimitConfigs = {
  // Very strict for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.',
  },
  
  // Strict for API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded. Please try again later.',
  },
  
  // Very strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
    message: 'Too many sensitive operations. Please try again later.',
  },
  
  // General rate limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per 15 minutes
    message: 'Rate limit exceeded. Please slow down.',
  }
};

// Get client identifier (IP + User-Agent for better tracking)
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a more specific identifier
  return `${ip}-${userAgent.slice(0, 50)}`;
}

// Check if request is within rate limit
export function checkRateLimit(
  request: NextRequest, 
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number; message?: string } {
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const key = `${clientId}-${config.windowMs}`;
  const current = rateLimitStore.get(key);
  
  if (!current) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (current.resetTime < now) {
    // Window expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (current.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime,
      message: config.message
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    success: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime
  };
}

// Get rate limit headers
export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
  };
}

// Advanced rate limiting with multiple tiers
export function checkAdvancedRateLimit(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  
  // Check multiple rate limits
  const checks = [
    { name: 'auth', config: rateLimitConfigs.auth },
    { name: 'api', config: rateLimitConfigs.api },
    { name: 'general', config: rateLimitConfigs.general }
  ];
  
  for (const check of checks) {
    const result = checkRateLimit(request, check.config);
    if (!result.success) {
      return {
        type: check.name,
        ...result
      };
    }
  }
  
  return { success: true };
}

// IP-based blocking for suspicious activity
const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, { count: number; lastSeen: number }>();

export function checkIPBlocking(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    return false;
  }
  
  // Track suspicious activity
  const now = Date.now();
  const suspicious = suspiciousIPs.get(ip);
  
  if (suspicious) {
    if (now - suspicious.lastSeen < 60000) { // 1 minute
      suspicious.count++;
      suspicious.lastSeen = now;
      
      if (suspicious.count > 50) { // More than 50 requests per minute
        blockedIPs.add(ip);
        console.warn(`IP ${ip} blocked due to suspicious activity`);
        return false;
      }
    } else {
      // Reset counter after 1 minute
      suspiciousIPs.set(ip, { count: 1, lastSeen: now });
    }
  } else {
    suspiciousIPs.set(ip, { count: 1, lastSeen: now });
  }
  
  return true;
}

// Clean up old data periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean rate limit store
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean suspicious IPs (older than 1 hour)
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.lastSeen > 3600000) { // 1 hour
      suspiciousIPs.delete(ip);
    }
  }
}, 60000); // Run every minute
