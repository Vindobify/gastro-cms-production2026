// Zusätzliche Input-Validierung für Prisma Queries
import { z } from 'zod';

// ID Validierung
export const idSchema = z.number().int().positive();
export const stringIdSchema = z.string().regex(/^\d+$/).transform(Number);

// Email Validierung
export const emailSchema = z.string().email().max(255).toLowerCase();

// User Role Validierung
export const userRoleSchema = z.enum(['ADMIN', 'RESTAURANT_MANAGER', 'DELIVERY_DRIVER', 'CUSTOMER']);

// Pagination Validierung
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional()
});

// User Query Validierung
export const userQuerySchema = z.object({
  id: idSchema.optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional()
});

// User Update Validierung
export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional()
});

// Profile Validierung
export const profileSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,20}$/).optional(),
  address: z.string().max(200).trim().optional(),
  city: z.string().max(100).trim().optional(),
  postalCode: z.string().regex(/^[0-9]{4,10}$/).optional(),
  country: z.string().max(100).default('Österreich')
});

// Sichere ID-Extraktion aus Parametern
export function validateId(id: string | number): number {
  try {
    if (typeof id === 'string') {
      return stringIdSchema.parse(id);
    }
    return idSchema.parse(id);
  } catch (error) {
    throw new Error('Invalid ID format');
  }
}

// Sichere Pagination-Parameter
export function validatePagination(params: any): { page: number; limit: number; offset: number } {
  try {
    const validated = paginationSchema.parse(params);
    return {
      ...validated,
      offset: (validated.page - 1) * validated.limit
    };
  } catch (error) {
    throw new Error('Invalid pagination parameters');
  }
}

// Query-Parameter Validierung
export function validateUserQuery(query: any) {
  try {
    return userQuerySchema.parse(query);
  } catch (error) {
    throw new Error('Invalid query parameters');
  }
}

// User Update Validierung
export function validateUserUpdate(data: any) {
  try {
    return userUpdateSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid user update data');
  }
}

// Profile Validierung
export function validateProfile(data: any) {
  try {
    return profileSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid profile data');
  }
}

// SQL Injection Schutz für Suchbegriffe
export function sanitizeSearchTerm(term: string): string {
  if (!term || typeof term !== 'string') {
    return '';
  }
  
  // Entferne potentiell gefährliche Zeichen
  return term
    .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
    .replace(/['"`;]/g, '') // Entferne SQL-relevante Zeichen
    .trim()
    .substring(0, 100); // Begrenze Länge
}

// Sichere WHERE-Clause Builder
export function buildSafeWhereClause(filters: Record<string, any>): Record<string, any> {
  const safeFilters: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    switch (key) {
      case 'id':
        safeFilters.id = validateId(value);
        break;
      case 'email':
        safeFilters.email = emailSchema.parse(value);
        break;
      case 'role':
        safeFilters.role = userRoleSchema.parse(value);
        break;
      case 'isActive':
        safeFilters.isActive = z.boolean().parse(value);
        break;
      case 'search':
        const searchTerm = sanitizeSearchTerm(value);
        if (searchTerm) {
          safeFilters.OR = [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { profile: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
            { profile: { lastName: { contains: searchTerm, mode: 'insensitive' } } }
          ];
        }
        break;
    }
  }
  
  return safeFilters;
}
