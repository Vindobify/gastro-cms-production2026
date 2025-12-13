import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();

    console.log('Coupon validation request:', { code, orderAmount });

    if (!code) {
      console.log('Missing coupon code');
      return NextResponse.json(
        { message: 'Gutscheincode ist erforderlich' },
        { status: 400 }
      );
    }

    // Gutschein in der Datenbank suchen
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });

    console.log('Found coupon:', coupon ? { id: coupon.id, code: coupon.code, isActive: coupon.isActive } : 'null');

    if (!coupon) {
      return NextResponse.json(
        { message: 'Gutscheincode nicht gefunden oder abgelaufen' },
        { status: 404 }
      );
    }

    // Prüfe Mindestbestellbetrag nur wenn orderAmount > 0
    if (orderAmount > 0 && coupon.minimumOrderAmount && orderAmount < Number(coupon.minimumOrderAmount)) {
      return NextResponse.json(
        { message: `Mindestbestellbetrag von €${coupon.minimumOrderAmount} nicht erreicht` },
        { status: 400 }
      );
    }

    // Prüfe Verwendungslimit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: 'Gutschein wurde bereits maximal oft verwendet' },
        { status: 400 }
      );
    }

    // Berechne Rabatt nur wenn orderAmount > 0
    let discountAmount = 0;
    if (orderAmount > 0) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
        if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
          discountAmount = Number(coupon.maximumDiscount);
        }
      } else if (coupon.discountType === 'FIXED_AMOUNT') {
        discountAmount = Number(coupon.discountValue);
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
      }
    }

    // Gutschein-Daten für Frontend zurückgeben
    const couponData = {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minimumOrderAmount: coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : undefined,
      maximumDiscount: coupon.maximumDiscount ? Number(coupon.maximumDiscount) : undefined
    };

    console.log('Returning coupon data:', couponData);
    return NextResponse.json(couponData);

  } catch (error) {
    console.error('Fehler bei der Gutschein-Validierung:', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
