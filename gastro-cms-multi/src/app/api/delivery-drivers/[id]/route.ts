import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { normalizeDecimalFields, DECIMAL_FIELDS } from '@/lib/decimalUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    const driver = await prisma.deliveryDriver.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true,
        assignedOrders: {
          include: {
            customer: true,
            orderItems: {
              include: {
                product: true
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
        { error: 'Lieferant nicht gefunden' },
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
    console.error('Error fetching delivery driver:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Lieferanten' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const { 
      firstName, 
      lastName, 
      phone, 
      workingHours, 
      gpsEnabled, 
      isActive, 
      isAvailable,
      currentLocation 
    } = body;

    // Aktualisiere den Lieferanten
    const updatedDriver = await prisma.deliveryDriver.update({
      where: { id },
      data: {
        isActive,
        isAvailable,
        currentLocation: currentLocation ? JSON.stringify(currentLocation) : null,
        lastLocationUpdate: currentLocation ? new Date() : undefined,
        profile: {
          update: {
            phone,
            workingHours: workingHours ? JSON.stringify(workingHours) : undefined,
            gpsEnabled
          }
        },
        user: {
          update: {
            profile: {
              update: {
                firstName,
                lastName
              }
            }
          }
        }
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true
      }
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error('Error updating delivery driver:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Lieferanten' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Prüfe ob der Lieferant zugewiesene Bestellungen hat
    const driverWithOrders = await prisma.deliveryDriver.findUnique({
      where: { id },
      include: {
        assignedOrders: {
          where: {
            status: {
              in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
            }
          }
        }
      }
    });

    if (driverWithOrders && driverWithOrders.assignedOrders.length > 0) {
      return NextResponse.json(
        { error: 'Lieferant kann nicht gelöscht werden, da er aktive Bestellungen hat' },
        { status: 400 }
      );
    }

    // Lösche den Lieferanten (User wird durch Cascade gelöscht)
    await prisma.deliveryDriver.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery driver:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Lieferanten' },
      { status: 500 }
    );
  }
}
