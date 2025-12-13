import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const orderRequest = await prisma.orderRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!orderRequest) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(orderRequest);
  } catch (error) {
    console.error('Error fetching order request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellung' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentAmount !== undefined) updateData.paymentAmount = parseFloat(body.paymentAmount);
    if (body.stripeSessionId !== undefined) updateData.stripeSessionId = body.stripeSessionId;

    const orderRequest = await prisma.orderRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(orderRequest);
  } catch (error) {
    console.error('Error updating order request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Bestellung' },
      { status: 500 }
    );
  }
}

