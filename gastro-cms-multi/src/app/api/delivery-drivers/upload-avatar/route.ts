import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function handlePOST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const driverId = formData.get('driverId') as string;

    if (!file || !driverId) {
      return NextResponse.json(
        { error: 'Bild und Lieferant-ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Validiere Dateityp
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Nur Bilddateien sind erlaubt' },
        { status: 400 }
      );
    }

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Datei ist zu groß (max 5MB)' },
        { status: 400 }
      );
    }

    // Prüfe ob Lieferant existiert
    const driver = await prisma.deliveryDriver.findUnique({
      where: { id: parseInt(driverId) }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    // Generiere eindeutigen Dateinamen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `driver_${driverId}_${Date.now()}.${file.type.split('/')[1]}`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Speichere Datei
    await writeFile(filepath, buffer);
    const avatarUrl = `/uploads/${filename}`;

    // Update Lieferant-Profil
    await prisma.deliveryDriverProfile.upsert({
      where: { deliveryDriverId: parseInt(driverId) },
      update: { avatar: avatarUrl },
      create: {
        deliveryDriverId: parseInt(driverId),
        avatar: avatarUrl,
        workingHours: JSON.stringify({})
      }
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Bild erfolgreich hochgeladen'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Bildes' },
      { status: 500 }
    );
  }
}

// Export protected handler
export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
