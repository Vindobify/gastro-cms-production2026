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
    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Kontaktanfrage nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(contactRequest);
  } catch (error) {
    console.error('Error fetching contact request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden der Kontaktanfrage' },
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

    const contactRequest = await prisma.contactRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: body.status,
        notes: body.notes,
      },
    });

    return NextResponse.json(contactRequest);
  } catch (error) {
    console.error('Error updating contact request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kontaktanfrage' },
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
    await prisma.contactRequest.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kontaktanfrage' },
      { status: 500 }
    );
  }
}

