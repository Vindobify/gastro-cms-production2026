import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    const { latitude, longitude } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Ungültige GPS-Koordinaten' },
        { status: 400 }
      );
    }

    // Aktualisiere den Standort des Lieferanten
    const updatedDriver = await prisma.deliveryDriver.update({
      where: { id },
      data: {
        currentLocation: JSON.stringify({ latitude, longitude }),
        lastLocationUpdate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      location: { latitude, longitude },
      timestamp: updatedDriver.lastLocationUpdate
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Standorts' },
      { status: 500 }
    );
  }
}
