import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Schema-Sync API - Löscht alte Tabellen und erstellt neue via Prisma
export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🚀 Schema-Sync gestartet...');
    
    // Prisma Client initialisieren
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Prisma Client verbunden');

    try {
      // 1. Lösche alle Tabellen
      console.log('🗑️ Lösche bestehende Tabellen...');
      
      const dropTables = [
        'DROP TABLE IF EXISTS user_profiles',
        'DROP TABLE IF EXISTS users', 
        'DROP TABLE IF EXISTS restaurant_settings',
        'DROP TABLE IF EXISTS categories',
        'DROP TABLE IF EXISTS products',
        'DROP TABLE IF EXISTS orders'
      ];

      for (const dropSQL of dropTables) {
        try {
          await prisma.$executeRawUnsafe(dropSQL);
        } catch (e) {
          // Ignoriere Fehler beim Löschen
        }
      }

      // 2. Erstelle Tabellen exakt nach Prisma Schema
      console.log('📝 Erstelle Tabellen nach Prisma Schema...');

      // Users Tabelle - exakt nach schema.prisma
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "users" (
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

      // User Profiles Tabelle
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "user_profiles" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL UNIQUE,
          "firstName" TEXT,
          "lastName" TEXT,
          "phone" TEXT,
          "dateOfBirth" DATETIME,
          "gender" TEXT,
          "avatar" TEXT,
          "bio" TEXT,
          "country" TEXT,
          "city" TEXT,
          "postalCode" TEXT,
          "address" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
        )
      `);

      // Restaurant Settings Tabelle
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "restaurant_settings" (
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

      console.log('✅ Schema erfolgreich synchronisiert');

      return NextResponse.json({
        success: true,
        message: 'Schema-Sync erfolgreich! 🎉',
        nextStep: 'Rufe jetzt /api/init-direct auf um Daten zu erstellen',
        tables: ['users', 'user_profiles', 'restaurant_settings']
      });

    } catch (error) {
      console.error('❌ Schema-Sync fehlgeschlagen:', error);
      return NextResponse.json({
        error: 'Schema-Sync fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Kritischer Schema-Sync Fehler:', error);
    return NextResponse.json({
      error: 'Kritischer Schema-Sync Fehler',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Schema-Sync API 🚀',
    instructions: 'Diese API synchronisiert das SQLite-Schema mit Prisma',
    endpoint: 'POST /api/schema-sync',
    warning: 'ACHTUNG: Löscht alle bestehenden Tabellen!'
  });
}
