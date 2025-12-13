import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const days = parseInt(searchParams.get('days') || '30');

    // Berechne Start- und Enddatum
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Hole alle Bestellungen im Zeitraum
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Berechne Umsatzdaten
    let totalRevenue = 0;
    let totalRevenueNet = 0;
    let totalTax = 0;
    const totalOrders = orders.length;
    const taxBreakdown = { tax10: 0, tax20: 0, tax0: 0 };
    const dailyBreakdown: { [key: string]: { revenue: number; orders: number } } = {};
    const productStats: { [key: string]: { name: string; sales: number; revenue: number; revenueNet: number; tax: number } } = {};

    orders.forEach((order) => {
      const orderTotal = parseFloat(order.totalAmount?.toString() || '0');
      totalRevenue += orderTotal;

      // Tägliche Aufschlüsselung
      const orderDate = order.createdAt.toISOString().split('T')[0];
      if (!dailyBreakdown[orderDate]) {
        dailyBreakdown[orderDate] = { revenue: 0, orders: 0 };
      }
      dailyBreakdown[orderDate].revenue += orderTotal;
      dailyBreakdown[orderDate].orders += 1;

      // Produkt-Statistiken
      order.orderItems.forEach((item) => {
        const productName = item.product?.name || 'Unbekanntes Produkt';
        const itemTotal = parseFloat(item.totalPrice?.toString() || '0');
        
        if (!productStats[productName]) {
          productStats[productName] = {
            name: productName,
            sales: 0,
            revenue: 0,
            revenueNet: 0,
            tax: 0
          };
        }
        
        productStats[productName].sales += item.quantity || 1;
        productStats[productName].revenue += itemTotal;
        
        // Steuerberechnung basierend auf Produktsteuer
        const taxRate = parseFloat(item.product?.taxRate?.toString() || '0.20'); // Fallback auf 20% wenn nicht gesetzt
        const revenueNet = itemTotal / (1 + taxRate);
        const tax = itemTotal - revenueNet;
        
        productStats[productName].revenueNet += revenueNet;
        productStats[productName].tax += tax;
        
        // Steueraufschlüsselung nach realem Steuersatz
        if (Math.abs(taxRate - 0.20) < 0.001) {
          taxBreakdown.tax20 += tax;
        } else if (Math.abs(taxRate - 0.10) < 0.001) {
          taxBreakdown.tax10 += tax;
        } else {
          taxBreakdown.tax0 += tax;
        }
        
        totalRevenueNet += revenueNet;
        totalTax += tax;
      });
    });

    // Konvertiere tägliche Aufschlüsselung zu Array und sortiere
    const dailyBreakdownArray = Object.entries(dailyBreakdown)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Top-Produkte nach Umsatz sortieren
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Durchschnittlicher Bestellwert
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueData = {
      period,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalRevenueNet: Math.round(totalRevenueNet * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      taxBreakdown: {
        tax10: Math.round(taxBreakdown.tax10 * 100) / 100,
        tax20: Math.round(taxBreakdown.tax20 * 100) / 100,
        tax0: Math.round(taxBreakdown.tax0 * 100) / 100
      },
      dailyBreakdown: dailyBreakdownArray,
      topProducts
    };

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Umsatzdaten' },
      { status: 500 }
    );
  }
}

// Export protected handler - Admin only access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handleGET);
