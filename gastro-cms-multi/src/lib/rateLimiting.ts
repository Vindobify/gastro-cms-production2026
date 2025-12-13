import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Zeitfenster in Millisekunden
  maxRequests: number; // Maximale Anzahl Requests pro Zeitfenster
  keyGenerator?: (request: NextRequest) => string; // Custom Key Generator
  skipSuccessfulRequests?: boolean; // Erfolgreiche Requests nicht zählen
  skipFailedRequests?: boolean; // Fehlgeschlagene Requests nicht zählen
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// In-Memory Store für Rate Limiting (später durch Redis ersetzen)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup alte Einträge alle 5 Minuten
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const now = Date.now();
    
    // Key für Rate Limiting generieren
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getDefaultKey(request);

    // Aktuellen Eintrag holen oder erstellen
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Neues Zeitfenster starten
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        firstRequest: now
      };
      rateLimitStore.set(key, entry);
    }

    // Request zählen
    entry.count++;

    // Rate Limit prüfen
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${retryAfter} seconds.`,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    // Rate Limit Headers für erfolgreiche Requests
    const remaining = config.maxRequests - entry.count;
    const resetTime = entry.resetTime;

    // Headers zum Request hinzufügen (wird später in der Response gesetzt)
    (request as any).rateLimitHeaders = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString()
    };

    return null; // Kein Rate Limit erreicht
  };
}

function getDefaultKey(request: NextRequest): string {
  // IP-Adresse als Standard-Key verwenden
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

// API Key basiertes Rate Limiting
export function createApiKeyRateLimiter(config: RateLimitConfig) {
  return createRateLimiter({
    ...config,
    keyGenerator: (request: NextRequest) => {
      const apiKey = request.headers.get('x-api-key') || 
                    request.headers.get('authorization')?.replace('Bearer ', '') ||
                    new URL(request.url).searchParams.get('api_key');
      
      return apiKey ? `api:${apiKey}` : getDefaultKey(request);
    }
  });
}

// Vordefinierte Rate Limit Konfigurationen
export const RATE_LIMIT_PRESETS = {
  // Sehr restriktiv für öffentliche APIs
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    maxRequests: 100
  },
  
  // Standard für authentifizierte APIs
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    maxRequests: 1000
  },
  
  // Großzügig für interne APIs
  GENEROUS: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    maxRequests: 5000
  },
  
  // Sehr restriktiv pro Minute für kritische Operationen
  CRITICAL: {
    windowMs: 60 * 1000, // 1 Minute
    maxRequests: 10
  }
};

// Helper Funktion um Rate Limit Headers zu Response hinzuzufügen
export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const headers = (request as any).rateLimitHeaders;
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
  }
  return response;
}
