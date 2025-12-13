import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';

async function handleGET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Ungültige Bestellungs-ID' },
        { status: 400 }
      );
    }

    // Hole die Bestellung mit allen Details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                taxRate: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Hole Restaurant-Einstellungen
    const restaurantSettings = await prisma.restaurantSettings.findFirst();

    // Berechne MwSt.-Aufschlüsselung neu basierend auf den OrderItems
    let taxBreakdown: { [key: string]: { net: number; tax: number; rate: number } } = {};
    
    order.orderItems.forEach((item: any) => {
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

    // Formatiere die Bon-Daten
    const receipt = {
      // Restaurant-Info
      restaurant: {
        name: restaurantSettings?.restaurantName || 'Gastro CMS',
        address: restaurantSettings?.address || '',
        phone: restaurantSettings?.phone || '',
        email: restaurantSettings?.email || '',
        taxNumber: (restaurantSettings as any)?.taxNumber || '',
        uid: (restaurantSettings as any)?.uid || ''
      },
      
      // Bestellungs-Info
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString(),
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.notes?.includes('Bar') ? 'Bar' : 'Karte'
      },
      
      // Kunden-Info
      customer: {
        name: `${(order as any).customer?.firstName || ''} ${(order as any).customer?.lastName || ''}`.trim(),
        email: (order as any).customer?.email || '',
        phone: (order as any).customer?.phone || '',
        address: (order as any).customer?.address ? 
          `${(order as any).customer.address}, ${(order as any).customer.postalCode} ${(order as any).customer.city}` : ''
      },
      
      // Bestellpositionen
      items: (order as any).orderItems.map((item: any) => ({
        name: item.product.name,
        description: item.product.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        taxRate: parseFloat(item.taxRate.toString()),
        taxRatePercent: Math.round(parseFloat(item.taxRate.toString()) * 100)
      })),
      
      // Gutschein
      coupon: (order as any).appliedCoupon ? {
        code: (order as any).appliedCoupon.code,
        discountAmount: parseFloat((order as any).appliedCoupon.discountAmount.toString()),
        discountType: (order as any).appliedCoupon.discountType
      } : null,
      
      // MwSt.-Aufschlüsselung
      taxBreakdown: Object.keys(taxBreakdown).map(key => ({
        rate: taxBreakdown[key].rate,
        ratePercent: Math.round(taxBreakdown[key].rate * 100),
        netAmount: Math.round(taxBreakdown[key].net * 100) / 100,
        taxAmount: Math.round(taxBreakdown[key].tax * 100) / 100
      })),
      
      // Summen
      totals: {
        subtotal: parseFloat(order.totalAmountNet.toString()),
        totalTax: parseFloat(order.totalTax.toString()),
        totalAmount: parseFloat(order.totalAmount.toString()),
        deliveryFee: order.deliveryType === 'DELIVERY' ? 2.50 : 0,
        tipAmount: parseFloat((order.tipAmount || 0).toString()),
        finalTotal: parseFloat(order.totalAmount.toString()) + (order.deliveryType === 'DELIVERY' ? 2.50 : 0) + parseFloat((order.tipAmount || 0).toString())
      }
    };

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Fehler beim Generieren des Bons:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des Bons' },
      { status: 500 }
    );
  }
}

export const GET = createProtectedHandler({
  requireAuth: true,
  allowPublicRead: false
}, (request: any) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2];
  return handleGET(request, { params: Promise.resolve({ id }) });
});
