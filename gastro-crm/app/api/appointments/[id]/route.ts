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
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Termin nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden des Termins' },
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
    if (body.date !== undefined && body.time !== undefined) {
      updateData.date = new Date(`${body.date}T${body.time}`);
      updateData.time = body.time;
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Termins' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Löschen des Termins' },
      { status: 500 }
    );
  }
}

