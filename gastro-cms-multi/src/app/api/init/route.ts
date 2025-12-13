import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🚀 Starte Datenbank-Initialisierung...');

    // 1. Datenbankverbindung testen
    try {
      await prisma.$connect();
      console.log('✅ Datenbankverbindung erfolgreich');
    } catch (dbError) {
      console.error('❌ Datenbankverbindung fehlgeschlagen:', dbError);
      return NextResponse.json({ 
        error: 'Datenbankverbindung fehlgeschlagen',
        details: 'Prüfen Sie DATABASE_URL in Vercel'
      }, { status: 500 });
    }

    // 2. Prisma Client generieren
    try {
      await prisma.$executeRaw`SELECT 1`;
      console.log('✅ Datenbank ist erreichbar');
    } catch (dbError) {
      console.error('❌ Datenbankabfrage fehlgeschlagen:', dbError);
      return NextResponse.json({ 
        error: 'Datenbankabfrage fehlgeschlagen',
        details: 'Möglicherweise ist die Datenbank noch nicht initialisiert'
      }, { status: 500 });
    }

    // 3. Admin-Benutzer erstellen
    const adminEmail = 'office@gastro-cms.at';
    const adminPassword = 'ComPaq1987!';

    try {
      // Prüfe ob Admin bereits existiert
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!existingAdmin) {
        // Passwort hashen
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Admin-Benutzer erstellen
        const admin = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
            profile: {
              create: {
                firstName: 'Admin',
                lastName: 'Gastro-CMS',
                country: 'Österreich'
              }
            }
          }
        });

        console.log('✅ Admin-Benutzer erstellt:', admin.email);
      } else {
        console.log('ℹ️ Admin-Benutzer existiert bereits:', existingAdmin.email);
      }
    } catch (userError) {
      console.error('❌ Admin-Erstellung fehlgeschlagen:', userError);
      return NextResponse.json({ 
        error: 'Admin-Erstellung fehlgeschlagen',
        details: 'Möglicherweise fehlen Datenbanktabellen'
      }, { status: 500 });
    }

    // 4. Test-Gutschein erstellen
    try {
      const testCouponCode = 'PIZZA20';
      const existingCoupon = await prisma.coupon.findFirst({
        where: { code: testCouponCode }
      });

      if (!existingCoupon) {
        const testCoupon = await prisma.coupon.create({
          data: {
            code: testCouponCode,
            name: 'Pizza 20% Rabatt',
            description: '20% Rabatt auf alle Pizzen',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minimumOrderAmount: 15,
            maximumDiscount: 10,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 100,
            usageCount: 0
          }
        });

        console.log('✅ Test-Gutschein erstellt:', testCoupon.code);
      } else {
        console.log('ℹ️ Test-Gutschein existiert bereits:', existingCoupon.code);
      }
    } catch (couponError) {
      console.error('⚠️ Gutschein-Erstellung fehlgeschlagen (nicht kritisch):', couponError);
    }

    console.log('🎉 Datenbank-Initialisierung erfolgreich abgeschlossen!');

    return NextResponse.json({ 
      success: true, 
      message: 'Datenbank erfolgreich initialisiert',
      adminEmail: adminEmail,
      adminPassword: adminPassword,
      status: 'ready'
    });

  } catch (error) {
    console.error('❌ Kritischer Initialisierungsfehler:', error);
    return NextResponse.json({ 
      error: 'Initialisierung fehlgeschlagen', 
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Datenbankverbindung geschlossen');
  }
}

export async function POST() {
  // POST-Methode für manuelle Initialisierung
  return GET();
}
