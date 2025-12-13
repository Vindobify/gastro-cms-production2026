// Server-Side API Key Management System
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from './database';

// Types
export interface ApiPermission {
  resource: string;
  actions: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Optional, nur bei Erstellung vorhanden
  hashedKey: string;
  permissions: ApiPermission[];
  createdBy: number;
  createdAt: Date;
  isActive: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  assignedUserId?: string;
}

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiUsage {
  keyId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  ip: string;
  success: boolean;
  responseTime: number;
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsLast24h: number;
}

interface ApiUsageEntry {
  timestamp: Date;
  endpoint: string;
  method: string;
  success: boolean;
  responseTime: number;
  ip: string;
}

// In-Memory Stores
const apiKeys = new Map<string, ApiKey>();
const keyUsage = new Map<string, ApiUsageStats>();
const usageStore = new Map<string, ApiUsageEntry[]>();
const rateLimitStore = new Map<string, any>();
const apiUsage = new Map<string, ApiUsageEntry[]>();

// Persistente Speicherung
const DATA_DIR = path.join(process.cwd(), 'data');
const API_KEYS_FILE = path.join(DATA_DIR, 'api-keys.json');
const API_USAGE_FILE = path.join(DATA_DIR, 'api-usage.json');

// Sicherstellen dass Datenverzeichnis existiert
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize API keys from file on startup
initializeApiKeys();

// Fallback to file-based storage until database is ready
function loadApiKeysFromFile(): ApiKey[] {
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
      const keys = JSON.parse(data);
      return keys.map((key: any) => ({
        ...key,
        createdAt: new Date(key.createdAt),
        lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
        expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined
      }));
    }
  } catch (error) {
    console.error('Error loading API keys from file:', error);
  }
  return [];
}

function saveApiKeysToFile() {
  try {
    const keysArray = Array.from(apiKeys.values()).map((key) => ({
      ...key,
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed?.toISOString(),
      expiresAt: key.expiresAt?.toISOString()
    }));
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keysArray, null, 2));
  } catch (error) {
    console.error('Error saving API keys:', error);
  }
}

function initializeApiKeys() {
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
      const keysArray = JSON.parse(data);
      keysArray.forEach((keyData: any) => {
        const apiKey = {
          ...keyData,
          createdAt: new Date(keyData.createdAt),
          lastUsed: keyData.lastUsed ? new Date(keyData.lastUsed) : undefined,
          expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined
        };
        // Store using hashedKey as the key, not the id
        apiKeys.set(keyData.hashedKey, apiKey);
      });
    }
  } catch (error) {
    console.error('Error loading API keys:', error);
  }
}

// API keys are loaded by initializeApiKeys() call above

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

// API Key hashen (für sichere Speicherung)
function hashApiKey(key: string): string {
  // In Production sollte bcrypt oder ähnliches verwendet werden
  return Buffer.from(key).toString('base64');
}

// Neuen API Key erstellen
export function createApiKey(
  name: string,
  permissions: ApiPermission[],
  createdBy: number,
  options: {
    expiresInDays?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    assignedUserId?: string;
  } = {}
): ApiKey {
  const key = generateApiKey();
  const hashedKey = hashApiKey(key);
  const id = Math.random().toString(36).substring(2);
  
  const apiKey: ApiKey = {
    id,
    name,
    key, // Nur bei Erstellung zurückgeben, dann löschen
    hashedKey,
    permissions,
    createdBy,
    createdAt: new Date(),
    isActive: true,
    expiresAt: options.expiresInDays ? 
      new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000) : 
      undefined,
    usageCount: 0,
    rateLimit: {
      requestsPerHour: options.requestsPerHour || 1000,
      requestsPerDay: options.requestsPerDay || 10000
    },
    assignedUserId: options.assignedUserId
  };
  
  apiKeys.set(hashedKey, apiKey);
  
  // Persistente Speicherung
  saveApiKeysToFile();
  
  // Audit Log
  auditUserAction(
    AUDIT_ACTIONS.USER_CREATE,
    createdBy,
    { 
      apiKeyName: name,
      permissions: permissions.map(p => `${p.resource}:${p.actions.join(',')}`)
    }
  );
  
  logInfo('API Key created', {
    keyId: id,
    name,
    createdBy,
    permissions: permissions.length
  });
  
  return apiKey;
}

// API Key validieren
export function validateApiKey(request: NextRequest): {
  isValid: boolean;
  apiKey?: ApiKey;
  error?: string;
} {
  const apiKeyHeader = request.headers.get('x-api-key') || 
                      request.headers.get('authorization')?.replace('Bearer ', '') ||
                      new URL(request.url).searchParams.get('api_key');

  if (!apiKeyHeader) {
    return { isValid: false, error: 'No API key provided' };
  }

  const hashedKey = hashApiKey(apiKeyHeader);
  const apiKey = apiKeys.get(hashedKey);

  if (!apiKey) {
    return { isValid: false, error: 'Invalid API key' };
  }

  if (!apiKey.isActive) {
    return { isValid: false, error: 'API key is deactivated' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { isValid: false, error: 'API key has expired' };
  }

  // Letzten Zugriff aktualisieren
  apiKey.lastUsed = new Date();
  saveApiKeysToFile();

  return { isValid: true, apiKey };
}

// Alle API Keys auflisten
export function listApiKeys(): ApiKey[] {
  return Array.from(apiKeys.values());
}

// API Key deaktivieren
export function deactivateApiKey(keyId: string, userId: number): boolean {
  const apiKey = Array.from(apiKeys.values()).find(key => key.id === keyId);
  
  if (!apiKey) {
    return false;
  }

  apiKey.isActive = false;
  saveApiKeysToFile();
  
  auditUserAction(
    AUDIT_ACTIONS.USER_UPDATE,
    userId,
    { 
      action: 'deactivate_api_key',
      apiKeyName: apiKey.name
    }
  );

  return true;
}

// API Key komplett löschen
export function deleteApiKey(keyId: string, userId: number): boolean {
  const apiKey = Array.from(apiKeys.values()).find(key => key.id === keyId);
  
  if (!apiKey) {
    return false;
  }

  // Aus Map entfernen - finde den richtigen hashedKey
  if (apiKey.key) {
    const hashedKey = hashApiKey(apiKey.key);
    apiKeys.delete(hashedKey);
  }
  
  // Usage-Daten löschen
  usageStore.delete(keyId);
  
  // Datei aktualisieren
  saveApiKeysToFile();
  
  auditUserAction(
    AUDIT_ACTIONS.USER_UPDATE,
    userId,
    { 
      action: 'delete_api_key',
      apiKeyName: apiKey.name
    }
  );

  return true;
}

// API Usage tracken
export function trackApiUsage(
  keyId: string,
  endpoint: string,
  method: string,
  success: boolean,
  responseTime: number,
  ip: string
): void {
  const usage: ApiUsageEntry = {
    timestamp: new Date(),
    endpoint,
    method,
    success,
    responseTime,
    ip
  };

  if (!usageStore.has(keyId)) {
    usageStore.set(keyId, []);
  }

  usageStore.get(keyId)!.push(usage);

  // Nur die letzten 1000 Einträge behalten
  const entries = usageStore.get(keyId)!;
  if (entries.length > 1000) {
    entries.splice(0, entries.length - 1000);
  }

  // Stats aktualisieren
  updateUsageStats(keyId);
}

// Alias für Kompatibilität
export const recordApiUsage = trackApiUsage;

// Audit Actions Constants
const AUDIT_ACTIONS = {
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_DELETED: 'API_KEY_DELETED',
  API_KEY_UPDATED: 'API_KEY_UPDATED',
  API_KEY_USED: 'API_KEY_USED',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE'
} as const;

// Audit Logging
function logApiKeyActivity(action: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details
  };
  
  // Hier könnte man das Logging in eine Datei oder Datenbank schreiben
  console.log('API Key Activity:', logEntry);
}

// Audit User Action
function auditUserAction(action: string, userId: number, details: any) {
  logApiKeyActivity(action, { userId, ...details });
}

// Log Info
function logInfo(message: string, data?: any) {
  console.log(`[INFO] ${message}`, data || '');
}

// Usage Stats berechnen
function updateUsageStats(keyId: string): void {
  const entries = usageStore.get(keyId) || [];
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentEntries = entries.filter(entry => entry.timestamp > last24h);
  const successfulRequests = entries.filter(entry => entry.success).length;
  const averageResponseTime = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.responseTime, 0) / entries.length 
    : 0;

  const stats: ApiUsageStats = {
    totalRequests: entries.length,
    successfulRequests,
    failedRequests: entries.length - successfulRequests,
    averageResponseTime: Math.round(averageResponseTime),
    requestsLast24h: recentEntries.length
  };

  keyUsage.set(keyId, stats);
}

// API Usage Stats abrufen
export function getApiUsageStats(keyId: string): ApiUsageStats | undefined {
  return keyUsage.get(keyId);
}
