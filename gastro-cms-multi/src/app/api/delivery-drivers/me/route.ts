import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyToken } from '@/lib/jwt';

async function handleGET(request: NextRequest) {
  try {
    // Token aus Cookie oder Authorization-Header holen
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Prüfe Authorization-Header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Benutzer nicht authentifiziert' },
        { status: 401 }
      );
    }

    // JWT Token verifizieren
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      console.error('JWT-Verifizierungsfehler:', jwtError);
      return NextResponse.json(
        { error: 'Ungültiger Token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Finde den Lieferanten-Account für den aktuellen Benutzer
    const driver = await prisma.deliveryDriver.findFirst({
      where: { userId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true,
        assignedOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            deliveryTime: true,
            createdAt: true,
            tipAmount: true,
            tipType: true,
            tipPercentage: true,
            tipPaid: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                address: true,
                city: true,
                postalCode: true,
                phone: true
              }
            },
            orderItems: {
              select: {
                id: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Kein Lieferanten-Profil für diesen Benutzer gefunden' },
        { status: 404 }
      );
    }

    // Transformiere die Daten für das Frontend
    const transformedDriver = {
      id: driver.id,
      userId: driver.userId,
      email: driver.user.email,
      firstName: driver.user.profile?.firstName || '',
      lastName: driver.user.profile?.lastName || '',
      phone: driver.profile?.phone || '',
      avatar: driver.profile?.avatar || '',
      isActive: driver.isActive,
      isAvailable: driver.isAvailable,
      gpsEnabled: driver.profile?.gpsEnabled || false,
      workingHours: driver.profile?.workingHours ? JSON.parse(driver.profile.workingHours) : null,
      currentLocation: driver.currentLocation ? JSON.parse(driver.currentLocation) : null,
      lastLocationUpdate: driver.lastLocationUpdate,
      assignedOrders: driver.assignedOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerAddress: order.customer.address,
        customerCity: order.customer.city,
        customerPostalCode: order.customer.postalCode,
        customerPhone: order.customer.phone,
        totalAmount: Number(order.totalAmount),
        deliveryTime: order.deliveryTime,
        createdAt: order.createdAt,
        tipAmount: order.tipAmount ? Number(order.tipAmount) : 0,
        tipType: order.tipType,
        tipPercentage: order.tipPercentage ? Number(order.tipPercentage) : null,
        tipPaid: order.tipPaid,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        }))
      }))
    };

    return NextResponse.json(transformedDriver);
  } catch (error) {
    console.error('Error fetching current delivery driver:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Lieferanten-Profils' },
      { status: 500 }
    );
  }
}

export const GET = handleGET;
