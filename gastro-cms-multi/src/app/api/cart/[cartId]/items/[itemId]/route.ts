import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';

async function handlePUT(request: AuthenticatedRequest, context: { params: { cartId: string; itemId: string } }) {
  try {
    const { cartId, itemId } = context.params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Gültige Menge ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob Warenkorb existiert
    const cart = await (prisma as any).cart.findUnique({
      where: { id: cartId },
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

    // Finde das Item
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Item nicht gefunden' },
        { status: 404 }
      );
    }

    // Berechne neuen Gesamtpreis
    const extrasPrice = item.extras ? JSON.parse(item.extras).reduce((sum: any, extra: any) => sum + (extra.price || 0), 0) : 0;
    const unitPrice = parseFloat(item.price.toString()) + extrasPrice;
    const newTotalPrice = unitPrice * quantity;

    // Aktualisiere Item
    const updatedItem = await (prisma as any).cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: newTotalPrice,
        updatedAt: new Date()
      }
    });

    // Berechne neue Warenkorb-Gesamtsumme
    const allItems = await (prisma as any).cartItem.findMany({
      where: { cartId }
    });

    const newTotalItems = allItems.reduce((sum: any, i: any) => sum + i.quantity, 0);
    const newCartTotalPrice = allItems.reduce((sum: any, i: any) => sum + parseFloat(i.totalPrice.toString()), 0);

    // Aktualisiere Warenkorb
    await (prisma as any).cart.update({
      where: { id: cartId },
      data: {
        totalItems: newTotalItems,
        totalPrice: newCartTotalPrice,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      id: updatedItem.id,
      productId: updatedItem.productId,
      name: updatedItem.name,
      description: updatedItem.description,
      price: parseFloat(updatedItem.price.toString()),
      quantity: updatedItem.quantity,
      extras: updatedItem.extras ? JSON.parse(updatedItem.extras) : [],
      totalPrice: parseFloat(updatedItem.totalPrice.toString()),
      taxRate: parseFloat(updatedItem.taxRate.toString())
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Items' },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: AuthenticatedRequest, context: { params: { cartId: string; itemId: string } }) {
  try {
    const { cartId, itemId } = context.params;

    // Prüfe ob Warenkorb existiert
    const cart = await (prisma as any).cart.findUnique({
      where: { id: cartId },
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

    // Finde das Item
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Item nicht gefunden' },
        { status: 404 }
      );
    }

    // Lösche Item
    await (prisma as any).cartItem.delete({
      where: { id: itemId }
    });

    // Berechne neue Warenkorb-Gesamtsumme
    const remainingItems = await (prisma as any).cartItem.findMany({
      where: { cartId }
    });

    const newTotalItems = remainingItems.reduce((sum: any, i: any) => sum + i.quantity, 0);
    const newCartTotalPrice = remainingItems.reduce((sum: any, i: any) => sum + parseFloat(i.totalPrice.toString()), 0);

    // Aktualisiere Warenkorb
    await (prisma as any).cart.update({
      where: { id: cartId },
      data: {
        totalItems: newTotalItems,
        totalPrice: newCartTotalPrice,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Items' },
      { status: 500 }
    );
  }
}

// Öffentlicher Zugriff für Warenkorb-Item-Operationen
export const PUT = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, (request: AuthenticatedRequest) => {
  // Extrahiere params aus der URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const cartId = pathParts[pathParts.length - 3];
  const itemId = pathParts[pathParts.length - 1];
  
  return handlePUT(request, { params: { cartId, itemId } });
});

export const DELETE = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, (request: AuthenticatedRequest) => {
  // Extrahiere params aus der URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const cartId = pathParts[pathParts.length - 3];
  const itemId = pathParts[pathParts.length - 1];
  
  return handleDELETE(request, { params: { cartId, itemId } });
});
