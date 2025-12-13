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

    // Echte Benachrichtigungsdaten sammeln
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Neue Aufträge (heute zugewiesen)
    const newOrdersToday = await prisma.order.count({
      where: {
        deliveryDriverId: driverId,
        createdAt: {
          gte: today
        },
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
        }
      }
    });

    // Status-Updates (heute)
    const statusUpdatesToday = await prisma.order.count({
      where: {
        deliveryDriverId: driverId,
        updatedAt: {
          gte: today
        },
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']
        }
      }
    });

    // Pending Aufträge (noch nicht bestätigt)
    const pendingOrders = await prisma.order.count({
      where: {
        deliveryDriverId: driverId,
        status: 'PENDING'
      }
    });

    // Überfällige Aufträge (älter als 30 Minuten)
    const overdueOrders = await prisma.order.count({
      where: {
        deliveryDriverId: driverId,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY']
        },
        createdAt: {
          lt: new Date(now.getTime() - 30 * 60 * 1000) // 30 Minuten
        }
      }
    });

    // Gesamtanzahl der Benachrichtigungen
    const totalNotifications = newOrdersToday + statusUpdatesToday + pendingOrders + overdueOrders;

    // Detaillierte Benachrichtigungen
    const notifications = [];

    if (newOrdersToday > 0) {
      notifications.push({
        type: 'new_orders',
        title: 'Neue Aufträge',
        message: `${newOrdersToday} neue Aufträge heute`,
        count: newOrdersToday,
        priority: 'high',
        icon: '📦'
      });
    }

    if (statusUpdatesToday > 0) {
      notifications.push({
        type: 'status_updates',
        title: 'Status-Updates',
        message: `${statusUpdatesToday} Aufträge aktualisiert`,
        count: statusUpdatesToday,
        priority: 'medium',
        icon: '🔄'
      });
    }

    if (pendingOrders > 0) {
      notifications.push({
        type: 'pending_orders',
        title: 'Ausstehende Aufträge',
        message: `${pendingOrders} Aufträge warten auf Bestätigung`,
        count: pendingOrders,
        priority: 'high',
        icon: '⏳'
      });
    }

    if (overdueOrders > 0) {
      notifications.push({
        type: 'overdue_orders',
        title: 'Überfällige Aufträge',
        message: `${overdueOrders} Aufträge sind überfällig`,
        count: overdueOrders,
        priority: 'urgent',
        icon: '⚠️'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalNotifications,
        newOrdersToday,
        statusUpdatesToday,
        pendingOrders,
        overdueOrders,
        notifications,
        lastChecked: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
