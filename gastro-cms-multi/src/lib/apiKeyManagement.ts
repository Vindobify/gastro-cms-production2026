// API Key Management System für externe Integrationen
import { NextRequest } from 'next/server';
import { auditUserAction, AUDIT_ACTIONS } from './auditLog';
import { logInfo, logWarn } from './secureLogging';
import fs from 'fs';
import path from 'path';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  permissions: ApiPermission[];
  createdBy: number;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
  expiresAt?: Date;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  assignedUserId?: string;
}

export interface ApiPermission {
  resource: string; // z.B. 'products', 'orders', 'customers'
  actions: string[]; // z.B. ['read', 'write', 'delete']
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

// In-Memory Stores (später durch Datenbank ersetzen)
const apiKeys = new Map<string, ApiKey>();
const keyUsage = new Map<string, ApiUsageStats>();
const usageStore = new Map<string, ApiUsageEntry[]>();
const rateLimitStore = new Map<string, any>();
const apiUsage = new Map<string, ApiUsageEntry[]>();

// Persistente Speicher-Funktionen (nur Server-Side)
let DATA_DIR: string;
let API_KEYS_FILE: string;
let API_USAGE_FILE: string;

// Server-Side Initialisierung
if (typeof window === 'undefined') {
  DATA_DIR = path.join(process.cwd(), 'data');
  API_KEYS_FILE = path.join(DATA_DIR, 'api-keys.json');
  API_USAGE_FILE = path.join(DATA_DIR, 'api-usage.json');

  // Sicherstellen dass Datenverzeichnis existiert
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Beim Start laden
  loadApiKeysFromFile();
}

function saveApiKeysToFile() {
  if (typeof window !== 'undefined') return; // Nur Server-Side
  
  try {
    const keysArray = Array.from(apiKeys.entries()).map(([keyId, key]) => ({
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

function loadApiKeysFromFile() {
  if (typeof window !== 'undefined') return; // Nur Server-Side
  
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
      const keysArray = JSON.parse(data);
      keysArray.forEach((keyData: any) => {
        apiKeys.set(keyData.id, {
          ...keyData,
          createdAt: new Date(keyData.createdAt),
          lastUsed: keyData.lastUsed ? new Date(keyData.lastUsed) : undefined,
          expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined
        });
      });
    }
  } catch (error) {
    console.error('Error loading API keys:', error);
  }
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
  CUSTOMERS_FULL: { resource: 'customers', actions: ['read', 'write', 'delete'] }
};

// Standard-Berechtigungssets für verschiedene Anwendungsfälle
export const PERMISSION_PRESETS = {
  POS_SYSTEM: [
    API_PERMISSIONS.PRODUCTS_READ,
    API_PERMISSIONS.ORDERS_WRITE,
    API_PERMISSIONS.CUSTOMERS_READ
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
    undefined,
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
  const authHeader = request.headers.get('Authorization');
  const apiKeyHeader = request.headers.get('X-API-Key');
  
  let key: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    key = authHeader.substring(7);
  } else if (apiKeyHeader) {
    key = apiKeyHeader;
  }
  
  if (!key) {
    return { isValid: false, error: 'No API key provided' };
  }
  
  const hashedKey = hashApiKey(key);
  const apiKey = apiKeys.get(hashedKey);
  
  if (!apiKey) {
    return { isValid: false, error: 'Invalid API key' };
  }
  
  if (!apiKey.isActive) {
    return { isValid: false, error: 'API key is disabled' };
  }
  
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { isValid: false, error: 'API key has expired' };
  }
  
  // Rate Limiting prüfen
  const rateLimitResult = checkApiKeyRateLimit(apiKey);
  if (!rateLimitResult.allowed) {
    return { isValid: false, error: 'Rate limit exceeded' };
  }
  
  // Letzte Verwendung aktualisieren
  apiKey.lastUsed = new Date();
  
  return { isValid: true, apiKey };
}

// Berechtigung prüfen
export function hasPermission(
  apiKey: ApiKey, 
  resource: string, 
  action: string
): boolean {
  return apiKey.permissions.some(permission => 
    permission.resource === resource && 
    permission.actions.includes(action)
  );
}

// Rate Limiting für API Keys
function checkApiKeyRateLimit(apiKey: ApiKey): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const hourKey = `${apiKey.id}:hour:${Math.floor(now / (60 * 60 * 1000))}`;
  const dayKey = `${apiKey.id}:day:${Math.floor(now / (24 * 60 * 60 * 1000))}`;
  
  const hourLimit = rateLimitStore.get(hourKey) || { count: 0, resetTime: now + 60 * 60 * 1000 };
  const dayLimit = rateLimitStore.get(dayKey) || { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
  
  // Prüfe Limits
  if (hourLimit.count >= apiKey.rateLimit.requestsPerHour) {
    return { allowed: false, remaining: 0 };
  }
  
  if (dayLimit.count >= apiKey.rateLimit.requestsPerDay) {
    return { allowed: false, remaining: 0 };
  }
  
  // Erhöhe Zähler
  hourLimit.count++;
  dayLimit.count++;
  
  rateLimitStore.set(hourKey, hourLimit);
  rateLimitStore.set(dayKey, dayLimit);
  
  return { 
    allowed: true, 
    remaining: Math.min(
      apiKey.rateLimit.requestsPerHour - hourLimit.count,
      apiKey.rateLimit.requestsPerDay - dayLimit.count
    )
  };
}

// API Usage tracking
export function trackApiUsage(
  keyId: string,
  endpoint: string,
  method: string,
  ip: string,
  success: boolean,
  responseTime: number
): void {
  const usage: ApiUsage = {
    keyId,
    endpoint,
    method,
    timestamp: new Date(),
    ip,
    success,
    responseTime
  };
  
  // Store usage in the apiUsage map
  const currentUsage = apiUsage.get(keyId) || [];
  currentUsage.push(usage);
  apiUsage.set(keyId, currentUsage);
}

// Alias for database compatibility
export function recordApiUsage(
  keyId: string,
  endpoint: string,
  method: string,
  ip: string,
  success: boolean,
  responseTime: number
): void {
  trackApiUsage(keyId, endpoint, method, ip, success, responseTime);
}

// API Keys auflisten (für Admin Interface)
export function listApiKeys(createdBy?: number): Omit<ApiKey, 'key' | 'hashedKey'>[] {
  const keys = Array.from(apiKeys.values());
  
  return keys
    .filter(key => !createdBy || key.createdBy === createdBy)
    .map(key => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      createdBy: key.createdBy,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
      rateLimit: key.rateLimit
    }));
}

// API Key deaktivieren
export function deactivateApiKey(keyId: string, deactivatedBy: number): boolean {
  const apiKey = Array.from(apiKeys.values()).find(key => key.id === keyId);
  
  if (!apiKey) {
    return false;
  }
  
  apiKey.isActive = false;
  
  auditUserAction(
    AUDIT_ACTIONS.USER_DEACTIVATE,
    deactivatedBy,
    undefined,
    { apiKeyName: apiKey.name, apiKeyId: keyId }
  );
  
  logWarn('API Key deactivated', {
    keyId,
    name: apiKey.name,
    deactivatedBy
  });
  
  return true;
}

// Load functions for PDF generation
export async function loadApiKeyById(id: string): Promise<ApiKey | null> {
  const keys = await loadApiKeys();
  return keys.find(key => key.id === id) || null;
}

export async function loadExternalUserById(id: string): Promise<any | null> {
  const users = await loadExternalUsers();
  return users.find(user => user.id === id) || null;
}

export async function loadApiKeys(): Promise<ApiKey[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'api-keys.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.map((key: any) => ({
      ...key,
      createdAt: new Date(key.createdAt),
      lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
      expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined
    }));
  } catch (error) {
    console.error('Error loading API keys:', error);
    return [];
  }
}

export async function loadExternalUsers(): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'external-users.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading external users:', error);
    return [];
  }
}

// API Usage Statistiken
export function getApiUsageStats(keyId: string): {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsLast24h: number;
} {
  const usage = apiUsage.get(keyId) || [];
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentUsage = usage.filter(u => u.timestamp >= last24h);
  const successful = usage.filter(u => u.success);
  const failed = usage.filter(u => !u.success);
  
  return {
    totalRequests: usage.length,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    averageResponseTime: usage.length > 0 ? 
      usage.reduce((sum, u) => sum + u.responseTime, 0) / usage.length : 0,
    requestsLast24h: recentUsage.length
  };
}
