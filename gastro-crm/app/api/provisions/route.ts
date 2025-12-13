import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const paymentMethod = searchParams.get('paymentMethod');
    const paid = searchParams.get('paid');

    let where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Filter by payment method (only CASH and BANKOMAT for manual tracking)
    if (!where.paymentMethod) {
      where.paymentMethod = { in: ['CASH', 'BANKOMAT'] };
    }

    if (paid === 'paid') {
      where.commissionPaid = true;
    } else if (paid === 'unpaid') {
      where.commissionPaid = false;
    }

    const provisions = await prisma.payment.findMany({
      where,
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(provisions);
  } catch (error) {
    console.error('Error fetching provisions:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Provisionen' },
      { status: 500 }
    );
  }
}

