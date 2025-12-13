import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireApiKey, ApiKeyAuth } from '@/lib/apiAuth';

async function handleGET(request: NextRequest, auth: ApiKeyAuth) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tenantId = searchParams.get('tenantId');

    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        revenueByRestaurant: orders.reduce((acc: Record<string, any>, order: any) => {
          const tenantId = order.tenantId;
          if (!acc[tenantId]) {
            acc[tenantId] = {
              tenantId,
              tenantName: order.tenant.name,
              revenue: 0,
              orders: 0,
            };
          }
          acc[tenantId].revenue += Number(order.totalAmount);
          acc[tenantId].orders += 1;
          return acc;
        }, {} as Record<string, any>),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Analytics' },
      { status: 500 }
    );
  }
}

export const GET = requireApiKey(handleGET);

