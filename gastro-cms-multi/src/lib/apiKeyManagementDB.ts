// Database-basiertes API Key Management System
import { prisma } from './database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface ApiPermission {
  resource: string;
  actions: string[];
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  company?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  apiUserId: number;
  apiUser?: ApiUser;
  permissions: ApiPermission[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  requestsPerHour: number;
  requestsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsLast24h: number;
}

// Permission Presets für verschiedene Integrationstypen
export const PERMISSION_PRESETS = {
  POS_SYSTEM: [
    { resource: 'products', actions: ['read'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'orders', actions: ['create', 'read', 'update'] },
    { resource: 'customers', actions: ['create', 'read'] }
  ],
  ACCOUNTING: [
    { resource: 'orders', actions: ['read'] },
    { resource: 'customers', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'revenue', actions: ['read'] }
  ],
  INVENTORY_MANAGEMENT: [
    { resource: 'products', actions: ['create', 'read', 'update'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  DELIVERY_SERVICE: [
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'customers', actions: ['read'] },
    { resource: 'delivery-drivers', actions: ['read'] }
  ],
  FULL_ACCESS: [
    { resource: '*', actions: ['create', 'read', 'update', 'delete'] }
  ]
} as const;

// API User Management
export async function createApiUser(data: {
  name: string;
  email: string;
  company?: string;
  description?: string;
}): Promise<ApiUser> {
  try {
    const apiUser = await prisma.apiUser.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        description: data.description
      }
    });
    
    return apiUser;
  } catch (error) {
    console.error('Error creating API user:', error);
    throw new Error('Fehler beim Erstellen des API-Benutzers');
  }
}

export async function listApiUsers(): Promise<ApiUser[]> {
  try {
    return await prisma.apiUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { apiKeys: true }
        }
      }
    });
  } catch (error) {
    console.error('Error listing API users:', error);
    return [];
  }
}

export async function getApiUser(id: number): Promise<ApiUser | null> {
  try {
    return await prisma.apiUser.findUnique({
      where: { id },
      include: {
        apiKeys: {
          select: {
            id: true,
            name: true,
            keyPrefix: true,
            isActive: true,
            createdAt: true,
            lastUsed: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting API user:', error);
    return null;
  }
}

// API Key Management
export async function createApiKey(
  name: string,
  permissions: ApiPermission[],
  apiUserId: number,
  options: {
    expiresInDays?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  } = {}
): Promise<{ key: string; apiKey: ApiKey }> {
  try {
    // Generiere sicheren API-Schlüssel
    const keyData = generateApiKey();
    const keyHash = await bcrypt.hash(keyData.fullKey, 12);
    
    const expiresAt = options.expiresInDays 
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix: keyData.prefix,
        apiUserId,
        permissions: JSON.stringify(permissions),
        expiresAt,
        requestsPerHour: options.requestsPerHour || 1000,
        requestsPerDay: options.requestsPerDay || 10000
      },
      include: {
        apiUser: true
      }
    });

    // Konvertiere JSON zurück zu Array
    const formattedApiKey: ApiKey = {
      ...apiKey,
      permissions: JSON.parse(apiKey.permissions as string)
    };

    return {
      key: keyData.fullKey,
      apiKey: formattedApiKey
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw new Error('Fehler beim Erstellen des API-Schlüssels');
  }
}

export async function listApiKeys(): Promise<ApiKey[]> {
  try {
    const keys = await prisma.apiKey.findMany({
      include: {
        apiUser: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return keys.map(key => ({
      ...key,
      permissions: JSON.parse(key.permissions as string)
    }));
  } catch (error) {
    console.error('Error listing API keys:', error);
    return [];
  }
}

export async function validateApiKey(key: string): Promise<ApiKey | null> {
  try {
    const keys = await prisma.apiKey.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        apiUser: true
      }
    });

    for (const apiKey of keys) {
      const isValid = await bcrypt.compare(key, apiKey.keyHash);
      if (isValid) {
        // Update last used timestamp
        await prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() }
        });

        return {
          ...apiKey,
          permissions: JSON.parse(apiKey.permissions as string)
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

export async function deactivateApiKey(keyId: number): Promise<boolean> {
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    });
    return true;
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return false;
  }
}

// Usage Tracking
export async function trackApiUsage(
  apiKeyId: number,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string,
  requestSize?: number,
  responseSize?: number
): Promise<void> {
  try {
    await prisma.apiKeyUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        ipAddress,
        userAgent,
        requestSize,
        responseSize
      }
    });
  } catch (error) {
    console.error('Error tracking API usage:', error);
  }
}

export async function getApiUsageStats(apiKeyId: number): Promise<ApiKeyUsageStats> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalStats, last24hStats] = await Promise.all([
      prisma.apiKeyUsage.aggregate({
        where: { apiKeyId },
        _count: { id: true },
        _avg: { responseTime: true }
      }),
      prisma.apiKeyUsage.count({
        where: {
          apiKeyId,
          timestamp: { gte: last24h }
        }
      })
    ]);

    const successfulRequests = await prisma.apiKeyUsage.count({
      where: {
        apiKeyId,
        statusCode: { gte: 200, lt: 300 }
      }
    });

    const failedRequests = totalStats._count.id - successfulRequests;

    return {
      totalRequests: totalStats._count.id,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(totalStats._avg.responseTime || 0),
      requestsLast24h: last24hStats
    };
  } catch (error) {
    console.error('Error getting API usage stats:', error);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsLast24h: 0
    };
  }
}

// Permission Checking
export function hasPermission(
  apiKey: ApiKey,
  resource: string,
  action: string
): boolean {
  return apiKey.permissions.some(permission => {
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    const actionMatch = permission.actions.includes('*') || permission.actions.includes(action);
    return resourceMatch && actionMatch;
  });
}

// Rate Limiting Check
export async function checkRateLimit(apiKeyId: number): Promise<{
  allowed: boolean;
  hourlyUsage: number;
  dailyUsage: number;
  hourlyLimit: number;
  dailyLimit: number;
}> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId }
    });

    if (!apiKey) {
      return {
        allowed: false,
        hourlyUsage: 0,
        dailyUsage: 0,
        hourlyLimit: 0,
        dailyLimit: 0
      };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [hourlyUsage, dailyUsage] = await Promise.all([
      prisma.apiKeyUsage.count({
        where: {
          apiKeyId,
          timestamp: { gte: oneHourAgo }
        }
      }),
      prisma.apiKeyUsage.count({
        where: {
          apiKeyId,
          timestamp: { gte: oneDayAgo }
        }
      })
    ]);

    const hourlyAllowed = hourlyUsage < apiKey.requestsPerHour;
    const dailyAllowed = dailyUsage < apiKey.requestsPerDay;

    return {
      allowed: hourlyAllowed && dailyAllowed,
      hourlyUsage,
      dailyUsage,
      hourlyLimit: apiKey.requestsPerHour,
      dailyLimit: apiKey.requestsPerDay
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return {
      allowed: false,
      hourlyUsage: 0,
      dailyUsage: 0,
      hourlyLimit: 0,
      dailyLimit: 0
    };
  }
}

// Helper Functions
function generateApiKey(): { fullKey: string; prefix: string } {
  const prefix = 'ak_live_';
  const randomPart = crypto.randomBytes(32).toString('hex');
  const fullKey = prefix + randomPart;
  
  return {
    fullKey,
    prefix: fullKey.substring(0, 8) + '...'
  };
}
