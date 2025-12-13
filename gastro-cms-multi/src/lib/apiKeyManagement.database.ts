// Database-based API Key Management System
import bcrypt from 'bcrypt';
import { prisma } from './database';

// Types
export interface ApiPermission {
  resource: string;
  actions: string[];
}

// Vordefinierte API-Berechtigungen
export const API_PERMISSIONS = {
  // Lesezugriff
  PRODUCTS_READ: { resource: 'products', actions: ['read'] },
  ORDERS_READ: { resource: 'orders', actions: ['read'] },
  CUSTOMERS_READ: { resource: 'customers', actions: ['read'] },
  ANALYTICS_READ: { resource: 'analytics', actions: ['read'] },
  
  // Schreibzugriff
  PRODUCTS_WRITE: { resource: 'products', actions: ['read', 'write'] },
  ORDERS_WRITE: { resource: 'orders', actions: ['read', 'write'] },
  CUSTOMERS_WRITE: { resource: 'customers', actions: ['read', 'write'] },
  
  // Vollzugriff
  PRODUCTS_FULL: { resource: 'products', actions: ['read', 'write', 'delete'] },
  ORDERS_FULL: { resource: 'orders', actions: ['read', 'write', 'delete'] },
  CUSTOMERS_FULL: { resource: 'customers', actions: ['read', 'write', 'delete'] },
  ANALYTICS_FULL: { resource: 'analytics', actions: ['read', 'write'] }
};

// Vordefinierte Berechtigungs-Presets
export const PERMISSION_PRESETS = {
  POS_SYSTEM: [
    API_PERMISSIONS.PRODUCTS_READ,
    API_PERMISSIONS.ORDERS_WRITE
  ],
  ACCOUNTING: [
    API_PERMISSIONS.ORDERS_READ,
    API_PERMISSIONS.ANALYTICS_READ
  ],
  INVENTORY_MANAGEMENT: [
    API_PERMISSIONS.PRODUCTS_FULL
  ],
  DELIVERY_SERVICE: [
    API_PERMISSIONS.ORDERS_READ,
    API_PERMISSIONS.CUSTOMERS_READ
  ],
  FULL_ACCESS: [
    API_PERMISSIONS.PRODUCTS_FULL,
    API_PERMISSIONS.ORDERS_FULL,
    API_PERMISSIONS.CUSTOMERS_FULL,
    API_PERMISSIONS.ANALYTICS_READ
  ]
};

// API Key generieren
export function generateApiKey(): string {
  const prefix = 'gck_'; // GastroCMS Key
  const randomPart = Math.random().toString(36).substring(2) + 
                     Math.random().toString(36).substring(2) + 
                     Date.now().toString(36);
  return prefix + randomPart;
}

// API Key hashen (sicher mit bcrypt)
export async function hashApiKey(key: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(key, saltRounds);
}

// API Key verifizieren
export async function verifyApiKey(key: string, hashedKey: string): Promise<boolean> {
  return await bcrypt.compare(key, hashedKey);
}

// Neuen API Key erstellen
export async function createApiKey(
  name: string,
  permissions: ApiPermission[],
  createdBy: number,
  options: {
    expiresInDays?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    assignedUserId?: string;
  } = {}
) {
  const key = generateApiKey();
  const keyHash = await hashApiKey(key);
  const keyPrefix = key.substring(0, 8);
  
  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      permissions: JSON.stringify(permissions),
      isActive: true,
      expiresAt: options.expiresInDays ? 
        new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000) : 
        null,
      requestsPerHour: options.requestsPerHour || 1000,
      requestsPerDay: options.requestsPerDay || 10000,
      apiUserId: options.assignedUserId ? parseInt(options.assignedUserId) : 1 // Default to first user if none assigned
    }
  });
  
  return {
    ...apiKey,
    key, // Nur bei Erstellung zurückgeben
    permissions: JSON.parse(apiKey.permissions as string)
  };
}

// API Key validieren
export async function validateApiKey(key: string): Promise<{
  isValid: boolean;
  apiKey?: any;
  user?: any;
}> {
  try {
    // Alle aktiven API Keys aus der Datenbank laden
    const apiKeys = await prisma.apiKey.findMany({
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

    // Durch alle Keys iterieren und hashen vergleichen
    for (const apiKey of apiKeys) {
      const isMatch = await verifyApiKey(key, apiKey.keyHash);
      if (isMatch) {
        // Letzten Zugriff aktualisieren
        await prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { 
            lastUsed: new Date()
          }
        });

        return {
          isValid: true,
          apiKey: {
            ...apiKey,
            permissions: JSON.parse(apiKey.permissions as string)
          },
          user: apiKey.apiUser
        };
      }
    }

    return { isValid: false };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false };
  }
}

// API Keys auflisten
export async function listApiKeys() {
  const apiKeys = await prisma.apiKey.findMany({
    include: {
      apiUser: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return apiKeys.map(key => ({
    ...key,
    permissions: JSON.parse(key.permissions as string),
    key: undefined // Key nie zurückgeben
  }));
}

// API Key deaktivieren
export async function deactivateApiKey(keyId: number, deactivatedBy: number) {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { 
      isActive: false,
      updatedAt: new Date()
    }
  });
}

// API Key löschen
export async function deleteApiKey(keyId: number, deletedBy: number) {
  await prisma.apiKey.delete({
    where: { id: keyId }
  });
}

// API Key Statistiken
export async function getApiKeyStats(keyId: number) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
    include: {
      usageStats: {
        orderBy: { timestamp: 'desc' },
        take: 100
      }
    }
  });

  if (!apiKey) {
    return null;
  }

  return {
    totalRequests: apiKey.usageStats.length,
    lastUsed: apiKey.lastUsed,
    isActive: apiKey.isActive,
    expiresAt: apiKey.expiresAt
  };
}

// Rate Limiting Check
export async function checkRateLimit(apiKeyId: number): Promise<boolean> {
  // Implementierung für Rate Limiting basierend auf requestsPerHour/requestsPerDay
  // Für jetzt einfach true zurückgeben
  return true;
}
