import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// Health Check mit detaillierter Datenbank-Information
export async function GET() {
  try {
    console.log('🔍 Health Check gestartet...');
    
    // 1. Datenbankverbindung testen
    await prisma.$connect();
    console.log('✅ Datenbankverbindung erfolgreich');
    
    // 2. Prüfen ob wichtige Tabellen existieren
    const tables = ['users', 'restaurant_settings', 'categories', 'products', 'coupons'];
    const tableStatus: { [key: string]: boolean } = {};
    
    for (const table of tables) {
      try {
        await prisma.$executeRaw`SELECT 1 FROM "${table}" LIMIT 1`;
        tableStatus[table] = true;
        console.log(`✅ Tabelle ${table} existiert`);
      } catch (error) {
        tableStatus[table] = false;
        console.log(`❌ Tabelle ${table} existiert nicht`);
      }
    }
    
    // 3. Prüfen ob Admin-User existiert
    let adminExists = false;
    try {
      const admin = await prisma.user.findUnique({
        where: { email: 'office@gastro-cms.at' }
      });
      adminExists = !!admin;
      console.log(`ℹ️ Admin-User existiert: ${adminExists}`);
    } catch (error) {
      console.log('❌ Admin-User-Check fehlgeschlagen');
    }
    
    // 4. Prüfen ob Restaurant-Settings existieren
    let settingsExist = false;
    try {
      const settings = await prisma.restaurantSettings.findFirst();
      settingsExist = !!settings;
      console.log(`ℹ️ Restaurant-Settings existieren: ${settingsExist}`);
    } catch (error) {
      console.log('❌ Restaurant-Settings-Check fehlgeschlagen');
    }
    
    const allTablesExist = Object.values(tableStatus).every(exists => exists);
    const isFullyInitialized = allTablesExist && adminExists && settingsExist;
    
    const response = {
      status: isFullyInitialized ? 'healthy' : 'partially_healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      tables: tableStatus,
      adminUser: adminExists,
      restaurantSettings: settingsExist,
      fullyInitialized: isFullyInitialized,
      needsInitialization: !isFullyInitialized,
      initEndpoint: '/api/init-db'
    };
    
    console.log('📊 Health Check Ergebnis:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Health Check fehlgeschlagen:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'UnknownError',
      needsInitialization: true,
      initEndpoint: '/api/init-db'
    }, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}