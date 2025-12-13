import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { sendOrderUpdate } from '../../live/route';
import { sendDeliveryAssignmentToDriver, sendOrderStatusUpdateToCustomer } from '@/lib/emailService';
import { getTenant } from '@/lib/tenant';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const { deliveryDriverId } = body;

    if (!deliveryDriverId) {
      return NextResponse.json(
        { error: 'Lieferant-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Tenancy Check
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, tenantId: tenant.id },
      select: { id: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
    }

    // Prüfe ob der Lieferant existiert und verfügbar ist
    const driver = await prisma.deliveryDriver.findUnique({
      where: { id: deliveryDriverId },
      include: {
        profile: true
      }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    if (!driver.isActive || !driver.isAvailable) {
      return NextResponse.json(
        { error: 'Lieferant ist nicht verfügbar' },
        { status: 400 }
      );
    }

    // Prüfe Arbeitszeiten
    if (driver.profile?.workingHours) {
      const workingHours = JSON.parse(driver.profile.workingHours);
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sonntag, 1 = Montag, etc.
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Zeit in Minuten
      
      const todaySchedule = workingHours.find((day: any) => day.dayOfWeek === currentDay);
      
      if (todaySchedule) {
        const startTime = parseInt(todaySchedule.startTime.split(':')[0]) * 60 + 
                         parseInt(todaySchedule.startTime.split(':')[1]);
        const endTime = parseInt(todaySchedule.endTime.split(':')[0]) * 60 + 
                       parseInt(todaySchedule.endTime.split(':')[1]);
        
        if (currentTime < startTime || currentTime > endTime) {
          return NextResponse.json(
            { error: 'Lieferant arbeitet derzeit nicht' },
            { status: 400 }
          );
        }
      }
    }

    // Aktualisiere die Bestellung
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryDriverId,
        status: 'CONFIRMED' // Setze Status auf bestätigt
      },
      include: {
        customer: true,
        deliveryDriver: {
          include: {
            user: {
              include: {
                profile: true
              }
            },
            profile: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Transformiere die Daten für konsistente Ausgabe
    const transformedOrder = {
      ...updatedOrder,
      orderItems: updatedOrder.orderItems.map((item: any) => ({
        ...item,
        totalPrice: Number(item.totalPrice),
        unitPrice: Number(item.unitPrice)
      }))
    };

    // Sende Live-Update an alle verbundenen Clients
    try {
      await sendOrderUpdate(orderId.toString(), tenant.id, 'order_updated', transformedOrder);
    } catch (error) {
      console.error('Fehler beim Senden des Live-Updates:', error);
    }

    // Sende E-Mails für Lieferantenzuweisung
    try {
      // E-Mail an Lieferant (Bestellzuweisung)
      await sendDeliveryAssignmentToDriver(orderId, deliveryDriverId);
      
      // E-Mail an Kunde (Status-Update: CONFIRMED)
      await sendOrderStatusUpdateToCustomer(orderId, 'CONFIRMED');
      
      console.log('✅ E-Mails für Lieferantenzuweisung gesendet');
    } catch (emailError) {
      console.error('❌ Fehler beim Senden der E-Mails:', emailError);
      // E-Mail-Fehler sollen die Zuweisung nicht blockieren
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: 'Lieferant erfolgreich zugewiesen'
    });
  } catch (error) {
    console.error('Error assigning driver to order:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Lieferantenzuweisung' },
      { status: 500 }
    );
  }
}
