// API Key Validation Middleware
import { NextRequest } from 'next/server';
import { validateApiKey } from './apiKeyManagement.database';

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: any;
  user?: any;
  error?: string;
}

// Middleware für API Key Validierung
export async function validateApiKeyMiddleware(request: NextRequest): Promise<ApiKeyValidationResult> {
  try {
    // API Key aus Authorization Header extrahieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isValid: false, error: 'Authorization header missing' };
    }

    // Bearer Token Format prüfen
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return { isValid: false, error: 'Invalid authorization format. Use: Bearer <api_key>' };
    }

    const apiKey = parts[1];
    if (!apiKey) {
      return { isValid: false, error: 'API key missing' };
    }

    // API Key validieren
    const validation = await validateApiKey(apiKey);
    if (!validation.isValid) {
      return { isValid: false, error: 'Invalid or expired API key' };
    }

    return {
      isValid: true,
      apiKey: validation.apiKey,
      user: validation.user
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, error: 'Internal server error during validation' };
  }
}

// Check if API key has specific permission
export function hasPermission(apiKey: any, resource: string, action: string): boolean {
  if (!apiKey || !apiKey.permissions) {
    return false;
  }

  const permissions = apiKey.permissions;
  const resourcePermission = permissions.find((p: any) => p.resource === resource);
  
  if (!resourcePermission) {
    return false;
  }

  return resourcePermission.actions.includes(action);
}

// Rate limiting check (placeholder for now)
export async function checkRateLimit(apiKey: any): Promise<boolean> {
  // TODO: Implement proper rate limiting based on requestsPerHour/requestsPerDay
  return true;
}
