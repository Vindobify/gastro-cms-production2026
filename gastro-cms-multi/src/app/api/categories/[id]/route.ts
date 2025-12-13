import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { generateCategorySlug } from '@/lib/slugify';

const getHandler = createProtectedHandler({
  allowPublicRead: true,
  requireAuth: false
}, async (req: AuthenticatedRequest) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = parseInt(pathParts[pathParts.length - 1]);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Ungültige Kategorie-ID' },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorie' },
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
        { error: 'Ungültige Kategorie-ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, image, icon, isActive, sortOrder } = body;

    // Validiere erforderliche Felder
    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    // Get current category to check if name changed
    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { name: true, slug: true } as any
    });

    if (!currentCategory) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }

    let slug = (currentCategory as any).slug;

    // If name changed, generate new slug
    if (currentCategory.name !== name) {
      const existingCategories = await prisma.category.findMany({
        where: { 
          id: { not: id } // Exclude current category
        },
        select: { slug: true } as any
      });
      const existingSlugs = existingCategories.map((cat: any) => cat.slug);
      slug = generateCategorySlug(name, existingSlugs);
    }

    const updateData: any = {
      name,
      slug,
      description,
      image,
      icon,
      isActive
    };

    // Only update sortOrder if provided
    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kategorie' },
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
          { error: 'Ungültige Kategorie-ID' },
          { status: 400 }
        );
      }

      // Prüfe ob Kategorie in Produkten verwendet wird
      const products = await prisma.product.findFirst({
        where: { categoryId: id }
      });

      if (products) {
        return NextResponse.json(
          { error: 'Kategorie kann nicht gelöscht werden, da sie in Produkten verwendet wird' },
          { status: 400 }
        );
      }

      await prisma.category.delete({
        where: { id }
      });

      return NextResponse.json({ message: 'Kategorie erfolgreich gelöscht' });
    } catch (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Kategorie' },
        { status: 500 }
      );
    }
  });

  return deleteHandler(request);
}
