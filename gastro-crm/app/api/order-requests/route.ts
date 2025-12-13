import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const orderRequests = await prisma.orderRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orderRequests);
  } catch (error) {
    console.error('Error fetching order requests:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellungen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    const orderRequest = await prisma.orderRequest.create({
      data: {
        businessType: body.businessType,
        restaurantName: body.restaurantName,
        ownerName: body.ownerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        postalCode: body.postalCode,
        city: body.city,
        hasDeliveryService: body.hasDeliveryService || false,
        deliveryServiceName: body.deliveryServiceName || null,
        monthlyRevenue: body.monthlyRevenue ? parseFloat(body.monthlyRevenue) : null,
        deliveryPercentage: body.deliveryPercentage ? parseFloat(body.deliveryPercentage) : null,
        calculatedSavings: body.calculatedSavings ? parseFloat(body.calculatedSavings) : null,
        hasDomain: body.hasDomain || false,
        existingDomain: body.existingDomain || null,
        desiredDomain: body.desiredDomain || null,
        acceptedTerms: body.acceptedTerms || false,
        acceptedPrivacy: body.acceptedPrivacy || false,
        acceptedAV: body.acceptedAV || false,
        status: body.status || 'PENDING',
        paymentAmount: body.paymentAmount ? parseFloat(body.paymentAmount) : 0,
        stripeSessionId: body.stripeSessionId || null,
      },
    });

    return NextResponse.json(orderRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating order request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung' },
      { status: 500 }
    );
  }
}

