
import { prisma } from './database';
import { headers } from 'next/headers';
import { cache } from 'react';

// Zentrale Funktion um den aktuellen Tenant basierend auf der Domain zu laden
// Wird per Request gecached
export const getTenant = cache(async () => {
  const headersList = await headers();
  const host = headersList.get('host');
  
  if (!host) return null;

  // Port entfernen (für lokale Entwicklung localhost:3000 -> localhost)
  let cleanHost = host.split(':')[0];
  
  // www. entfernen für normalization
  if (cleanHost.startsWith('www.')) {
    cleanHost = cleanHost.substring(4);
  }

  // Suche nach Domain oder Subdomain
  // WICHTIG: Suche sowohl mit als auch ohne www., da die Domain in der DB unterschiedlich gespeichert sein könnte
  const orConditions: any[] = [
    { domain: { equals: cleanHost, mode: 'insensitive' } },
    { subdomain: { equals: cleanHost, mode: 'insensitive' } },
  ];
  
  // Füge www.-Varianten hinzu
  if (!cleanHost.startsWith('www.')) {
    orConditions.push(
      { domain: { equals: `www.${cleanHost}`, mode: 'insensitive' } },
      { subdomain: { equals: `www.${cleanHost}`, mode: 'insensitive' } }
    );
  }
  
  // Fallback für Localhost Development
  if (process.env.NODE_ENV === 'development' && cleanHost === 'localhost') {
    orConditions.push({ domain: 'demo.local' });
  }

  // Lade Tenant ohne Settings zuerst, um Prisma-Fehler zu vermeiden
  const tenant = await prisma.tenant.findFirst({
    where: {
      isActive: true, // Nur aktive Tenants
      OR: orConditions
    }
  });

  // Lade Settings separat mit try-catch, falls Spalten fehlen
  if (tenant) {
    try {
      const settings = await prisma.restaurantSettings.findUnique({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          tenantId: true,
          restaurantName: true,
          address: true,
          city: true,
          postalCode: true,
          phone: true,
          email: true,
          coverImage: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      return { ...tenant, settings };
    } catch (error) {
      console.warn('Could not load restaurant settings:', error);
      return tenant;
    }
  }

  return tenant;
});

// Helper für API Routen / Server Actions die zwingend einen Tenant brauchen
export const getTenantOrThrow = async () => {
    const tenant = await getTenant();
    if (!tenant) {
        throw new Error("Tenant not found defined for host");
    }
    return tenant;
};
