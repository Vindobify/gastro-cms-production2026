import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Gesamtumsatz und Bestellungen
    const totalStats = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const totalRevenue = parseFloat(totalStats._sum.totalAmount?.toString() || '0');
    const totalOrders = totalStats._count.id;

    // Durchschnittlicher Bestellwert
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Gesamtanzahl Kunden
    const totalCustomers = await prisma.customer.count();

    // Bestellungen und Umsatz diesen Monat
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const ordersThisMonth = monthlyStats._count.id;
    const revenueThisMonth = parseFloat(monthlyStats._sum.totalAmount?.toString() || '0');

    // Top-Produkte
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        return {
          name: product?.name || 'Unbekanntes Produkt',
          sales: item._sum.quantity || 0,
          revenue: parseFloat(item._sum.totalPrice?.toString() || '0')
        };
      })
    );

    // Letzte Bestellungen
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true
      }
    });

    const recentOrdersFormatted = recentOrders.map(order => ({
      id: order.id,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      total: parseFloat(order.totalAmount?.toString() || '0'),
      status: order.status,
      createdAt: order.createdAt
    }));

    // Monatliche Umsätze (letzte 6 Monate)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthStats = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          totalAmount: true
        },
        _count: {
          id: true
        }
      });

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(monthStats._sum.totalAmount?.toString() || '0'),
        orders: monthStats._count.id
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      ordersThisMonth,
      revenueThisMonth,
      topProducts: topProductsWithNames,
      recentOrders: recentOrdersFormatted,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    );
  }
}

// Export protected handler - Admin/Manager access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handleGET);
