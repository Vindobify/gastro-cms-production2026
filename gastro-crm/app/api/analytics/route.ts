import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

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

    // Get all orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            commissionRate: true,
          },
        },
        payment: true,
      },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const totalOrders = orders.length;

    // Calculate commission
    const totalCommission = orders.reduce((sum: number, order: any) => {
      if (order.payment) {
        return sum + Number(order.payment.commission);
      }
      // Calculate 10% if no payment record
      const commissionRate = Number(order.tenant.commissionRate) || 0.1;
      return sum + Number(order.totalAmount) * commissionRate;
    }, 0);

    // Revenue by restaurant
    const revenueByRestaurant = orders.reduce((acc: Record<string, any>, order: any) => {
      const tenantId = order.tenantId;
      if (!acc[tenantId]) {
        acc[tenantId] = {
          tenantId,
          tenantName: order.tenant.name,
          revenue: 0,
          orders: 0,
          commission: 0,
        };
      }
      acc[tenantId].revenue += Number(order.totalAmount);
      acc[tenantId].orders += 1;
      if (order.payment) {
        acc[tenantId].commission += Number(order.payment.commission);
      } else {
        const commissionRate = Number(order.tenant.commissionRate) || 0.1;
        acc[tenantId].commission += Number(order.totalAmount) * commissionRate;
      }
      return acc;
    }, {} as Record<string, any>);

    // Revenue by payment method
    const revenueByPaymentMethod = orders.reduce((acc: Record<string, any>, order: any) => {
      const method = order.paymentMethod || 'UNKNOWN';
      if (!acc[method]) {
        acc[method] = {
          method,
          revenue: 0,
          orders: 0,
        };
      }
      acc[method].revenue += Number(order.totalAmount);
      acc[method].orders += 1;
      return acc;
    }, {} as Record<string, any>);

    // Revenue by date (for charts)
    const revenueByDate = orders.reduce((acc: Record<string, any>, order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCommission,
      revenueByRestaurant: Object.values(revenueByRestaurant),
      revenueByPaymentMethod: Object.values(revenueByPaymentMethod),
      revenueByDate: Object.values(revenueByDate).sort(
        (a: any, b: any) => a.date.localeCompare(b.date)
      ),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analytics' },
      { status: 500 }
    );
  }
}

