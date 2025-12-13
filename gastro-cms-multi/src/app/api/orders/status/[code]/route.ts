import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenant } from '@/lib/tenant';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const resolved = await params;
    const code = resolved.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Ungültiger Code' }, { status: 400 });
    }

    // Bestellung anhand der Bestellnummer (pro Tenant eindeutig) holen
    const order = await prisma.order.findFirst({
      where: {
        tenantId: tenant.id,
        orderNumber: code
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveryTime: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryTime: order.deliveryTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Fehler beim Laden des Bestellstatus:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

