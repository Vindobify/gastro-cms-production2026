import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';

const getHandler = createProtectedHandler({
  allowPublicRead: true,
  requireAuth: false
}, async (req: AuthenticatedRequest) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = parseInt(pathParts[pathParts.length - 1]);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Ungültige Produkt-ID' },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productExtras: {
          include: {
            extraGroup: {
              include: {
                extraItems: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Produkts' },
      { status: 500 }
    );
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getHandler(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Produkt-ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, categoryId, image, taxRate, isActive, sortOrder, allergens } = body;

    // Validiere erforderliche Felder
    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      description,
      price,
      category: categoryId ? { connect: { id: parseInt(categoryId) } } : undefined,
      taxRate: taxRate ? parseFloat(taxRate) : 0.20,
      allergens: allergens && allergens.length > 0 ? JSON.stringify(allergens) : '[]'
    };

    // Add sortOrder if provided
    if (sortOrder !== undefined) {
      updateData.sortOrder = parseInt(sortOrder);
    }

    // Add isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Produkts' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deleteHandler = createProtectedHandler({
    allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
  }, async (req: AuthenticatedRequest) => {
    try {
      const { id: idParam } = await params;
      const id = parseInt(idParam);
      
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Ungültige Produkt-ID' },
          { status: 400 }
        );
      }

      // Prüfe ob Produkt in Bestellungen verwendet wird
      const orderItems = await prisma.orderItem.findFirst({
        where: { productId: id }
      });

      if (orderItems) {
        return NextResponse.json(
          { error: 'Produkt kann nicht gelöscht werden, da es in Bestellungen verwendet wird' },
          { status: 400 }
        );
      }

      await prisma.product.delete({
        where: { id }
      });

      return NextResponse.json({ message: 'Produkt erfolgreich gelöscht' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Produkts' },
        { status: 500 }
      );
    }
  });

  return deleteHandler(request);
}
