import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Komplette Initialisierung - Alle wichtigen Tabellen + Login
export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🚀 Komplette Initialisierung gestartet...');
    
    // Request Body parsen (nur Initialisierung, kein Login)
    const { action = 'init' } = await request.json();
    
    // Prisma Client
    prisma = new PrismaClient();
    await prisma.$connect();

    // Immer zuerst alle Tabellen erstellen/prüfen
    console.log('📝 Erstelle alle wichtigen Tabellen...');
    
    // 1. Users Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "emailVerificationToken" TEXT,
        "passwordResetToken" TEXT,
        "passwordResetExpires" DATETIME,
        "lastLoginAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. User Profiles Tabelle (vollständig)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // 3. Restaurant Settings
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "restaurant_settings" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "restaurantName" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "postalCode" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "atuNumber" TEXT,
        "fnNumber" TEXT,
        "logo" TEXT,
        "favicon" TEXT,
        "openingHours" TEXT NOT NULL,
        "orderDeadline" TEXT NOT NULL,
        "deliveryDistricts" TEXT NOT NULL,
        "minOrderAmount" REAL NOT NULL,
        "deliveryFee" REAL NOT NULL,
        "freeDeliveryThreshold" REAL NOT NULL,
        "defaultTaxRate" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'EUR',
        "timezone" TEXT NOT NULL DEFAULT 'Europe/Vienna',
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "ogImage" TEXT,
        "robotsTxt" TEXT,
        "googleAnalyticsId" TEXT,
        "googleTagManagerId" TEXT,
        "facebookPixelId" TEXT,
        "structuredDataEnabled" BOOLEAN NOT NULL DEFAULT true,
        "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Categories (für Dashboard)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "image" TEXT,
        "icon" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Products (für Dashboard)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "articleNumber" TEXT UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL,
        "taxRate" REAL NOT NULL DEFAULT 0.20,
        "categoryId" INTEGER,
        "allergens" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES "categories" ("id")
      )
    `);

    console.log('✅ Alle Tabellen erstellt');

    // Admin-User erstellen falls nicht vorhanden
    const adminEmail = 'office@gastro-cms.at';
    const adminPassword = 'ComPaq1987!';
    
    let adminUser;
    try {
      adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: { profile: true }
      });
    } catch (e) {
      adminUser = null;
    }

    if (!adminUser) {
      console.log('👤 Erstelle Admin-User...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO users (email, password, role, isActive, emailVerified, createdAt, updatedAt)
        VALUES (?, ?, 'ADMIN', 1, 1, datetime('now'), datetime('now'))
      `, adminEmail, hashedPassword);

      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO user_profiles (userId, firstName, lastName, country, createdAt, updatedAt)
        VALUES (1, 'Admin', 'Gastro-CMS', 'Österreich', datetime('now'), datetime('now'))
      `);

      // Restaurant Settings erstellen
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO restaurant_settings 
        (restaurantName, address, city, postalCode, phone, email, atuNumber, fnNumber, logo, favicon, 
         openingHours, orderDeadline, deliveryDistricts, minOrderAmount, deliveryFee, freeDeliveryThreshold, 
         defaultTaxRate, currency, timezone, metaTitle, metaDescription, ogImage, robotsTxt, 
         googleAnalyticsId, googleTagManagerId, facebookPixelId, structuredDataEnabled, sitemapEnabled, 
         createdAt, updatedAt)
        VALUES 
        ('Gastro CMS', 'Musterstraße 1', 'Wien', '1010', '+43 1 123456789', 'info@gastro-cms.at', '', '', '', '/favicon.ico',
         '{"monday":{"open":"11:00","close":"22:00","closed":false},"tuesday":{"open":"11:00","close":"22:00","closed":false},"wednesday":{"open":"11:00","close":"22:00","closed":false},"thursday":{"open":"11:00","close":"22:00","closed":false},"friday":{"open":"11:00","close":"22:00","closed":false},"saturday":{"open":"11:00","close":"22:00","closed":false},"sunday":{"open":"11:00","close":"22:00","closed":false}}',
         '22:00', '["1010", "1020", "1030", "1040", "1050"]', 15.0, 3.0, 25.0, 0.20, 'EUR', 'Europe/Vienna',
         'Gastro CMS - Online Restaurant', 'Bestellen Sie online bei unserem Restaurant. Frische Speisen, schnelle Lieferung.',
         '/favicon.ico', 'User-agent: *\nAllow: /', '', '', '', 1, 1, datetime('now'), datetime('now'))
      `);

      console.log('✅ Admin-User und Settings erstellt');
    }

    // Nur Initialisierung ohne Login
    return NextResponse.json({
      success: true,
      message: 'Komplette Initialisierung erfolgreich! 🎉',
      nextSteps: [
        '1. Gehen Sie zu /dashboard/login',
        '2. Melden Sie sich mit den Admin-Zugangsdaten an',
        '3. Konfigurieren Sie Ihr Restaurant'
      ],
      warning: 'Admin-Zugangsdaten wurden aus Sicherheitsgründen entfernt. Verwenden Sie das normale Login-Formular.'
    });

  } catch (error) {
    console.error('❌ Komplette Initialisierung Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Initialisierung fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Komplette Initialisierung API 🚀',
    endpoints: {
      init: 'POST /api/complete-init'
    },
    warning: 'Login-Funktionalität wurde aus Sicherheitsgründen entfernt. Verwenden Sie /api/auth/login'
  });
}
