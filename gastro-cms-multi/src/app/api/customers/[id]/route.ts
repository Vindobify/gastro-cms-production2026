import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Kunden-ID' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Kunden' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Kunden-ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, postalCode, country, isActive } = body;

    // Validiere erforderliche Felder
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Vorname, Nachname und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob E-Mail bereits von einem anderen Kunden verwendet wird
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Ein anderer Kunde verwendet bereits diese E-Mail-Adresse' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        isActive
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Kunden' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Ungültige Kunden-ID' },
        { status: 400 }
      );
    }

    // Prüfe ob Kunde in Bestellungen verwendet wird
    const orders = await prisma.order.findFirst({
      where: { customerId: id }
    });

    if (orders) {
      return NextResponse.json(
        { error: 'Kunde kann nicht gelöscht werden, da er in Bestellungen verwendet wird' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Kunde erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Kunden' },
      { status: 500 }
    );
  }
}
