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
    
    // Nur Lieferanten können ihre Trinkgeld-Statistiken abrufen
    if (decoded.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Lade Lieferanten-Profil
    const driver = await prisma.deliveryDriver.findUnique({
      where: { userId: decoded.userId },
      include: {
        assignedOrders: {
          where: {
            status: 'DELIVERED',
            tipAmount: { gt: 0 }
          },
          select: {
            id: true,
            tipAmount: true,
            tipType: true,
            tipPercentage: true,
            createdAt: true,
            orderNumber: true
          }
        }
      }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Berechne Statistiken
    const allTips = driver.assignedOrders;
    const todayTips = allTips.filter(order => order.createdAt >= today);
    const weekTips = allTips.filter(order => order.createdAt >= weekStart);
    const monthTips = allTips.filter(order => order.createdAt >= monthStart);

    const calculateTotal = (orders: any[]) => 
      orders.reduce((sum, order) => sum + parseFloat(order.tipAmount.toString()), 0);

    const stats = {
      total: {
        amount: calculateTotal(allTips),
        count: allTips.length
      },
      today: {
        amount: calculateTotal(todayTips),
        count: todayTips.length
      },
      week: {
        amount: calculateTotal(weekTips),
        count: weekTips.length
      },
      month: {
        amount: calculateTotal(monthTips),
        count: monthTips.length
      },
      recentTips: allTips
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(order => ({
          orderNumber: order.orderNumber,
          amount: order.tipAmount ? parseFloat(order.tipAmount.toString()) : 0,
          type: order.tipType,
          percentage: order.tipPercentage,
          date: order.createdAt
        }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching tip statistics:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
