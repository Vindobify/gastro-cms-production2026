import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/autoInit';

// Manuelle Initialisierung über API-Endpunkt
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manuelle Datenbank-Initialisierung gestartet...');
    
    const result = await initializeDatabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        adminEmail: result.adminEmail || 'office@gastro-cms.at',
        adminPassword: result.adminPassword || 'ComPaq1987!',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Initialisierung fehlgeschlagen',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Manuelle Initialisierung fehlgeschlagen:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Datenbank-Initialisierung API',
    usage: 'POST /api/init-db für manuelle Initialisierung',
    adminCredentials: {
      email: 'office@gastro-cms.at',
      password: 'ComPaq1987!'
    }
  });
}
