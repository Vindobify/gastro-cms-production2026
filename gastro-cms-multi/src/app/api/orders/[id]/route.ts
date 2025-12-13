import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { sendOrderUpdate } from '../live/route';
import { sendOrderStatusUpdateToCustomer } from '@/lib/emailService';
import { getTenant } from '@/lib/tenant';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Ungültige Bestell-ID' },
        { status: 400 }
      );
    }

    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const [order, restaurantSettings] = await Promise.all([
      prisma.order.findFirst({
        where: {
          id: orderId,
          tenantId: tenant.id
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
          },
          couponUsages: {
            include: {
              coupon: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      Promise.resolve(tenant.settings)
    ]);

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Berechne Steueraufschlüsselung
    let taxBreakdown: { [key: string]: { net: number; tax: number; rate: number } } = {};

    order.orderItems.forEach((item: any) => {
      const taxRate = parseFloat(item.taxRate.toString());
      const itemTotal = Number(item.totalPrice);
      const itemNet = itemTotal / (1 + taxRate);
      const itemTax = itemTotal - itemNet;

      const taxKey = `${Math.round(taxRate * 100)}%`;
      if (!taxBreakdown[taxKey]) {
        taxBreakdown[taxKey] = { net: 0, tax: 0, rate: taxRate };
      }
      taxBreakdown[taxKey].net += itemNet;
      taxBreakdown[taxKey].tax += itemTax;
    });

    // Runde die Werte auf 2 Dezimalstellen
    Object.keys(taxBreakdown).forEach(key => {
      taxBreakdown[key].net = Math.round(taxBreakdown[key].net * 100) / 100;
      taxBreakdown[key].tax = Math.round(taxBreakdown[key].tax * 100) / 100;
    });

    // Transformiere die Daten, um sicherzustellen, dass totalPrice ein Number ist
    const transformedOrder = {
      ...order,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        totalPrice: Number(item.totalPrice),
        unitPrice: Number(item.unitPrice)
      })),
      taxBreakdown: taxBreakdown,
      restaurantAddress: restaurantSettings ? {
        address: restaurantSettings.address,
        city: restaurantSettings.city,
        postalCode: restaurantSettings.postalCode
      } : null
    };

    return NextResponse.json(transformedOrder);

  } catch (error) {
    console.error('Fehler beim Laden der Bestellung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Ungültige Bestell-ID' },
        { status: 400 }
      );
    }

    // Ownership Check
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const existingOrder = await prisma.order.findFirst({ where: { id: orderId, tenantId: tenant.id } });
    if (!existingOrder) return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });

    const body = await request.json();
    const { status, deliveryTime } = body;

    // Prüfe ob mindestens ein Feld zum Aktualisieren vorhanden ist
    if (status === undefined && deliveryTime === undefined) {
      return NextResponse.json(
        { error: 'Status oder deliveryTime ist erforderlich' },
        { status: 400 }
      );
    }

    // Daten für Update vorbereiten
    const updateData: any = {};
    if (status) updateData.status = status;
    if (deliveryTime) {
      try {
        const date = new Date(deliveryTime);
        if (isNaN(date.getTime())) {
          console.warn('Ungültige Lieferzeit, überspringe Update:', deliveryTime);
        } else {
          updateData.deliveryTime = date;
        }
      } catch (error) {
        console.warn('Fehler beim Parsen der Lieferzeit:', deliveryTime, error);
      }
    }

    const [updatedOrder, restaurantSettings] = await Promise.all([
      prisma.order.update({
        where: { id: orderId },
        data: updateData,
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
      }),
      Promise.resolve(tenant.settings)
    ]);

    // Transformiere die Daten, um sicherzustellen, dass totalPrice ein Number ist
    const transformedOrder = {
      ...updatedOrder,
      orderItems: updatedOrder.orderItems.map((item: any) => ({
        ...item,
        totalPrice: Number(item.totalPrice),
        unitPrice: Number(item.unitPrice)
      })),
      restaurantAddress: restaurantSettings ? {
        address: restaurantSettings.address,
        city: restaurantSettings.city,
        postalCode: restaurantSettings.postalCode
      } : null
    };

    // Sende Live-Update an alle verbundenen Clients
    try {
      await sendOrderUpdate(orderId.toString(), tenant.id, 'order_updated', transformedOrder);
    } catch (error) {
      console.error('Fehler beim Senden des Live-Updates:', error);
    }

    // Sende E-Mail-Update an Kunde bei Statusänderung
    if (status) {
      try {
        await sendOrderStatusUpdateToCustomer(orderId, status);
        console.log('✅ Status-Update E-Mail an Kunde gesendet');
      } catch (emailError) {
        console.error('❌ Fehler beim Senden der Status-Update E-Mail:', emailError);
        // E-Mail-Fehler sollen das Status-Update nicht blockieren
      }
    }

    // Erstelle Lieferstatistik wenn Status auf DELIVERED gesetzt wird
    if (status === 'DELIVERED' && updatedOrder.deliveryDriverId) {
      try {
        // Prüfe, ob bereits eine Statistik existiert
        const existingStat = await (prisma as any).deliveryStats.findFirst({
          where: {
            orderId: orderId,
            deliveryDriverId: updatedOrder.deliveryDriverId
          }
        });

        if (!existingStat) {
          // Berechne Lieferzeit (falls deliveryTime gesetzt ist)
          let deliveryTimeMinutes = null;
          if (updatedOrder.deliveryTime) {
            const deliveryTime = new Date(updatedOrder.deliveryTime);
            const now = new Date();
            deliveryTimeMinutes = Math.round((now.getTime() - deliveryTime.getTime()) / (1000 * 60));
          }

          // Erstelle Lieferstatistik
          await (prisma as any).deliveryStats.create({
            data: {
              deliveryDriverId: updatedOrder.deliveryDriverId,
              orderId: orderId,
              deliveryDate: new Date(),
              deliveryTime: deliveryTimeMinutes,
              distance: null, // Kann später über GPS-Tracking berechnet werden
              tipAmount: updatedOrder.tipAmount || null,
              rating: null // Kann später über Kundenbewertung gesetzt werden
            }
          });

          // Lieferstatistik erstellt
        }
      } catch (error) {
        console.error('❌ Fehler beim Erstellen der Lieferstatistik:', error);
        // Fehler bei Statistik-Erstellung soll das Status-Update nicht blockieren
      }
    }

    return NextResponse.json(transformedOrder);

  } catch (error) {
    console.error('Fehler beim Aktualisieren der Bestellung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Bestellungs-ID' },
        { status: 400 }
      );
    }

    // Ownership Check
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const checkOrder = await prisma.order.findFirst({ where: { id, tenantId: tenant.id } });
    if (!checkOrder) return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });

    const body = await request.json();
    const {
      customerId,
      orderItems,
      deliveryType,
      deliveryTime,
      notes,
      couponCode,
      status
    } = body;

    // Wenn orderItems gesendet werden, aktualisiere die komplette Bestellung
    if (orderItems && Array.isArray(orderItems)) {
      // Berechne den neuen Gesamtbetrag
      let totalAmount = 0;
      orderItems.forEach((item: any) => {
        totalAmount += (item.quantity * item.unitPrice);
      });

      // Berechne MwSt. (Standard 20%)
      const taxRate = 0.20;
      const totalAmountNet = totalAmount / (1 + taxRate);
      const totalTax = totalAmount - totalAmountNet;

      // Hole den Gutschein, falls angegeben
      let couponId = null;
      if (couponCode) {
        const coupon = await prisma.coupon.findFirst({
          where: { code: couponCode.toUpperCase() }
        });
        if (coupon) {
          couponId = coupon.id;
        }
      }

      // Aktualisiere die Bestellung mit Transaktion
      const order = await prisma.$transaction(async (tx: any) => {
        // Aktualisiere die Bestellung
        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            customerId: parseInt(customerId),
            deliveryType: deliveryType || 'PICKUP',
            deliveryTime: deliveryType === 'DELIVERY' && deliveryTime ? (() => {
              try {
                const date = new Date(deliveryTime);
                return isNaN(date.getTime()) ? null : date;
              } catch (error) {
                console.warn('Fehler beim Parsen der Lieferzeit:', deliveryTime, error);
                return null;
              }
            })() : null,
            notes: notes || '',
            totalAmount: Math.round(totalAmount * 100) / 100,
            totalAmountNet: Math.round(totalAmountNet * 100) / 100,
            totalTax: Math.round(totalTax * 100) / 100,
            couponId
          }
        });

        // Lösche alle bestehenden Bestellpositionen
        await tx.orderItem.deleteMany({
          where: { orderId: id }
        });

        // Erstelle neue Bestellpositionen
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: id,
              productId: parseInt(item.productId),
              extraIds: item.extraIds && item.extraIds.length > 0
                ? JSON.stringify(item.extraIds)
                : null,
              quantity: item.quantity,
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: (item.quantity * item.unitPrice)
            }
          });
        }

        return updatedOrder;
      });

      // Hole die vollständige aktualisierte Bestellung
      const fullOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json(fullOrder);
    } else {
      // Einfache Aktualisierung nur der Status-Felder
      const order = await prisma.order.update({
        where: { id },
        data: {
          status: status,
          deliveryTime: deliveryTime ? (() => {
            try {
              const date = new Date(deliveryTime);
              return isNaN(date.getTime()) ? null : date;
            } catch (error) {
              console.warn('Fehler beim Parsen der Lieferzeit:', deliveryTime, error);
              return null;
            }
          })() : null,
          notes: notes || ''
        }
      });

      return NextResponse.json(order);
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Bestellung' },
      { status: 500 }
    );
  }
}

// DELETE - Bestellung löschen (nur für Admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Bestellungs-ID' },
        { status: 400 }
      );
    }

    // Prüfe ob Bestellung existiert und hole Informationen (Tenant aware)
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const existingOrder = await prisma.order.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        orderItems: true,
        couponUsages: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Lösche alle abhängigen Datensätze in einer Transaktion
    await prisma.$transaction(async (tx: any) => {
      // Lösche Gutschein-Verwendungen falls vorhanden
      if (existingOrder.couponUsages.length > 0) {
        await tx.couponUsage.deleteMany({
          where: { orderId: id }
        });
      }

      // Lösche alle Bestellpositionen
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      });

      // Lösche die Bestellung
      await tx.order.delete({
        where: { id }
      });
    });

    // Bestellung wurde gelöscht

    return NextResponse.json({
      success: true,
      message: `Bestellung #${existingOrder.orderNumber} wurde erfolgreich gelöscht`,
      deletedOrder: {
        id: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        customerName: `${existingOrder.customer.firstName} ${existingOrder.customer.lastName}`
      }
    });

  } catch (error) {
    console.error('Fehler beim Löschen der Bestellung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Bestellung' },
      { status: 500 }
    );
  }
}
