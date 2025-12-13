import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { getTenant } from '@/lib/tenant';

async function handlePOST(request: AuthenticatedRequest, context: { params: { cartId: string } }) {
  try {
    const cartId = context.params.cartId;
    const body = await request.json();
    const { productId, quantity, extras } = body;

    // Validiere Eingaben
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Produkt-ID und gültige Menge sind erforderlich' },
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

    // Prüfe ob Warenkorb existiert - nur für den aktuellen Tenant
    const cart = await (prisma as any).cart.findFirst({
      where: { 
        id: cartId,
        tenantId: tenant.id
      },
      include: { items: true }
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Warenkorb nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Warenkorb abgelaufen ist
    if (new Date() > cart.expiresAt) {
      await (prisma as any).cart.delete({ where: { id: cartId } });
      return NextResponse.json(
        { error: 'Warenkorb ist abgelaufen' },
        { status: 410 }
      );
    }

    // Hole Produktdaten - nur für den aktuellen Tenant
    const product = await (prisma as any).product.findFirst({
      where: { 
        id: productId,
        tenantId: tenant.id
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nicht gefunden' },
        { status: 404 }
      );
    }

    // Berechne Extras-Preis
    const extrasPrice = extras ? extras.reduce((sum: number, extra: any) => sum + (extra.price || 0), 0) : 0;
    const unitPrice = parseFloat(product.price?.toString() || '0') + extrasPrice;
    const totalPrice = unitPrice * quantity;

    // Prüfe ob identisches Item bereits existiert
    const existingItem = cart.items.find((item: any) => {
      if (item.productId !== productId) return false;
      
      const itemExtras = item.extras ? JSON.parse(item.extras) : [];
      if (itemExtras.length !== (extras?.length || 0)) return false;
      
      // Vergleiche Extras
      const extrasMatch = (itemExtras.length === 0 && (!extras || extras.length === 0)) ||
        (itemExtras.length > 0 && extras && itemExtras.every((itemExtra: any, index: number) => 
          itemExtra.extraItemId === extras[index].extraItemId &&
          itemExtra.extraGroupId === extras[index].extraGroupId
        ));
      
      return extrasMatch;
    });

    let cartItem;
    let newTotalItems = cart.totalItems;
    let newTotalPrice = parseFloat(cart.totalPrice.toString());

    if (existingItem) {
      // Erhöhe Menge des bestehenden Items
      cartItem = await (prisma as any).cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          totalPrice: (existingItem.quantity + quantity) * unitPrice
        }
      });
      newTotalItems += quantity;
      newTotalPrice += totalPrice;
    } else {
      // Erstelle neues Item
      cartItem = await (prisma as any).cartItem.create({
        data: {
          cartId,
          productId,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price?.toString() || '0'),
          quantity,
          extras: extras ? JSON.stringify(extras) : null,
          totalPrice,
          taxRate: parseFloat(product.taxRate.toString())
        }
      });
      newTotalItems += quantity;
      newTotalPrice += totalPrice;
    }

    // Aktualisiere Warenkorb-Gesamtsumme
    await (prisma as any).cart.update({
      where: { id: cartId },
      data: {
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      id: cartItem.id,
      productId: cartItem.productId,
      name: cartItem.name,
      description: cartItem.description,
      price: parseFloat(cartItem.price.toString()),
      quantity: cartItem.quantity,
      extras: cartItem.extras ? JSON.parse(cartItem.extras) : [],
      totalPrice: parseFloat(cartItem.totalPrice.toString()),
      taxRate: parseFloat(cartItem.taxRate.toString())
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hinzufügen zum Warenkorb' },
      { status: 500 }
    );
  }
}

async function handleGET(request: AuthenticatedRequest, context: { params: { cartId: string } }) {
  try {
    const cartId = context.params.cartId;

    // Hole den aktuellen Tenant
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    // Hole den Warenkorb - nur für den aktuellen Tenant
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
        }
      }
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Warenkorb nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Warenkorb abgelaufen ist
    if (new Date() > cart.expiresAt) {
      await (prisma as any).cart.delete({ where: { id: cartId } });
      return NextResponse.json(
        { error: 'Warenkorb ist abgelaufen' },
        { status: 410 }
      );
    }

    const items = cart.items.map((item: any) => ({
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
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Warenkorb-Items' },
      { status: 500 }
    );
  }
}

// Öffentlicher Zugriff für Warenkorb-Items
export const POST = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, (request: AuthenticatedRequest) => {
  // Extrahiere cartId aus der URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const cartId = pathParts[pathParts.length - 2];
  
  return handlePOST(request, { params: { cartId } });
});

export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, (request: AuthenticatedRequest) => {
  // Extrahiere cartId aus der URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const cartId = pathParts[pathParts.length - 2];
  
  return handleGET(request, { params: { cartId } });
});
