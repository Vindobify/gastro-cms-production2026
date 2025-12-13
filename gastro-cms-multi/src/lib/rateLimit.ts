// Rate Limiting Utility
import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-Memory Rate Limit Store (in Production sollte Redis verwendet werden)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Zeitfenster in Millisekunden
  maxRequests: number; // Maximale Anzahl Requests pro Zeitfenster
}

export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    maxRequests: 5 // Maximal 5 Login-Versuche pro 15 Minuten
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 Stunde
    maxRequests: 3 // Maximal 3 Registrierungen pro Stunde
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    maxRequests: 100 // Maximal 100 Requests pro 15 Minuten
  }
};

function getClientIP(request: NextRequest): string {
  // IP-Adresse aus verschiedenen Headers holen
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  
  return clientIP;
}

export function checkRateLimit(request: NextRequest, config: RateLimitConfig): {
  success: boolean;
  remaining: number;
  resetTime: number;
} {
  const clientIP = getClientIP(request);
  const now = Date.now();
  const key = `${clientIP}:${request.url}`;
  
  // Alte Einträge bereinigen
  cleanupExpiredEntries(now);
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Neues Zeitfenster
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate Limit erreicht
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Request zählen
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export async function applyRateLimit(request: NextRequest, key: string, maxRequests: number, windowMs: number) {
  const config = { windowMs, maxRequests };
  return checkRateLimit(request, config);
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
  };
}
