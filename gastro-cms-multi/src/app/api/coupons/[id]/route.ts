import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const coupon = await prisma.coupon.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!coupon) {
      return NextResponse.json(
        { message: 'Gutschein nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedCoupon = await prisma.coupon.update({
      where: {
        id: parseInt(id)
      },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maximumDiscount: data.maximumDiscount,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        usageLimit: data.usageLimit,
        isActive: data.isActive,
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.productId && { productId: data.productId })
      }
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { message: 'Fehler beim Aktualisieren des Gutscheins' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.coupon.delete({
      where: {
        id: parseInt(id)
      }
    });

    return NextResponse.json({ message: 'Gutschein erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Gutscheins' },
      { status: 500 }
    );
  }
}
