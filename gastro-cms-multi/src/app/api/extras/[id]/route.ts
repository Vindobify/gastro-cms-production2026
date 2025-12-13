import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
      );
    }

    const extraGroup = await prisma.extraGroup.findUnique({
      where: { id },
      include: {
        extraItems: true,
        categoryExtras: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        productExtras: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!extraGroup) {
      return NextResponse.json(
        { error: 'Extra-Gruppe nicht gefunden' },
        { status: 404 }
      );
    }

    // Transformiere die Daten in das erwartete Format
    const transformedExtra = {
      id: extraGroup.id,
      name: extraGroup.name,
      description: extraGroup.description || null,
      selectionType: extraGroup.selectionType || 'CHECKBOX',
      isRequired: extraGroup.isRequired || false,
      maxSelections: extraGroup.maxSelections || null,
      minSelections: extraGroup.minSelections || 1,
      categories: extraGroup.categoryExtras.map((ce: any) => ce.category),
      products: extraGroup.productExtras.map((pe: any) => pe.product),
      extraItems: extraGroup.extraItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price.toString()),
        isFree: item.isFree === true
      })),
      createdAt: extraGroup.createdAt.toISOString(),
      updatedAt: extraGroup.updatedAt.toISOString()
    };

    return NextResponse.json(transformedExtra);
  } catch (error) {
    console.error('Error fetching extra group:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Extra-Gruppe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
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
      categories = [], 
      products = [], 
      extras,
      extraItems
    } = body;
    
    // Verwende extraItems falls vorhanden, sonst extras
    const itemsToProcess = extraItems || extras || [];

    // Validiere erforderliche Felder
    if (!name || !itemsToProcess || itemsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'Name und mindestens ein Extra sind erforderlich' },
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

    // Prüfe ob ExtraGroup existiert
    const existingExtraGroup = await prisma.extraGroup.findUnique({
      where: { id }
    });

    if (!existingExtraGroup) {
      return NextResponse.json(
        { error: 'Extra-Gruppe nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Name bereits von einer anderen ExtraGroup verwendet wird
    const nameConflict = await prisma.extraGroup.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Eine Extra-Gruppe mit diesem Namen existiert bereits' },
        { status: 400 }
      );
    }

    // Aktualisiere die ExtraGroup mit allen Beziehungen in einer Transaktion
    const result = await prisma.$transaction(async (tx: any) => {
      // Aktualisiere die ExtraGroup
      const updatedExtraGroup = await tx.extraGroup.update({
        where: { id },
        data: { 
          name,
          description,
          selectionType: selectionType || 'CHECKBOX',
          isRequired: isRequired || false,
          maxSelections: maxSelections || null,
          minSelections: minSelections || 1
        }
      });

      // Lösche alle bestehenden Beziehungen
      await tx.extraItem.deleteMany({
        where: { extraGroupId: id }
      });

      await tx.categoryExtra.deleteMany({
        where: { extraGroupId: id }
      });

      await tx.productExtra.deleteMany({
        where: { extraGroupId: id }
      });

      // Erstelle die neuen ExtraItems
      const extraItems = await Promise.all(
        itemsToProcess.map((extra: any) =>
          tx.extraItem.create({
            data: {
              name: extra.name,
              price: extra.price,
              isFree: extra.isFree || false,
              extraGroupId: id
            }
          })
        )
      );

      // Erstelle die neuen Kategorie-Beziehungen
      if (categories.length > 0) {
        await Promise.all(
          categories.map((categoryId: number) =>
            tx.categoryExtra.create({
              data: {
                categoryId,
                extraGroupId: id
              }
            })
          )
        );
      }

      // Erstelle die neuen Produkt-Beziehungen
      if (products.length > 0) {
        await Promise.all(
          products.map((productId: number, index: number) =>
            tx.productExtra.create({
              data: {
                productId,
                extraGroupId: id,
                sortOrder: index,
                isActive: true
              }
            })
          )
        );
      }

      return updatedExtraGroup;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating extra group:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Extra-Gruppe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
      );
    }

    // Prüfe ob ExtraGroup existiert
    const existingExtraGroup = await prisma.extraGroup.findUnique({
      where: { id }
    });

    if (!existingExtraGroup) {
      return NextResponse.json(
        { error: 'Extra-Gruppe nicht gefunden' },
        { status: 404 }
      );
    }

    // Lösche die ExtraGroup (alle Beziehungen werden durch Cascade gelöscht)
    await prisma.extraGroup.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Extra-Gruppe erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting extra group:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Extra-Gruppe' },
      { status: 500 }
    );
  }
}
