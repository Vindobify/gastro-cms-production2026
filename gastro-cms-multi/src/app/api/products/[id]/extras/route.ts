import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Ungültige Produkt-ID' },
        { status: 400 }
      );
    }

    // Hole alle Extra-Gruppen die diesem Produkt zugeordnet sind
    const productExtras = await prisma.productExtra.findMany({
      where: {
        productId
      },
      include: {
        extraGroup: {
          include: {
            extraItems: true
          }
        }
      }
    });

    console.log(`Produkt ${productId} direkte Extras gefunden:`, productExtras.length);

    // Lade nur die tatsächlich zugeordneten Extras
    let extras: any[] = [];
    
    if (productExtras.length === 0) {
      // Keine Extras zugeordnet - leeres Array zurückgeben
      console.log(`Keine Extras für Produkt ${productId} zugeordnet`);
      extras = [];
    } else {
      // Transformiere die direkten Produkt-Extras
      extras = productExtras.map((pe: any) => {
        try {
          return {
            id: pe.extraGroup.id,
            name: pe.extraGroup.name,
            description: pe.extraGroup.description || null,
            selectionType: pe.extraGroup.selectionType || 'CHECKBOX',
            isRequired: pe.extraGroup.isRequired || false,
            maxSelections: pe.extraGroup.maxSelections || null,
            minSelections: pe.extraGroup.minSelections || 1,
                       extraItems: (pe.extraGroup.extraItems || []).map((item: any) => ({
             id: item.id,
             name: item.name,
             price: parseFloat(item.price.toString()),
             isFree: item.isFree === true
           }))
          };
        } catch (error) {
          console.error('Fehler beim Transformieren der Produkt-Extra:', pe.id, error);
          return {
            id: pe.extraGroup?.id || pe.id,
            name: pe.extraGroup?.name || 'Unbekannt',
            description: null,
            selectionType: 'CHECKBOX',
            isRequired: false,
            maxSelections: null,
            minSelections: 1,
            extraItems: []
          };
        }
      });
    }

    console.log(`Insgesamt ${(extras as any[]).length} Extras für Produkt ${productId} gefunden`);

    return NextResponse.json(extras);
  } catch (error) {
    console.error('Error fetching product extras:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkt-Extras', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Ungültige Produkt-ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { extraGroupId, isActive, sortOrder } = body;

    if (!extraGroupId) {
      return NextResponse.json(
        { error: 'Extra-Gruppen-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob das Produkt existiert
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob die Extra-Gruppe existiert
    const extraGroup = await prisma.extraGroup.findUnique({
      where: { id: extraGroupId }
    });

    if (!extraGroup) {
      return NextResponse.json(
        { error: 'Extra-Gruppe nicht gefunden' },
        { status: 404 }
      );
    }

    // Erstelle die Zuordnung
    const productExtra = await prisma.productExtra.create({
      data: {
        productId,
        extraGroupId,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      },
      include: {
        extraGroup: {
          include: {
            extraItems: true
          }
        }
      }
    });

    return NextResponse.json(productExtra, { status: 201 });
  } catch (error) {
    console.error('Error assigning extra to product:', error);
    return NextResponse.json(
      { error: 'Fehler beim Zuweisen des Extras zum Produkt' },
      { status: 500 }
    );
  }
}
