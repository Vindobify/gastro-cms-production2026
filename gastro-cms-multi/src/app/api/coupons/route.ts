import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';
import { normalizeDecimalFields, DECIMAL_FIELDS } from '@/lib/decimalUtils';
import { getTenant } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  // Hole den aktuellen Tenant
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant nicht gefunden' },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get('active');
  const isPublic = searchParams.get('isPublic');
  const search = searchParams.get('search');

  console.log('Coupons API: Starting request with params:', { isActive, isPublic, search });

  let where: any = {
    tenantId: tenant.id
  };

  if (isActive !== null) {
    where.isActive = isActive === 'true';
  }

  if (isPublic !== null) {
    where.isPublic = isPublic === 'true';
  }

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  console.log('Coupons API: Query where clause:', JSON.stringify(where, null, 2));

  try {
    // Try a simple query first to test basic connectivity
    console.log('Testing basic coupon count...');
    const couponCount = await prisma.coupon.count();
    console.log(`Found ${couponCount} total coupons in database`);

    // Try the full query with minimal includes first
    console.log('Attempting full query...');
    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        restrictions: true,
        _count: {
          select: {
            usages: true,
            customerAssignments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Coupons API: Found ${coupons.length} coupons`);

    // Normalisiere alle Decimal-Werte
    const normalizedCoupons = coupons.map(coupon =>
      normalizeDecimalFields(coupon, DECIMAL_FIELDS.COUPON)
    );

    return NextResponse.json(normalizedCoupons);
  } catch (error) {
    console.error('Coupons API Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
        console.error('Database table missing - run prisma migrate');
        return NextResponse.json(
          { error: 'Database tables missing. Please run database migrations.' },
          { status: 500 }
        );
      }

      if (error.message.includes('Unknown field') || error.message.includes('Unknown column')) {
        console.error('Schema mismatch detected:', error.message);
        // Try fallback query without problematic fields
        try {
          console.log('Attempting fallback query without _count...');
          const fallbackCoupons = await prisma.coupon.findMany({
            where,
            include: {
              restrictions: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
          console.log(`Fallback query successful: ${fallbackCoupons.length} coupons`);
          return NextResponse.json(fallbackCoupons);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return NextResponse.json([], { status: 200 }); // Return empty array for frontend compatibility
        }
      }

      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error('Database connection failed');
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden der Gutscheine' },
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
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      perCustomerLimit,
      isActive,
      isPublic,
      canCombine,
      restrictions
    } = body;

    // Validiere erforderliche Felder
    if (!code || !name || !discountType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Code, Name, Rabatttyp, Start- und Enddatum sind erforderlich' },
        { status: 400 }
      );
    }

    // Validiere Rabatttyp
    const validDiscountTypes = ['PERCENTAGE', 'FIXED_AMOUNT', 'PRODUCT_SPECIFIC', 'FREE_DELIVERY'];
    if (!validDiscountTypes.includes(discountType)) {
      return NextResponse.json(
        { error: 'Ungültiger Rabatttyp' },
        { status: 400 }
      );
    }

    // Validiere Datum
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: 'Enddatum muss nach dem Startdatum liegen' },
        { status: 400 }
      );
    }

    // Validiere Rabattwert (außer bei FREE_DELIVERY)
    if (discountType !== 'FREE_DELIVERY') {
      if (!discountValue || isNaN(parseFloat(discountValue))) {
        return NextResponse.json(
          { error: 'Rabattwert ist erforderlich und muss eine gültige Zahl sein' },
          { status: 400 }
        );
      }

      if (discountType === 'PERCENTAGE' && (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100)) {
        return NextResponse.json(
          { error: 'Prozentrabatt muss zwischen 0 und 100 liegen' },
          { status: 400 }
        );
      }

      if (discountType === 'FIXED_AMOUNT' && parseFloat(discountValue) <= 0) {
        return NextResponse.json(
          { error: 'Festbetragsrabatt muss größer als 0 sein' },
          { status: 400 }
        );
      }
    }

    // Validiere minimumOrderAmount falls vorhanden
    if (minimumOrderAmount && isNaN(parseFloat(minimumOrderAmount))) {
      return NextResponse.json(
        { error: 'Mindestbestellwert muss eine gültige Zahl sein' },
        { status: 400 }
      );
    }

    // Validiere maximumDiscount falls vorhanden
    if (maximumDiscount && isNaN(parseFloat(maximumDiscount))) {
      return NextResponse.json(
        { error: 'Maximaler Rabatt muss eine gültige Zahl sein' },
        { status: 400 }
      );
    }

    // Validiere usageLimit falls vorhanden
    if (usageLimit && isNaN(parseInt(usageLimit))) {
      return NextResponse.json(
        { error: 'Nutzungslimit muss eine gültige Zahl sein' },
        { status: 400 }
      );
    }

    // Validiere perCustomerLimit falls vorhanden
    if (perCustomerLimit && isNaN(parseInt(perCustomerLimit))) {
      return NextResponse.json(
        { error: 'Limit pro Kunde muss eine gültige Zahl sein' },
        { status: 400 }
      );
    }

    // Erstelle den Gutschein
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description: description || '',
        discountType,
        discountValue: discountType === 'FREE_DELIVERY' ? 0 : parseFloat(discountValue),
        minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : null,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        startDate: start,
        endDate: end,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit) : 1,
        isActive: isActive !== undefined ? isActive : true,
        isPublic: isPublic !== undefined ? isPublic : true,
        canCombine: canCombine || false,
        tenantId: tenant.id
      },
      include: {
        restrictions: true
      }
    });

    // Erstelle Einschränkungen, falls vorhanden
    if (restrictions && Array.isArray(restrictions)) {
      for (const restriction of restrictions) {
        await prisma.couponRestriction.create({
          data: {
            couponId: coupon.id,
            restrictionType: restriction.type,
            restrictionValue: restriction.value,
            restrictionOperator: restriction.operator || 'INCLUDE'
          }
        });
      }
    }

    // Hole den aktualisierten Gutschein mit Einschränkungen
    const updatedCoupon = await prisma.coupon.findUnique({
      where: { id: coupon.id },
      include: {
        restrictions: true
      }
    });

    return NextResponse.json(updatedCoupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);

    // Prüfe auf Duplikat-Code
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ein Gutschein mit diesem Code existiert bereits' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Gutscheins' },
      { status: 500 }
    );
  }
}

// Export handlers - Public read access for public coupons, Admin/Manager write access
export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
