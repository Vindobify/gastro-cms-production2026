import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Lieferant über userId finden
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Benutzer-ID nicht gefunden' },
        { status: 400 }
      );
    }

    const deliveryDriver = await (prisma as any).deliveryDriver.findFirst({
      where: { userId: userId },
      include: {
        profile: true
      }
    });

    if (!deliveryDriver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    // Arbeitszeiten aus Profile extrahieren
    let workingHours = [];
    if (deliveryDriver.profile?.workingHours) {
      try {
        workingHours = JSON.parse(deliveryDriver.profile.workingHours);
      } catch (error) {
        console.error('Error parsing working hours:', error);
        workingHours = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        workingHours,
        isAvailable: deliveryDriver.isAvailable
      }
    });

  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'DELIVERY_DRIVER') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Lieferant über userId finden
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Benutzer-ID nicht gefunden' },
        { status: 400 }
      );
    }

    const deliveryDriver = await (prisma as any).deliveryDriver.findFirst({
      where: { userId: userId },
      include: {
        profile: true
      }
    });

    if (!deliveryDriver) {
      return NextResponse.json(
        { error: 'Lieferant nicht gefunden' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { workingHours, isAvailable } = body;

    // Validiere Arbeitszeiten
    if (workingHours && Array.isArray(workingHours)) {
      for (const day of workingHours) {
        if (!day.dayOfWeek || day.dayOfWeek < 0 || day.dayOfWeek > 6) {
          return NextResponse.json(
            { error: 'Ungültiger Wochentag' },
            { status: 400 }
          );
        }
        if (!day.startTime || !day.endTime) {
          return NextResponse.json(
            { error: 'Start- und Endzeit sind erforderlich' },
            { status: 400 }
          );
        }
        // Validiere Zeitformat (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) {
          return NextResponse.json(
            { error: 'Ungültiges Zeitformat. Verwende HH:MM' },
            { status: 400 }
          );
        }
        // Validiere, dass Endzeit nach Startzeit ist
        const startMinutes = parseInt(day.startTime.split(':')[0]) * 60 + parseInt(day.startTime.split(':')[1]);
        const endMinutes = parseInt(day.endTime.split(':')[0]) * 60 + parseInt(day.endTime.split(':')[1]);
        if (endMinutes <= startMinutes) {
          return NextResponse.json(
            { error: 'Endzeit muss nach Startzeit liegen' },
            { status: 400 }
          );
        }
      }
    }

    // Update Daten vorbereiten
    const updateData: any = {};
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

      // Profile Update
      const profileUpdateData: any = {};
      if (workingHours) {
        profileUpdateData.workingHours = JSON.stringify(workingHours);
      }

      // Transaktion für beide Updates
      const result = await prisma.$transaction(async (tx) => {
        // DeliveryDriver aktualisieren
        const updatedDriver = await tx.deliveryDriver.update({
          where: { id: deliveryDriver.id },
          data: updateData
        });

        // Profile aktualisieren
        let updatedProfile;
        if (deliveryDriver.profile) {
          updatedProfile = await (tx as any).profile.update({
            where: { id: deliveryDriver.profile.id },
            data: profileUpdateData
          });
        } else {
          // Profile erstellen falls nicht vorhanden
          updatedProfile = await (tx as any).profile.create({
            data: {
              userId: userId,
              ...profileUpdateData
            }
          });
        }

        return { updatedDriver, updatedProfile };
      });

    return NextResponse.json({
      success: true,
      message: 'Arbeitszeiten erfolgreich aktualisiert',
      data: {
        workingHours: workingHours || [],
        isAvailable: result.updatedDriver.isAvailable
      }
    });

  } catch (error) {
    console.error('Error updating working hours:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
