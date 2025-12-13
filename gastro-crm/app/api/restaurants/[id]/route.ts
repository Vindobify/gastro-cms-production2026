import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;

    const restaurant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant nicht gefunden' },
        { status: 404 }
      );
    }

    // Lade Settings und Order-Count separat
    const [settings, orderCount] = await Promise.all([
      prisma.restaurantSettings.findUnique({
        where: { tenantId: restaurant.id },
      }).catch(() => null),
      prisma.order.count({
        where: { tenantId: restaurant.id },
      }),
    ]);

    return NextResponse.json({
      ...restaurant,
      settings,
      _count: {
        orders: orderCount,
      },
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);

    // Auth-Fehler
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Fehler beim Laden des Restaurants',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await request.json();

    const updatedRestaurant = await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => {
      const tenant = await tx.tenant.update({
        where: { id },
        data: {
          name: body.name,
          domain: body.domain || null,
          subdomain: body.subdomain || null,
          plan: body.plan,
          isActive: body.isActive,
          ownerName: body.ownerName,
          email: body.email,
          phone: body.phone || null,
          stripeAccountId: body.stripeAccountId || null,
          stripeOnboardingStatus: body.stripeOnboardingStatus || null,
          commissionRate: body.commissionRate,
        },
      });

      // Upsert settings
      await tx.restaurantSettings.upsert({
        where: { tenantId: id },
        create: {
          tenantId: id,
          restaurantName: body.settings?.restaurantName || body.name,
          address: body.settings?.address || null,
          city: body.settings?.city || null,
          postalCode: body.settings?.postalCode || null,
          phone: body.settings?.phone || body.phone || null,
          email: body.settings?.email || body.email || null,
          coverImage: body.settings?.coverImage || null,
          category: body.settings?.category || null,
        },
        update: {
          restaurantName: body.settings?.restaurantName || body.name,
          address: body.settings?.address || null,
          city: body.settings?.city || null,
          postalCode: body.settings?.postalCode || null,
          phone: body.settings?.phone || body.phone || null,
          email: body.settings?.email || body.email || null,
          coverImage: body.settings?.coverImage || null,
          category: body.settings?.category || null,
        },
      });

      // Lade Settings separat
      const settings = await tx.restaurantSettings.findUnique({
        where: { tenantId: id },
      });

      return {
        ...tenant,
        settings,
      };
    });

    // Optional: Admin für diesen Tenant anlegen/aktualisieren (SQL-Fallback, da User-Modell hier nicht gemappt ist)
    // Mache das AUSSERHALB der Transaction, damit ein Fehler die Transaction nicht abbricht
    if (body.adminEmail && body.adminPassword) {
      try {
        const hashed = await bcrypt.hash(body.adminPassword, 10);
        await prisma.$executeRawUnsafe(
          `INSERT INTO "users" ("tenantId","email","password","role","isActive","emailVerified")
           VALUES ($1,$2,$3,'ADMIN',true,true)
           ON CONFLICT ("email","tenantId")
           DO UPDATE SET "password"=EXCLUDED."password","role"='ADMIN',"isActive"=true,"emailVerified"=true;`,
          id,
          body.adminEmail,
          hashed
        );
      } catch (userError) {
        // Users-Tabelle existiert möglicherweise nicht - das ist OK
        console.warn('Could not create admin user (users table may not exist):', userError);
      }
    }

    return NextResponse.json(updatedRestaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);

    // Auth-Fehler
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    // Prisma-Fehler (z.B. Unique Constraints)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      const target = prismaError.meta?.target || [];
      let message = 'Ein Wert ist bereits vergeben.';
      
      if (target.includes('domain')) {
        message = 'Diese Domain ist bereits vergeben.';
      } else if (target.includes('subdomain')) {
        message = 'Dieses Subdomain ist bereits vergeben.';
      }

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Andere Prisma-Fehler
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Datenbankfehler beim Aktualisieren des Restaurants',
          details: process.env.NODE_ENV === 'development' && 'message' in error ? String(error.message) : undefined
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Fehler beim Aktualisieren des Restaurants',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => {
      await tx.restaurantSettings.deleteMany({ where: { tenantId: id } });
      // Versuche, Users zu löschen, falls die Tabelle existiert
      try {
        await tx.$executeRawUnsafe('DELETE FROM "users" WHERE "tenantId" = $1;', id);
      } catch (userError) {
        // Users-Tabelle existiert möglicherweise nicht - das ist OK
        console.warn('Could not delete users (users table may not exist):', userError);
      }
      await tx.tenant.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);

    // Auth-Fehler
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Fehler beim Löschen des Restaurants',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

