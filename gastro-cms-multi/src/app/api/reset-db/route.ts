import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Komplette Neuinitialisierung - löscht alles und erstellt neu
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Komplette Neuinitialisierung gestartet...');
    
    await prisma.$connect();
    console.log('✅ Datenbankverbindung erfolgreich');

    // 1. Lösche alle Tabellen (falls sie existieren)
    console.log('🗑️ Lösche bestehende Tabellen...');
    const dropTables = [
      'DROP TABLE IF EXISTS "sessions" CASCADE',
      'DROP TABLE IF EXISTS "user_profiles" CASCADE',
      'DROP TABLE IF EXISTS "users" CASCADE',
      'DROP TABLE IF EXISTS "restaurant_settings" CASCADE',
      'DROP TABLE IF EXISTS "categories" CASCADE',
      'DROP TABLE IF EXISTS "products" CASCADE',
      'DROP TABLE IF EXISTS "coupons" CASCADE',
      'DROP TABLE IF EXISTS "orders" CASCADE',
      'DROP TABLE IF EXISTS "order_items" CASCADE',
      'DROP TABLE IF EXISTS "customers" CASCADE',
      'DROP TABLE IF EXISTS "carts" CASCADE',
      'DROP TABLE IF EXISTS "cart_items" CASCADE'
    ];

    for (const dropSQL of dropTables) {
      try {
        await prisma.$executeRawUnsafe(dropSQL);
        console.log(`✅ Tabelle gelöscht: ${dropSQL}`);
      } catch (e) {
        console.log(`ℹ️ Tabelle existierte nicht: ${dropSQL}`);
      }
    }

    // 2. Erstelle alle Tabellen neu
    console.log('📝 Erstelle alle Tabellen neu...');

    // Users Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Profiles Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "user_profiles" (
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
      )
    `);

    // Restaurant Settings Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "restaurant_settings" (
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
        "impressumContent" TEXT,
        "agbContent" TEXT,
        "datenschutzContent" TEXT,
        "impressumLastUpdated" TIMESTAMP,
        "agbLastUpdated" TIMESTAMP,
        "datenschutzLastUpdated" TIMESTAMP,
        "maintenanceMode" BOOLEAN DEFAULT false,
        "maintenanceMessage" TEXT,
        "maintenanceTitle" TEXT,
        "selectedTheme" TEXT DEFAULT 'classic-elegant',
        "customColors" JSONB,
        "customFonts" JSONB,
        "customSpacing" JSONB,
        "customComponents" JSONB,
        "darkModeEnabled" BOOLEAN DEFAULT false,
        "darkModeColors" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "categories" (
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
      )
    `);

    // Products Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "products" (
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
      )
    `);

    // Coupons Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "coupons" (
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
      )
    `);

    // Sessions Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "sessions" (
        "id" SERIAL PRIMARY KEY,
        "sessionId" TEXT NOT NULL UNIQUE,
        "userId" INTEGER NOT NULL,
        "role" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "lastActivity" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sessionStart" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    console.log('✅ Alle Tabellen erfolgreich erstellt');

    // 3. Erstelle Admin-User
    const adminEmail = 'office@gastro-cms.at';
    const adminPassword = 'ComPaq1987!';
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

    console.log('✅ Admin-User erstellt:', admin.email);

    // 4. Erstelle Standard Restaurant-Einstellungen
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
        sitemapEnabled: true,
        impressumContent: null,
        agbContent: null,
        datenschutzContent: null,
        impressumLastUpdated: null,
        agbLastUpdated: null,
        datenschutzLastUpdated: null,
        maintenanceMode: false,
        maintenanceMessage: null,
        maintenanceTitle: null,
        selectedTheme: 'classic-elegant',
        customColors: undefined,
        customFonts: undefined,
        customSpacing: undefined,
        customComponents: undefined,
        darkModeEnabled: false,
        darkModeColors: undefined
      }
    });

    console.log('✅ Restaurant-Einstellungen erstellt');

    // 5. Erstelle Test-Gutschein
    await prisma.coupon.create({
      data: {
        code: 'PIZZA20',
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

    console.log('✅ Test-Gutschein erstellt');

    console.log('🎉 Komplette Neuinitialisierung erfolgreich abgeschlossen!');

    return NextResponse.json({
      success: true,
      message: 'Database completely reinitialized',
      adminEmail: adminEmail,
      adminPassword: adminPassword,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Neuinitialisierung fehlgeschlagen:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Komplette Datenbank-Neuinitialisierung',
    usage: 'POST /api/reset-db für komplette Neuinitialisierung',
    warning: 'Dies löscht ALLE Daten und erstellt alles neu!'
  });
}