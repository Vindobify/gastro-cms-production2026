// Client-Side API Key Management Types and Constants
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
