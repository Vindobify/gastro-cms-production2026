import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    // @ts-ignore - orderRequest exists in Prisma Client, TypeScript types may not be updated
    const orderRequest = await prisma.orderRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!orderRequest) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    if (orderRequest.convertedToTenantId) {
      return NextResponse.json(
        { error: 'Bestellung wurde bereits in ein Restaurant umgewandelt' },
        { status: 400 }
      );
    }

    // Erstelle neuen Tenant (Restaurant) mit isActive: false
    // ALLE Daten werden 1:1 übernommen
    const tenant = await prisma.$transaction(async (tx: any) => {
      // Bestimme Domain: existingDomain hat Priorität, sonst desiredDomain
      // Normalisiere Domain: www. entfernen und trimmen
      let domain = orderRequest.hasDomain 
        ? orderRequest.existingDomain 
        : orderRequest.desiredDomain;
      
      if (domain) {
        domain = domain.trim();
        // www. entfernen für Konsistenz (wird beim Suchen auch entfernt)
        if (domain.startsWith('www.')) {
          domain = domain.substring(4);
        }
      }

      // Erstelle Subdomain aus Restaurant-Name (sanitized)
      const subdomain = orderRequest.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      // Restaurant aktivieren, wenn eine Domain vorhanden ist
      // Domain wird für den Lieferservice benötigt
      const shouldBeActive = !!(domain && domain.trim().length > 0);

      const newTenant = await tx.tenant.create({
        data: {
          name: orderRequest.restaurantName,
          domain: domain || null,
          subdomain: subdomain || null,
          isActive: shouldBeActive, // Aktiv wenn Domain vorhanden, sonst inaktiv
          plan: 'STANDARD',
          ownerName: orderRequest.ownerName,
          email: orderRequest.email,
          phone: orderRequest.phone || null,
          commissionRate: 0.10,
        },
      });

      // Erstelle RestaurantSettings mit ALLEN Daten 1:1
      await tx.restaurantSettings.create({
        data: {
          tenantId: newTenant.id,
          restaurantName: orderRequest.restaurantName,
          address: orderRequest.address || null,
          city: orderRequest.city || null,
          postalCode: orderRequest.postalCode || null,
          phone: orderRequest.phone || null,
          email: orderRequest.email,
          // Zusätzliche Felder können hier gespeichert werden
          // category könnte businessType sein
          category: orderRequest.businessType || null,
        },
      });

      return newTenant;
    });

    // Optional: Admin-User erstellen (falls users-Tabelle existiert)
    // WICHTIG: office@nextpuls.com wird immer als ADMIN erstellt, nicht die E-Mail aus der Bestellung
    try {
      const adminPassword = await bcrypt.hash('ComPaq1987!', 10);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "users" ("tenantId","email","password","role","isActive","emailVerified","createdAt","updatedAt")
         VALUES ($1,$2,$3,'ADMIN',true,true, now(), now())
         ON CONFLICT ("email","tenantId")
         DO UPDATE SET "password"=EXCLUDED."password","role"='ADMIN',"isActive"=true,"emailVerified"=true,"updatedAt"=now();`,
        tenant.id,
        'office@nextpuls.com',
        adminPassword
      );
    } catch (userError) {
      console.warn('Could not create admin user (users table may not exist):', userError);
    }

    // Update OrderRequest mit convertedToTenantId
    // @ts-ignore - orderRequest exists in Prisma Client, TypeScript types may not be updated
    await prisma.orderRequest.update({
      where: { id: parseInt(id) },
      data: {
        convertedToTenantId: tenant.id,
        status: 'CONVERTED',
      },
    });

    return NextResponse.json({
      success: true,
      tenant,
      message: 'Bestellung erfolgreich in Restaurant umgewandelt',
    });
  } catch (error) {
    console.error('Error converting order request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    // Prisma-Fehler
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Domain oder Subdomain bereits vergeben' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Umwandeln der Bestellung' },
      { status: 500 }
    );
  }
}

