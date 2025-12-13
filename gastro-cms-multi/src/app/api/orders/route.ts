import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { sendOrderUpdate } from './live/route';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';
import { sendNewOrderNotificationToRestaurant, sendOrderConfirmationToCustomer } from '@/lib/emailService';
import { normalizeDecimalFields, DECIMAL_FIELDS } from '@/lib/decimalUtils';
import { getTenant, getTenantOrThrow } from '@/lib/tenant';

// Hilfsfunktion um extraIds zu ExtraItem-Daten zu konvertieren
async function getExtrasForOrderItems(orderItems: any[]) {
  // Sammle alle extraIds
  const allExtraIds = new Set<number>();
  orderItems.forEach(item => {
    if (item.extraIds) {
      try {
        const ids = JSON.parse(item.extraIds);
        if (Array.isArray(ids)) {
          ids.forEach((id: number) => allExtraIds.add(id));
        }
      } catch (error) {
        console.warn('Fehler beim Parsen von extraIds:', item.extraIds, error);
      }
    }
  });

  if (allExtraIds.size === 0) {
    return {};
  }

  // Lade alle ExtraItems
  const extraItems = await prisma.extraItem.findMany({
    where: {
      id: { in: Array.from(allExtraIds) }
    },
    include: {
      extraGroup: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Erstelle ein Map für schnellen Zugriff
  const extraItemsMap = new Map();
  extraItems.forEach(item => {
    extraItemsMap.set(item.id, {
      id: item.id,
      name: item.name,
      price: item.price,
      isFree: item.isFree,
      extraGroupId: item.extraGroupId,
      extraGroupName: item.extraGroup.name
    });
  });

  return extraItemsMap;
}

async function handleGET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    let where: any = { tenantId: tenant.id };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    const [orders, restaurantSettings] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          totalAmountNet: true,
          totalTax: true,
          createdAt: true,
          updatedAt: true,
          deliveryTime: true,
          notes: true,
          tipAmount: true,
          tipType: true,
          tipPercentage: true,
          tipPaid: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              postalCode: true
            }
          },
          deliveryDriver: {
            select: {
              id: true,
              user: {
                select: {
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
          orderItems: {
            select: {
              id: true,
              productId: true,
              extraIds: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              taxRate: true,
              product: {
                select: {
                  name: true,
                  description: true,
                  taxRate: true
                }
              }
            }
          }
        } as any,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit ? parseInt(limit) : undefined
      }),
      Promise.resolve(tenant.settings) // Settings already loaded in getTenant
    ]);

    // Lade alle Extras-Daten für alle Bestellungen
    const allOrderItems = orders.flatMap((order: any) => order.orderItems || []);
    const extraItemsMap = await getExtrasForOrderItems(allOrderItems);

    // Normalisiere alle Decimal-Werte und verarbeite Extras
    const transformedOrders = orders.map((order: any) => {
      const normalizedOrder = normalizeDecimalFields(order, [...DECIMAL_FIELDS.ORDER, ...DECIMAL_FIELDS.ORDER_ITEM]);

      // Ensure createdAt is a valid date string
      if (!normalizedOrder.createdAt ||
        (typeof normalizedOrder.createdAt === 'object' && Object.keys(normalizedOrder.createdAt).length === 0) ||
        normalizedOrder.createdAt === '{}' ||
        normalizedOrder.createdAt === 'null' ||
        normalizedOrder.createdAt === '""' ||
        normalizedOrder.createdAt === '[]') {
        console.warn('Invalid createdAt value found for order:', order.id, 'Value:', normalizedOrder.createdAt, 'Setting to current date');
        normalizedOrder.createdAt = new Date().toISOString();
      }

      // Verarbeite OrderItems und füge Extras hinzu
      const processedOrderItems = normalizedOrder.orderItems.map((item: any) => {
        let extras: any[] = [];

        if (item.extraIds) {
          try {
            const extraIds = JSON.parse(item.extraIds);
            if (Array.isArray(extraIds)) {
              extras = extraIds.map((id: number) => {
                const extraItem = (extraItemsMap as Map<number, any>).get(id);
                if (extraItem) {
                  return {
                    id: extraItem.id,
                    name: extraItem.name,
                    price: extraItem.price,
                    isFree: extraItem.isFree,
                    extraGroupId: extraItem.extraGroupId,
                    extraGroupName: extraItem.extraGroupName
                  };
                }
                return null;
              }).filter(Boolean);
            }
          } catch (error) {
            console.warn('Fehler beim Parsen von extraIds für Item:', item.id, error);
          }
        }

        return {
          ...item,
          extras: extras,
          productName: item.product.name,
          taxRate: item.product.taxRate
        };
      });

      // Berechne Steueraufschlüsselung neu
      let taxBreakdown: { [key: string]: { net: number; tax: number; rate: number } } = {};

      processedOrderItems.forEach((item: any) => {
        const taxRate = parseFloat(item.taxRate.toString());
        const itemTotal = parseFloat(item.totalPrice.toString());
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

      return {
        ...normalizedOrder,
        orderItems: processedOrderItems,
        taxBreakdown: taxBreakdown,
        restaurantAddress: restaurantSettings ? {
          name: restaurantSettings.restaurantName,
          address: restaurantSettings.address
        } : null
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellungen' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      customerData,
      orderItems,
      orderType,
      deliveryType,
      deliveryTime,
      paymentMethod,
      appliedCoupon,
      totalAmount,
      deliveryFee,
      tipAmount,
      tipType,
      tipPercentage
    } = body;

    // Generiere eine eindeutige 6-stellige Bestellnummer
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const tenant = await getTenantOrThrow();

    // Lade Restaurant-Einstellungen für Validierungen
    const restaurantSettings = tenant.settings;

    // Bestellschluss-Validierung
    if (restaurantSettings?.orderDeadline) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: restaurantSettings.timezone || 'Europe/Vienna'
      });

      const orderDeadline = restaurantSettings.orderDeadline;

      // Vergleiche aktuelle Zeit mit Bestellschluss
      if (currentTime > orderDeadline) {
        return NextResponse.json(
          {
            error: `Bestellungen sind nur bis ${orderDeadline} Uhr möglich. Aktuelle Zeit: ${currentTime}`
          },
          { status: 400 }
        );
      }
    }

    // Postleitzahlen-Validierung für Lieferungen
    if (orderType === 'delivery') {
      if (restaurantSettings?.deliveryDistricts) {
        try {
          // Robuste JSON-Parsing mit Fallback
          let allowedPostalCodes: string[] = [];

          // Versuche zuerst normales JSON-Parsing
          try {
            allowedPostalCodes = JSON.parse(restaurantSettings.deliveryDistricts);
          } catch (jsonError) {
            console.warn('JSON-Parsing fehlgeschlagen, versuche String-Parsing:', jsonError);

            // Fallback: Wenn es ein String ist, versuche es als Array zu parsen
            const cleaned = restaurantSettings.deliveryDistricts
              .replace(/[\[\]"]/g, '') // Entferne Klammern und Anführungszeichen
              .split(',')
              .map(code => code.trim())
              .filter(code => code.length > 0);

            if (cleaned.length > 0) {
              allowedPostalCodes = cleaned;
            } else {
              // Letzter Fallback: Standard-Wiener Bezirke
              allowedPostalCodes = ['1120', '1130', '1140', '1150', '1160'];
            }
          }

          if (allowedPostalCodes.length > 0 && !allowedPostalCodes.includes(customerData.postalCode)) {
            return NextResponse.json(
              {
                error: `Lieferung in die Postleitzahl ${customerData.postalCode} nicht möglich. Wir liefern nur in folgende Bezirke: ${allowedPostalCodes.join(', ')}`
              },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error('Fehler bei der Postleitzahlen-Validierung:', error);
          // Bei Fehlern erlauben wir die Bestellung (nicht blockieren)
          console.warn('Postleitzahlen-Validierung übersprungen aufgrund von Fehlern');
        }
      }
    }

    // Erstelle oder aktualisiere Kunden
    // ACHTUNG Multitenant: Suche Customer nur im Scope des Tenants
    let customer = await prisma.customer.findFirst({
      where: {
        email: customerData.email,
        tenantId: tenant.id
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId: tenant.id, // Multitenant Assignment
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address: orderType === 'delivery' ? customerData.address : null,
          city: orderType === 'delivery' ? customerData.city : null,
          postalCode: orderType === 'delivery' ? customerData.postalCode : null
        }
      });
    } else {
      // Aktualisiere bestehenden Kunden
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          address: orderType === 'delivery' ? customerData.address : customer.address,
          city: orderType === 'delivery' ? customerData.city : customer.city,
          postalCode: orderType === 'delivery' ? customerData.postalCode : customer.postalCode
        }
      });
    }

    // Konvertiere totalAmount zu number
    const totalAmountNumber = parseFloat(totalAmount.toString());

    // Berechne Steuern korrekt basierend auf individuellen Produktsteuersätzen
    let totalAmountNet = 0;
    let totalTax = 0;
    const taxBreakdown: { [key: string]: { net: number; tax: number; rate: number } } = {};

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { taxRate: true }
      });

      const taxRate = parseFloat((product?.taxRate || 0.20).toString()); // Fallback auf 20%
      const itemTotal = parseFloat(item.price.toString()) + (item.extras || []).reduce((sum: number, extra: any) => sum + parseFloat(extra.price.toString()), 0);
      const itemTotalWithQuantity = itemTotal * item.quantity;

      // Berechne Netto- und Steuerbetrag für dieses Produkt
      const itemNet = itemTotalWithQuantity / (1 + taxRate);
      const itemTax = itemTotalWithQuantity - itemNet;

      totalAmountNet += itemNet;
      totalTax += itemTax;

      // Sammle MwSt.-Aufschlüsselung nach Sätzen
      const taxKey = `${Math.round(taxRate * 100)}%`;
      if (!taxBreakdown[taxKey]) {
        taxBreakdown[taxKey] = { net: 0, tax: 0, rate: taxRate };
      }
      taxBreakdown[taxKey].net += itemNet;
      taxBreakdown[taxKey].tax += itemTax;
    }

    // Runde auf 2 Dezimalstellen
    totalAmountNet = Math.round(totalAmountNet * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;

    // Runde auch die MwSt.-Aufschlüsselung
    Object.keys(taxBreakdown).forEach(key => {
      taxBreakdown[key].net = Math.round(taxBreakdown[key].net * 100) / 100;
      taxBreakdown[key].tax = Math.round(taxBreakdown[key].tax * 100) / 100;
    });

    // Erstelle die Bestellung
    // Erstelle die Bestellung
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id, // Multitenant Assignment
        orderNumber,
        customerId: customer.id,
        totalAmount: totalAmountNumber,
        totalAmountNet: totalAmountNet,
        totalTax: totalTax,
        deliveryType: orderType.toUpperCase(),
        deliveryTime: deliveryType === 'later' && deliveryTime ? new Date(deliveryTime) : null,
        status: 'PENDING',
        notes: `Bestellart: ${orderType === 'delivery' ? 'Lieferung' : 'Abholung'}, Zahlung: ${paymentMethod === 'cash' ? 'Bar' : 'Karte'}`,
        // Trinkgeld-Felder
        tipAmount: tipAmount || 0,
        tipType: tipType || 'FIXED',
        tipPercentage: tipPercentage || null,
        tipPaid: false
      } as any
    });

    // Erstelle die Bestellpositionen
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { taxRate: true }
      });

      const taxRate = product?.taxRate || 0.20; // Fallback auf 20%
      const unitPriceNumber = parseFloat(item.price.toString()) + item.extras.reduce((sum: number, extra: any) => sum + parseFloat(extra.price.toString()), 0);
      const totalPriceNumber = parseFloat(item.totalPrice.toString());

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          extraIds: JSON.stringify(item.extras.map((extra: any) => extra.extraItemId)),
          quantity: item.quantity,
          unitPrice: unitPriceNumber,
          totalPrice: totalPriceNumber,
          taxRate: taxRate
        } as any
      });
    }

    // Erstelle Gutschein-Verwendung falls vorhanden
    if (appliedCoupon) {
      const discountAmountNumber = parseFloat((appliedCoupon.discountAmount || 0).toString());

      await prisma.couponUsage.create({
        data: {
          couponId: appliedCoupon.id,
          orderId: order.id,
          customerId: customer.id,
          discountAmount: discountAmountNumber
        }
      });

      // Erhöhe Verwendungszähler
      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usageCount: { increment: 1 } }
      });
    }

    // Erstelle Payment Record
    const paymentMethodUpper = (paymentMethod || 'CASH').toUpperCase();
    const commissionRate = Number(tenant.commissionRate) || 0.10;
    const commission = totalAmountNumber * commissionRate;

    const payment = await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        orderId: order.id,
        paymentMethod: paymentMethodUpper,
        amount: totalAmountNumber,
        commission: commission,
        commissionPaid: false,
      } as any
    });

    // Update Order with paymentId and paymentMethod
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: payment.id,
        paymentMethod: paymentMethodUpper,
      } as any
    });

    // Sende Live-Update für neue Bestellung
    try {
      await sendOrderUpdate(order.id.toString(), tenant.id, 'new_order', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status
      });
    } catch (error) {
      console.error('Fehler beim Senden des Live-Updates:', error);
    }

    // E-Mail-Versand für neue Bestellung
    setTimeout(async () => {
      try {
        // E-Mail-Versand wird gestartet
        await sendNewOrderNotificationToRestaurant(order.id);
        await sendOrderConfirmationToCustomer(order.id);
        console.log('✅ E-Mails für neue Bestellung gesendet');
      } catch (emailError) {
        console.error('❌ Fehler beim Senden der E-Mails:', emailError);
      }
    }, 100);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      redirectUrl: `/frontend/bestellbestaetigung/${order.id}`
    });

  } catch (error) {
    console.error('Fehler beim Erstellen der Bestellung:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Erstellen der Bestellung' },
      { status: 500 }
    );
  }
}

// GET für authentifizierte Benutzer (Dashboard), POST für öffentliche Bestellungen
export const GET = createProtectedHandler(AUTH_CONFIGS.AUTHENTICATED, handleGET);
export const POST = handlePOST; // Direkt ohne Auth für öffentliche Bestellungen
