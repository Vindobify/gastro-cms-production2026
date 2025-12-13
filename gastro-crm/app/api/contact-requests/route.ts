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

    const contactRequests = await prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contactRequests);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Nicht eingeloggt – bitte im CRM anmelden.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Laden der Kontaktanfragen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // No auth required for public form submission
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Nachricht sind erforderlich' },
        { status: 400 }
      );
    }

    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json(contactRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating contact request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kontaktanfrage' },
      { status: 500 }
    );
  }
}

