import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Fahrer-ID über userId finden
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Benutzer-ID nicht gefunden' },
        { status: 400 }
      );
    }

    // Lieferant über userId finden
    const deliveryDriver = await (prisma as any).deliveryDriver.findFirst({
      where: { userId: userId }
    });

    if (!deliveryDriver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    const driverId = deliveryDriver.id;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year
    const filter = searchParams.get('filter') || 'all'; // all, deliveries, tips, rated
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Datumsbereich berechnen
    let dateFilter: any = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        deliveryDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case 'day':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = {
            deliveryDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          dateFilter = {
            deliveryDate: {
              gte: weekStart,
              lt: weekEnd
            }
          };
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          dateFilter = {
            deliveryDate: {
              gte: monthStart,
              lt: monthEnd
            }
          };
          break;
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
          dateFilter = {
            deliveryDate: {
              gte: yearStart,
              lt: yearEnd
            }
          };
          break;
      }
    }

    // Filter-Bedingungen erstellen
    let filterConditions: any = {
      deliveryDriverId: driverId,
      ...dateFilter
    };

    // Zusätzliche Filter anwenden
    switch (filter) {
      case 'deliveries':
        // Nur Lieferungen (alle)
        break;
      case 'tips':
        filterConditions.tipAmount = {
          gt: 0
        };
        break;
      case 'rated':
        filterConditions.rating = {
          not: null
        };
        break;
      case 'all':
      default:
        // Alle Statistiken
        break;
    }

    // Statistiken abrufen
    const stats = await (prisma as any).deliveryStats.findMany({
      where: filterConditions,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            tipAmount: true,
            status: true,
            deliveryTime: true
          }
        }
      },
      orderBy: {
        deliveryDate: 'desc'
      }
    });

    // Aggregierte Statistiken berechnen
    const totalDeliveries = stats.length;
    const totalEarnings = stats.reduce((sum: number, stat: any) => {
      return sum + Number(stat.order.totalAmount);
    }, 0);
    
    const totalTips = stats.reduce((sum: number, stat: any) => {
      return sum + Number(stat.tipAmount || 0);
    }, 0);
    
    const averageDeliveryTime = stats.reduce((sum: number, stat: any) => {
      return sum + (stat.deliveryTime || 0);
    }, 0) / (totalDeliveries || 1);
    
    const averageRating = stats.reduce((sum: number, stat: any) => {
      return sum + (stat.rating || 0);
    }, 0) / (stats.filter((s: any) => s.rating).length || 1);

    // Tägliche Aufschlüsselung für Charts
    const dailyStats = stats.reduce((acc: Record<string, any>, stat: any) => {
      const date = stat.deliveryDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          deliveries: 0,
          earnings: 0,
          tips: 0
        };
      }
      acc[date].deliveries += 1;
      acc[date].earnings += Number(stat.order.totalAmount);
      acc[date].tips += Number(stat.tipAmount || 0);
      return acc;
    }, {} as Record<string, any>);

    const dailyChartData = Object.values(dailyStats).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Top-Kunden (nach Anzahl Lieferungen)
    const customerStats = stats.reduce((acc: Record<number, any>, stat: any) => {
      const orderId = stat.orderId;
      if (!acc[orderId]) {
        acc[orderId] = {
          orderNumber: stat.order.orderNumber,
          deliveries: 0,
          totalAmount: Number(stat.order.totalAmount),
          tips: Number(stat.tipAmount || 0)
        };
      }
      acc[orderId].deliveries += 1;
      return acc;
    }, {} as Record<number, any>);

    const topOrders = Object.values(customerStats)
      .sort((a: any, b: any) => b.deliveries - a.deliveries)
      .slice(0, 5);

    return NextResponse.json({
      period,
      totalDeliveries,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalTips: Number(totalTips.toFixed(2)),
      averageDeliveryTime: Math.round(averageDeliveryTime),
      averageRating: Number(averageRating.toFixed(1)),
      dailyChartData,
      topOrders,
      recentDeliveries: stats.slice(0, 10).map((stat: any) => ({
        id: stat.id,
        orderNumber: stat.order.orderNumber,
        deliveryDate: stat.deliveryDate,
        deliveryTime: stat.deliveryTime,
        earnings: Number(stat.order.totalAmount),
        tips: Number(stat.tipAmount || 0),
        rating: stat.rating
      }))
    });

  } catch (error) {
    console.error('Fehler beim Laden der Lieferstatistiken:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Funktion zum Erstellen einer Lieferstatistik (wird aufgerufen, wenn Bestellung als geliefert markiert wird)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Lieferant über userId finden
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Benutzer-ID nicht gefunden' },
        { status: 400 }
      );
    }

    const deliveryDriver = await (prisma as any).deliveryDriver.findFirst({
      where: { userId: userId }
    });

    if (!deliveryDriver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    const driverId = deliveryDriver.id;

    const body = await request.json();
    const { orderId, deliveryTime, distance, rating } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Bestellungs-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Bestellung und Fahrer prüfen
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        deliveryDriverId: driverId,
        status: 'DELIVERED'
      },
      include: {
        deliveryDriver: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden oder nicht geliefert' },
        { status: 404 }
      );
    }

    // Prüfen, ob bereits eine Statistik existiert
    const existingStat = await (prisma as any).deliveryStats.findFirst({
      where: {
        orderId: orderId,
        deliveryDriverId: driverId
      }
    });

    if (existingStat) {
      return NextResponse.json(
        { error: 'Statistik für diese Bestellung existiert bereits' },
        { status: 400 }
      );
    }

    // Lieferstatistik erstellen
    const deliveryStat = await (prisma as any).deliveryStats.create({
      data: {
        deliveryDriverId: driverId,
        orderId: orderId,
        deliveryDate: new Date(),
        deliveryTime: deliveryTime || null,
        distance: distance || null,
        tipAmount: order.tipAmount || null,
        rating: rating || null
      }
    });

    return NextResponse.json({
      message: 'Lieferstatistik erfolgreich erstellt',
      stat: deliveryStat
    });

  } catch (error) {
    console.error('Fehler beim Erstellen der Lieferstatistik:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
