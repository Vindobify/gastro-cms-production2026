import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');

    let where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    if (plan) {
      where.plan = plan;
    }

    // Lade Restaurants ohne include, um Prisma-Adapter-Probleme zu vermeiden
    const restaurants = await prisma.tenant.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Lade Settings und Order-Counts separat für jedes Restaurant
    const restaurantsWithData = await Promise.all(
      restaurants.map(async (restaurant: { id: string }) => {
        const [settings, orderCount] = await Promise.all([
          prisma.restaurantSettings.findUnique({
            where: { tenantId: restaurant.id },
          }).catch(() => null), // Falls Settings nicht existieren
          prisma.order.count({
            where: { tenantId: restaurant.id },
          }),
        ]);

        return {
          ...restaurant,
          settings,
          _count: {
            orders: orderCount,
          },
        };
      })
    );

    return NextResponse.json(restaurantsWithData);
  } catch (error) {
    console.error('Error fetching restaurants:', error);

    // Auth-Fehler
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    // Prisma-Fehler
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Datenbankfehler beim Laden der Restaurants',
          details: process.env.NODE_ENV === 'development' && 'message' in error ? String(error.message) : undefined
        },
        { status: 500 }
      );
    }

    // Fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: 'Fehler beim Laden der Restaurants',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const {
      name,
      domain,
      subdomain,
      plan,
      ownerName,
      email,
      phone,
      settings,
    } = body;

    // Erstelle Tenant und Settings in einer Transaction
    const createdTenant = await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          domain: domain || null,
          subdomain: subdomain || null,
          plan: plan || 'STANDARD',
          ownerName: ownerName || null,
          email,
          phone: phone || null,
          isActive: true,
          commissionRate: 0.10,
        },
      });

      await tx.restaurantSettings.create({
        data: {
          tenantId: tenant.id,
          restaurantName: settings?.restaurantName || name,
          address: settings?.address || null,
          city: settings?.city || null,
          postalCode: settings?.postalCode || null,
          phone: settings?.phone || phone || null,
          email: settings?.email || email || null,
          coverImage: settings?.coverImage || null,
          category: settings?.category || null,
        },
      });

      // Lade Settings separat, um Prisma-Adapter-Probleme zu vermeiden
      const restaurantSettings = await tx.restaurantSettings.findUnique({
        where: { tenantId: tenant.id },
      });

      return {
        ...tenant,
        settings: restaurantSettings,
      };
    });

    // Default Admin pro Tenant (SQL, da User-Modell hier nicht gemappt ist)
    // Mache das AUSSERHALB der Transaction, damit ein Fehler die Transaction nicht abbricht
    try {
      const adminPassword = await bcrypt.hash('ComPaq1987!', 10);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "users" ("tenantId","email","password","role","isActive","emailVerified","createdAt","updatedAt")
         VALUES ($1,$2,$3,'ADMIN',true,true, now(), now())
         ON CONFLICT ("email","tenantId")
         DO UPDATE SET "password"=EXCLUDED."password","role"='ADMIN',"isActive"=true,"emailVerified"=true,"updatedAt"=now();`,
        createdTenant.id,
        'office@nextpuls.com',
        adminPassword
      );
    } catch (userError) {
      // Users-Tabelle existiert möglicherweise nicht - das ist OK
      console.warn('Could not create admin user (users table may not exist):', userError);
    }

    return NextResponse.json(createdTenant, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);

    // 1) Nicht eingeloggt
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    // 2) Prisma-Fehler (z.B. Unique Constraints)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      // Unique-Constraint verletzt
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      const target = prismaError.meta?.target || [];
      let message = 'Ein Wert ist bereits vergeben.';
      
      if (target.includes('domain')) {
        message = 'Diese Domain ist bereits vergeben.';
      } else if (target.includes('subdomain')) {
        message = 'Dieses Subdomain ist bereits vergeben.';
      } else if (target.includes('tenantId')) {
        message = 'Restaurant-Einstellungen existieren bereits für diesen Tenant.';
      }

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Andere Prisma-Fehler (PrismaClientKnownRequestError)
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Datenbankfehler beim Erstellen des Restaurants',
          details: process.env.NODE_ENV === 'development' && 'message' in error ? String(error.message) : undefined
        },
        { status: 400 }
      );
    }

    // 3) Validierungsfehler
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen: ' + error.message },
        { status: 400 }
      );
    }

    // Fallback: Generischer Fehler
    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen des Restaurants',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

