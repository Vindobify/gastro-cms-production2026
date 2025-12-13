import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Flag um sicherzustellen, dass Initialisierung nur einmal läuft
let isInitialized = false;

// Debug: Reset flag für Neuinitialisierung
if (process.env.NODE_ENV === 'production') {
  isInitialized = false;
}

// Force re-initialization für Debugging
const FORCE_REINIT = process.env.FORCE_REINIT === 'true';

export async function initializeDatabase() {
  if (isInitialized && !FORCE_REINIT) {
    console.log('ℹ️ Datenbank bereits initialisiert');
    return { success: true, message: 'Already initialized' };
  }
  
  if (FORCE_REINIT) {
    console.log('🔄 Force Re-Initialisierung aktiviert');
    isInitialized = false;
  }

  try {
    console.log('🚀 Starte automatische Datenbank-Initialisierung...');

    // 1. Datenbankverbindung testen
    await prisma.$connect();
    console.log('✅ Datenbankverbindung erfolgreich');

    // 2. Prüfen ob Tabellen existieren
    try {
      await prisma.$executeRaw`SELECT 1 FROM "users" LIMIT 1`;
      console.log('✅ Tabellen existieren bereits');
      
      // Prüfen ob Admin-User existiert
      const adminExists = await prisma.user.findUnique({
        where: { email: 'office@gastro-cms.at' }
      });
      
      if (adminExists) {
        console.log('✅ Admin-User existiert bereits');
        isInitialized = true;
        return { success: true, message: 'Database already initialized' };
      }
    } catch (error) {
      console.log('📝 Tabellen existieren nicht, erstelle Schema...');
      
      // 3. Schema pushen (Tabellen erstellen) - Robuste Methode
      console.log('📝 Erstelle Tabellen direkt über Prisma...');
      
      try {
        // Verwende Prisma's db push direkt über die API
        // Verwende TEXT statt Enum-Typen für einfachere Kompatibilität

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "emailVerified" BOOLEAN NOT NULL DEFAULT false,
          "lastLoginAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "user_profiles" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL UNIQUE,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "phone" TEXT,
          "address" TEXT,
          "city" TEXT,
          "postalCode" TEXT,
          "country" TEXT NOT NULL DEFAULT 'Österreich',
          "avatar" TEXT,
          "preferences" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        )`;

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "restaurant_settings" (
          "id" SERIAL PRIMARY KEY,
          "restaurantName" TEXT NOT NULL,
          "address" TEXT,
          "city" TEXT,
          "postalCode" TEXT,
          "phone" TEXT,
          "email" TEXT,
          "atuNumber" TEXT,
          "fnNumber" TEXT,
          "logo" TEXT,
          "favicon" TEXT,
          "openingHoursData" JSONB,
          "orderDeadline" TEXT,
          "deliveryDistricts" TEXT,
          "minOrderAmount" DECIMAL,
          "deliveryFee" DECIMAL,
          "freeDeliveryThreshold" DECIMAL,
          "defaultTaxRate" DECIMAL,
          "currency" TEXT DEFAULT 'EUR',
          "timezone" TEXT DEFAULT 'Europe/Vienna',
          "metaTitle" TEXT,
          "metaDescription" TEXT,
          "ogImage" TEXT,
          "robotsTxt" TEXT,
          "googleAnalyticsId" TEXT,
          "googleTagManagerId" TEXT,
          "facebookPixelId" TEXT,
          "structuredDataEnabled" BOOLEAN DEFAULT true,
          "sitemapEnabled" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "categories" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "image" TEXT,
          "icon" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "products" (
          "id" SERIAL PRIMARY KEY,
          "articleNumber" TEXT UNIQUE,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "price" DECIMAL,
          "taxRate" DECIMAL NOT NULL DEFAULT 0.20,
          "categoryId" INTEGER,
          "allergens" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
        )`;

        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "coupons" (
          "id" SERIAL PRIMARY KEY,
          "code" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "discountType" TEXT NOT NULL,
          "discountValue" DECIMAL NOT NULL,
          "minimumOrderAmount" DECIMAL,
          "maximumDiscount" DECIMAL,
          "startDate" TIMESTAMP NOT NULL,
          "endDate" TIMESTAMP NOT NULL,
          "usageLimit" INTEGER,
          "usageCount" INTEGER NOT NULL DEFAULT 0,
          "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "isPublic" BOOLEAN NOT NULL DEFAULT true,
          "canCombine" BOOLEAN NOT NULL DEFAULT false,
          "categoryId" INTEGER,
          "productId" INTEGER,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("categoryId") REFERENCES "categories"("id"),
          FOREIGN KEY ("productId") REFERENCES "products"("id")
        )`;

        console.log('✅ Alle wichtigen Tabellen erstellt');
      } catch (schemaError) {
        console.error('❌ Schema-Erstellung fehlgeschlagen:', schemaError);
        // Versuche es mit dem ursprünglichen Ansatz als Fallback
        try {
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(exec);

          await execAsync('npx prisma db push --force-reset', {
            cwd: process.cwd(),
            env: { ...process.env },
            timeout: 30000
          });
          console.log('✅ Schema über Fallback erfolgreich erstellt');
        } catch (fallbackError) {
          console.error('❌ Auch Fallback-Schema-Erstellung fehlgeschlagen:', fallbackError);
          throw fallbackError;
        }
      }
    }

    // 4. Admin-User erstellen
    const adminEmail = 'office@gastro-cms.at';
    const adminPassword = 'ComPaq1987!';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

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
      console.log('ℹ️ Admin-Benutzer existiert bereits');
    }

    // 5. Standard Restaurant-Einstellungen erstellen
    const existingSettings = await prisma.restaurantSettings.findFirst();
    
    if (!existingSettings) {
      await prisma.restaurantSettings.create({
        data: {
          restaurantName: 'Mein Restaurant',
          address: 'Musterstraße 1',
          city: 'Wien',
          postalCode: '1010',
          phone: '+43 1 123456789',
          email: 'info@mein-restaurant.at',
          atuNumber: '',
          fnNumber: '',
          logo: '',
          favicon: '/favicon.ico',
          openingHoursData: {
            "monday": {"open": "11:00", "close": "22:00", "closed": false},
            "tuesday": {"open": "11:00", "close": "22:00", "closed": false},
            "wednesday": {"open": "11:00", "close": "22:00", "closed": false},
            "thursday": {"open": "11:00", "close": "22:00", "closed": false},
            "friday": {"open": "11:00", "close": "22:00", "closed": false},
            "saturday": {"open": "11:00", "close": "22:00", "closed": false},
            "sunday": {"open": "11:00", "close": "22:00", "closed": false}
          },
          orderDeadline: '22:00',
          deliveryDistricts: '["1010", "1020", "1030", "1040", "1050"]',
          minOrderAmount: 15.0,
          deliveryFee: 3.0,
          freeDeliveryThreshold: 25.0,
          defaultTaxRate: 0.20,
          currency: 'EUR',
          timezone: 'Europe/Vienna',
          metaTitle: 'Mein Restaurant - Online Bestellen',
          metaDescription: 'Bestellen Sie online bei Mein Restaurant. Frische Speisen, schnelle Lieferung.',
          ogImage: '/favicon.ico',
          robotsTxt: 'User-agent: *\nAllow: /',
          googleAnalyticsId: '',
          googleTagManagerId: '',
          facebookPixelId: '',
          structuredDataEnabled: true,
          sitemapEnabled: true
        }
      });

      console.log('✅ Standard Restaurant-Einstellungen erstellt');
    } else {
      console.log('ℹ️ Restaurant-Einstellungen existieren bereits');
    }

    // 6. Test-Gutschein erstellen
    const testCouponCode = 'PIZZA20';
    const existingCoupon = await prisma.coupon.findFirst({
      where: { code: testCouponCode }
    });

    if (!existingCoupon) {
      await prisma.coupon.create({
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

      console.log('✅ Test-Gutschein erstellt:', testCouponCode);
    } else {
      console.log('ℹ️ Test-Gutschein existiert bereits');
    }

    isInitialized = true;
    console.log('🎉 Datenbank-Initialisierung erfolgreich abgeschlossen!');
    
    return { 
      success: true, 
      message: 'Database initialized successfully',
      adminEmail: adminEmail,
      adminPassword: adminPassword
    };

  } catch (error) {
    console.error('❌ Datenbank-Initialisierung fehlgeschlagen:', error);
    
    // Fehler nicht fatal machen - App kann trotzdem starten
    console.log('⚠️ Initialisierung fehlgeschlagen, aber App kann trotzdem starten.');
    console.log('💡 Sie können die Initialisierung später über /api/init manuell ausführen.');
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Automatische Initialisierung beim Import (nur in Production)
if (process.env.NODE_ENV === 'production') {
  // Verzögerte Initialisierung nach 2 Sekunden
  setTimeout(() => {
    initializeDatabase().catch(console.error);
  }, 2000);
}
