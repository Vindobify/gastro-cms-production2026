import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; extraId: string } }
) {
  try {
    const productId = parseInt(params.id);
    const extraId = parseInt(params.extraId);
    
    if (isNaN(productId) || isNaN(extraId)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
      );
    }

    // Prüfe ob die Produkt-Extra-Zuordnung existiert
    const productExtra = await prisma.productExtra.findFirst({
      where: {
        id: extraId,
        productId: productId
      }
    });

    if (!productExtra) {
      return NextResponse.json(
        { error: 'Produkt-Extra-Zuordnung nicht gefunden' },
        { status: 404 }
      );
    }

    // Lösche die Zuordnung
    await prisma.productExtra.delete({
      where: { id: extraId }
    });

    return NextResponse.json({ message: 'Extra erfolgreich vom Produkt entfernt' });
  } catch (error) {
    console.error('Error removing extra from product:', error);
    return NextResponse.json(
      { error: 'Fehler beim Entfernen des Extras vom Produkt' },
      { status: 500 }
    );
  }
}
