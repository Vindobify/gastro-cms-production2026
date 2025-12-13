import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { getTenant } from '@/lib/tenant';

// Hilfsfunktion für Steuerberechnung
function calculateTaxBreakdown(items: any[]) {
  let subtotalNet = 0;
  let totalTax = 0;
  const taxGroups: { [key: number]: { amount: number; label: string } } = {};

  items.forEach((item: any) => {
    const itemTotal = parseFloat(item.totalPrice.toString());
    const itemNet = itemTotal / (1 + parseFloat(item.taxRate.toString()));
    const itemTax = itemTotal - itemNet;

    subtotalNet += itemNet;
    totalTax += itemTax;

    // Gruppiere nach Steuersätzen
    const rateKey = parseFloat(item.taxRate.toString());
    if (!taxGroups[rateKey]) {
      const label = rateKey === 0.10 ? 'MwSt. 10% (Speisen)' :
        rateKey === 0.20 ? 'MwSt. 20% (Getränke)' :
          `MwSt. ${(rateKey * 100).toFixed(0)}%`;
      taxGroups[rateKey] = { amount: 0, label };
    }
    taxGroups[rateKey].amount += itemTax;
  });

  const taxBreakdown = Object.entries(taxGroups).map(([rate, data]) => ({
    rate: parseFloat(rate),
    amount: Math.round(data.amount * 100) / 100,
    label: data.label
  })).sort((a, b) => b.rate - a.rate);

  return {
    subtotalNet: Math.round(subtotalNet * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    taxBreakdown
  };
}

async function handleGET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Hole den aktuellen Tenant
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    // Hole den Warenkorb mit allen Items - nur für den aktuellen Tenant
    const cart = await (prisma as any).cart.findFirst({
      where: { 
        id: cartId,
        tenantId: tenant.id
      },
      include: {
        items: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        appliedCoupon: true,
        customer: true
      }
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Warenkorb nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob der Warenkorb abgelaufen ist
    if (new Date() > cart.expiresAt) {
      // Lösche abgelaufenen Warenkorb
      await (prisma as any).cart.delete({
        where: { id: cartId }
      });

      return NextResponse.json(
        { error: 'Warenkorb ist abgelaufen' },
        { status: 410 }
      );
    }

    // Berechne Steueraufschlüsselung
    const taxCalculation = calculateTaxBreakdown(cart.items);

    // Transformiere die Daten
    const transformedCart = {
      id: cart.id,
      customerId: cart.customerId,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice.toString()),
      appliedCoupon: cart.appliedCoupon ? {
        id: cart.appliedCoupon.id,
        code: cart.appliedCoupon.code,
        name: cart.appliedCoupon.name,
        discountType: cart.appliedCoupon.discountType,
        discountValue: parseFloat(cart.appliedCoupon.discountValue.toString()),
        maximumDiscount: cart.appliedCoupon.maximumDiscount ? parseFloat(cart.appliedCoupon.maximumDiscount.toString()) : null
      } : null,
      discountAmount: parseFloat(cart.discountAmount.toString()),
      subtotalAfterDiscount: parseFloat(cart.subtotalAfterDiscount.toString()),
      subtotalNet: taxCalculation.subtotalNet,
      totalTax: taxCalculation.totalTax,
      taxBreakdown: taxCalculation.taxBreakdown,
      items: cart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
        extras: item.extras ? JSON.parse(item.extras) : [],
        totalPrice: parseFloat(item.totalPrice.toString()),
        taxRate: parseFloat(item.taxRate.toString()),
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: parseFloat(item.product.price?.toString() || '0'),
          taxRate: parseFloat(item.product.taxRate.toString()),
          allergens: item.product.allergens
        }
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      expiresAt: cart.expiresAt
    };

    return NextResponse.json(transformedCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Warenkorbs' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    // Verwende Prisma mit Fallback
    // Verwende Prisma direkt

    // Erstelle neuen Warenkorb
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 Stunden gültig

    // Hole den aktuellen Tenant
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    const cart = await (prisma as any).cart.create({
      data: {
        customerId: customerId || null,
        expiresAt,
        tenantId: tenant.id
      }
    });

    return NextResponse.json({
      id: cart.id,
      expiresAt: cart.expiresAt
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cart:', error);
    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen des Warenkorbs',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

// Öffentlicher Zugriff für Warenkorb-Operationen
export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, handlePOST);
