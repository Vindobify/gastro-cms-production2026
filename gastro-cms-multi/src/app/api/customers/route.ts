import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { getTenant } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nicht gefunden' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let where: any = { isActive: true, tenantId: tenant.id };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit && { take: parseInt(limit) })
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kunden' },
      { status: 500 }
    );
  }
}

export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handleGET);

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, postalCode, country = 'Österreich' } = body;

    // Validiere erforderliche Felder
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Vorname, Nachname und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits existiert (pro Tenant)
    const existingCustomer = await prisma.customer.findFirst({
      where: { email, tenantId: tenant.id }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Ein Kunde mit dieser E-Mail-Adresse existiert bereits' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        tenantId: tenant.id
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Kunden' },
      { status: 500 }
    );
  }
}

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
