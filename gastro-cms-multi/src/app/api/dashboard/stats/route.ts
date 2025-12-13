import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Aktueller Zeitraum (letzten 30 Tage)
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    
    // Vormonat (30 Tage davor)
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    const previousPeriodEnd = new Date(currentPeriodStart);

    // Fetch alle Orders für Vergleich
    const allOrders = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    });

    // Filter nach Zeiträumen
    const currentOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= currentPeriodStart
    );
    const previousOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= previousPeriodStart && 
      new Date(order.createdAt) < previousPeriodEnd
    );

    // Berechne aktuelle Periode
    let currentRevenue = 0, currentRevenueNet = 0, currentTax = 0;
    currentOrders.forEach(order => {
      const orderTotal = Number(order.totalAmount || 0);
      currentRevenue += orderTotal;
      
      // Einfache Steuerberechnung: 20% MwSt.
      const taxRate = 0.20;
      const netAmount = orderTotal / (1 + taxRate);
      const taxAmount = orderTotal - netAmount;
      
      currentRevenueNet += netAmount;
      currentTax += taxAmount;
    });

    // Berechne vorherige Periode
    let previousRevenue = 0, previousRevenueNet = 0, previousTax = 0;
    previousOrders.forEach(order => {
      const orderTotal = Number(order.totalAmount || 0);
      previousRevenue += orderTotal;
      
      const taxRate = 0.20;
      const netAmount = orderTotal / (1 + taxRate);
      const taxAmount = orderTotal - netAmount;
      
      previousRevenueNet += netAmount;
      previousTax += taxAmount;
    });

    // Fetch products und customers count
    const [products, customers] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count()
    ]);

    // Berechne prozentuale Änderungen
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalRevenue: Math.round(currentRevenue * 100) / 100,
      totalRevenueNet: Math.round(currentRevenueNet * 100) / 100,
      totalTax: Math.round(currentTax * 100) / 100,
      totalOrders: currentOrders.length,
      totalProducts: products,
      totalCustomers: customers,
      revenueChange: calculateChange(currentRevenue, previousRevenue),
      revenueNetChange: calculateChange(currentRevenueNet, previousRevenueNet),
      taxChange: calculateChange(currentTax, previousTax),
      ordersChange: calculateChange(currentOrders.length, previousOrders.length),
      productsChange: 0, // Produkte ändern sich nicht monatlich
      customersChange: 0 // Kunden-Vergleich ist komplexer
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    );
  }
}
