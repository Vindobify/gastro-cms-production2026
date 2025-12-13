import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { sendDriverCredentials } from '@/lib/emailService';
import { getTenant } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nicht gefunden' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeLocation = searchParams.get('includeLocation') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let where: any = { tenantId: tenant.id };
    if (activeOnly) {
      where.isActive = true;
    }

    const drivers = await prisma.deliveryDriver.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true,
        assignedOrders: {
          where: {
            status: {
              in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
            }
          },
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformiere die Daten für das Frontend
    const transformedDrivers = drivers.map(driver => ({
      id: driver.id,
      userId: driver.userId,
      email: driver.user.email,
      firstName: driver.user.profile?.firstName || '',
      lastName: driver.user.profile?.lastName || '',
      phone: driver.profile?.phone || '',
      avatar: driver.profile?.avatar || '',
      isActive: driver.isActive,
      isAvailable: driver.isAvailable,
      gpsEnabled: driver.profile?.gpsEnabled || false,
      workingHours: driver.profile?.workingHours ? JSON.parse(driver.profile.workingHours) : null,
      currentLocation: driver.currentLocation ? JSON.parse(driver.currentLocation) : null,
      lastLocationUpdate: driver.lastLocationUpdate,
      assignedOrdersCount: driver.assignedOrders.length,
      assignedOrders: driver.assignedOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerAddress: order.customer.address,
        customerCity: order.customer.city,
        customerPostalCode: order.customer.postalCode,
        totalAmount: order.totalAmount,
        deliveryTime: order.deliveryTime
      }))
    }));

    return NextResponse.json(transformedDrivers);
  } catch (error) {
    console.error('Error fetching delivery drivers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Lieferanten' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      workingHours,
      gpsEnabled = false
    } = body;

    // Validiere erforderliche Felder
    if (!email || !password || !firstName || !lastName || !workingHours) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits existiert (pro Tenant)
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), tenantId: tenant.id }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits' },
        { status: 400 }
      );
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12);

    // Erstelle Benutzer und Lieferant in einer Transaktion
    const result = await prisma.$transaction(async (tx) => {
      // Erstelle den Benutzer
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'DELIVERY_DRIVER',
          isActive: true,
          emailVerified: true,
          tenantId: tenant.id,
          profile: {
            create: {
              firstName,
              lastName,
              country: 'Österreich'
            }
          }
        }
      });

      // Erstelle den Lieferant
      const deliveryDriver = await tx.deliveryDriver.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          profile: {
            create: {
              phone,
              workingHours: JSON.stringify(workingHours),
              gpsEnabled
            }
          }
        },
        include: {
          user: {
            include: {
              profile: true
            }
          },
          profile: true
        }
      });

      return deliveryDriver;
    });

    // Sende Zugangsdaten per E-Mail an den neuen Lieferanten
    try {
      await sendDriverCredentials(result.id, {
        email: email.toLowerCase(),
        password: password // Klartext-Passwort für E-Mail
      });
      console.log('✅ Zugangsdaten-E-Mail an neuen Lieferanten gesendet');
    } catch (emailError) {
      console.error('❌ Fehler beim Senden der Zugangsdaten-E-Mail:', emailError);
      // E-Mail-Fehler sollen die Erstellung nicht blockieren
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery driver:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Lieferanten' },
      { status: 500 }
    );
  }
}

// Export protected handlers - Admin/Manager access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
