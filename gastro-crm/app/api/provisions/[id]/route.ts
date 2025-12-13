import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await request.json();

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        commissionPaid: body.commissionPaid,
        paidAt: body.commissionPaid ? new Date() : null,
      },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating provision:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Provision' },
      { status: 500 }
    );
  }
}

