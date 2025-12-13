import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';

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

    // Formatiere die Daten für die professionellen Komponenten
    const receiptData = {
      // Restaurant-Info
      restaurantName: restaurantSettings?.restaurantName || 'Gastro CMS',
      restaurantAddress: restaurantSettings?.address || '',
      restaurantPhone: restaurantSettings?.phone || '',
      restaurantEmail: restaurantSettings?.email || '',
      taxNumber: (restaurantSettings as any)?.taxNumber || '',
      uid: (restaurantSettings as any)?.uid || '',
      
      // Bestellungs-Info
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toISOString(),
      orderStatus: order.status,
      deliveryType: order.deliveryType,
      paymentMethod: order.notes?.includes('Bar') ? 'Bar' : 'Karte',
      
      // Kunden-Info
      customerName: `${(order as any).customer?.firstName || ''} ${(order as any).customer?.lastName || ''}`.trim(),
      customerEmail: (order as any).customer?.email || '',
      customerPhone: (order as any).customer?.phone || '',
      customerAddress: (order as any).customer?.address ? 
        `${(order as any).customer.address}, ${(order as any).customer.postalCode} ${(order as any).customer.city}` : '',
      
      // Bestellpositionen
      items: (order as any).orderItems.map((item: any) => ({
        id: item.id,
        productName: item.product.name,
        description: item.product.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        taxRate: parseFloat(item.taxRate.toString()),
        extras: [] // TODO: Parse extras from item.extras if available
      })),
      
      // MwSt.-Aufschlüsselung
      taxBreakdown: Object.keys(taxBreakdown).map(key => ({
        rate: taxBreakdown[key].rate,
        ratePercent: Math.round(taxBreakdown[key].rate * 100),
        netAmount: Math.round(taxBreakdown[key].net * 100) / 100,
        taxAmount: Math.round(taxBreakdown[key].tax * 100) / 100
      })),
      
      // Summen
      subtotal: parseFloat(order.totalAmountNet.toString()),
      totalTax: parseFloat(order.totalTax.toString()),
      totalAmount: parseFloat(order.totalAmount.toString()),
      deliveryFee: order.deliveryType === 'DELIVERY' ? 2.50 : 0,
      tipAmount: parseFloat((order.tipAmount || 0).toString()),
      
      // Lieferung
      deliveryTime: order.deliveryTime?.toISOString(),
      notes: order.notes || '',
      
      // Footer
      printTime: new Date().toISOString(),
      restaurantFooter: 'Vielen Dank für Ihren Besuch!'
    };


    return NextResponse.json(receiptData);

  } catch (error) {
    console.error('Fehler beim Generieren des professionellen Bons:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des Bons' },
      { status: 500 }
    );
  }
}

export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, async (request: AuthenticatedRequest) => {
  // Extrahiere ID aus der URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // /api/orders/[id]/receipt
  
  return handleGET(request, { params: Promise.resolve({ id }) });
});
