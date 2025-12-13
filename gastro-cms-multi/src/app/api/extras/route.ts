import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { getTenant } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  try {
    // Hole den aktuellen Tenant
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    const where: any = {
      tenantId: tenant.id
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Hole alle Extra-Gruppen mit ihren Items und Zuordnungen
    const extraGroups = await prisma.extraGroup.findMany({
      where,
      include: {
        extraItems: {
          orderBy: { id: 'asc' }
        },
        categoryExtras: {
          include: {
            category: true
          }
        },
        productExtras: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      ...(limit && { take: parseInt(limit) })
    });

    console.log('Geladene Extra-Gruppen:', extraGroups.length);

    // Transformiere die Daten in das erwartete Format
    const transformedExtras = extraGroups.map((group: any) => {
      try {
        return {
          id: group.id,
          name: group.name,
          description: group.description || null,
          selectionType: group.selectionType || 'CHECKBOX',
          isRequired: group.isRequired || false,
          maxSelections: group.maxSelections || null,
          minSelections: group.minSelections || 1,
          extras: (group.extraItems || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price.toString()),
            isFree: item.isFree === true // Explizit auf true prüfen, da null/undefined false sein sollen
          })),
          categories: (group.categoryExtras || []).map((ce: any) => ce.category),
          products: (group.productExtras || [])
            .filter((pe: any) => pe.isActive !== false) // Berücksichtige auch null-Werte
            .map((pe: any) => pe.product),
          createdAt: group.createdAt
        };
      } catch (error) {
        console.error('Fehler beim Transformieren der Extra-Gruppe:', group.id, error);
        // Fallback für fehlerhafte Gruppen
        return {
          id: group.id,
          name: group.name || 'Unbekannt',
          description: null,
          selectionType: 'CHECKBOX',
          isRequired: false,
          maxSelections: null,
          minSelections: 1,
          extras: [],
          categories: [],
          products: [],
          createdAt: group.createdAt
        };
      }
    });

    console.log('Transformierte Extras:', transformedExtras.length);

    return NextResponse.json(transformedExtras);
  } catch (error) {
    console.error('Error fetching extras:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Extras', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    // Hole den aktuellen Tenant
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      selectionType,
      isRequired,
      maxSelections,
      minSelections,
      categories,
      products,
      extras
    } = body;

    // Validiere erforderliche Felder
    if (!name || !extras || extras.length === 0) {
      return NextResponse.json(
        { error: 'Name und mindestens ein Extra sind erforderlich' },
        { status: 400 }
      );
    }

    if (categories.length === 0 && products.length === 0) {
      return NextResponse.json(
        { error: 'Mindestens eine Kategorie oder ein Produkt muss ausgewählt werden' },
        { status: 400 }
      );
    }

    // Validiere Auswahltyp-spezifische Regeln
    if (selectionType === 'RADIO') {
      if (maxSelections && maxSelections > 1) {
        return NextResponse.json(
          { error: 'Bei Radio-Buttons kann maxSelections maximal 1 sein' },
          { status: 400 }
        );
      }
      if (minSelections > 1) {
        return NextResponse.json(
          { error: 'Bei Radio-Buttons kann minSelections maximal 1 sein' },
          { status: 400 }
        );
      }
    }

    // Prüfe ob ExtraGroup mit diesem Namen bereits existiert (pro Tenant)
    const existingExtraGroup = await prisma.extraGroup.findFirst({
      where: {
        name,
        tenantId: tenant.id
      }
    });

    if (existingExtraGroup) {
      return NextResponse.json(
        { error: 'Eine Extra-Gruppe mit diesem Namen existiert bereits' },
        { status: 400 }
      );
    }

    // Erstelle die ExtraGroup mit allen Beziehungen in einer Transaktion
    const result = await prisma.$transaction(async (tx: any) => {
      // Erstelle die ExtraGroup
      const extraGroup = await tx.extraGroup.create({
        data: {
          name,
          description,
          selectionType: selectionType || 'CHECKBOX',
          isRequired: isRequired || false,
          maxSelections: maxSelections || null,
          minSelections: minSelections || 1,
          tenantId: tenant.id
        }
      });

      // Erstelle die ExtraItems
      const extraItems = await Promise.all(
        extras.map((extra: any) =>
          tx.extraItem.create({
            data: {
              name: extra.name,
              price: extra.price,
              isFree: extra.isFree || false,
              extraGroupId: extraGroup.id
            }
          })
        )
      );

      // Erstelle die Kategorie-Beziehungen
      if (categories.length > 0) {
        await Promise.all(
          categories.map((categoryId: number) =>
            tx.categoryExtra.create({
              data: {
                categoryId,
                extraGroupId: extraGroup.id
              }
            })
          )
        );
      }

      // Erstelle die Produkt-Beziehungen
      if (products && products.length > 0) {
        await Promise.all(
          products.map((productId: number, index: number) =>
            tx.productExtra.create({
              data: {
                productId,
                extraGroupId: extraGroup.id,
                sortOrder: index,
                isActive: true
              }
            })
          )
        );
      }

      return extraGroup;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating extra group:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Extra-Gruppe' },
      { status: 500 }
    );
  }
}

// Export handlers - Public read access for extras, Admin/Manager write access
export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
