import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Schema Push für Vercel - führt prisma db push aus
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Prisma DB Push gestartet...');
    
    // Prüfe Environment
    const databaseUrl = process.env.gastro_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL nicht gesetzt',
        details: 'Prüfe Vercel Environment Variables (gastro_DATABASE_URL oder DATABASE_URL)'
      }, { status: 500 });
    }

    console.log('📍 DATABASE_URL:', databaseUrl);

    try {
      // Führe prisma db push aus um Schema zu erstellen
      console.log('⚡ Führe prisma db push aus...');
      
      const { stdout, stderr } = await execAsync('npx prisma db push --force-reset', {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl },
        timeout: 30000 // 30 Sekunden Timeout
      });

      console.log('📤 STDOUT:', stdout);
      if (stderr) {
        console.log('📥 STDERR:', stderr);
      }

      // Danach noch prisma generate ausführen
      console.log('⚡ Führe prisma generate aus...');
      const { stdout: genStdout, stderr: genStderr } = await execAsync('npx prisma generate', {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 20000
      });

      console.log('📤 Generate STDOUT:', genStdout);
      if (genStderr) {
        console.log('📥 Generate STDERR:', genStderr);
      }

      return NextResponse.json({
        success: true,
        message: 'Prisma DB Push erfolgreich ausgeführt',
        details: {
          pushOutput: stdout,
          generateOutput: genStdout,
          warnings: stderr || genStderr || null
        },
        nextSteps: [
          'Schema wurde komplett erstellt',
          'Rufe jetzt POST /api/init-prisma auf um Basisdaten zu erstellen',
          'Teste dann GET /api/health'
        ]
      });

    } catch (execError) {
      console.error('❌ Prisma Kommando fehlgeschlagen:', execError);
      
      return NextResponse.json({
        error: 'Prisma DB Push fehlgeschlagen',
        details: execError instanceof Error ? execError.message : 'Unknown error',
        suggestion: 'Möglicherweise ist prisma CLI nicht verfügbar in Vercel Functions',
        fallback: 'Verwende POST /api/init-complete für manuelle Schema-Erstellung'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Schema Push Fehler:', error);
    
    return NextResponse.json({
      error: 'Schema Push fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Prüfe Vercel Environment und Permissions'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Prisma Schema Push für Vercel',
    description: 'Führt "prisma db push" aus um komplettes Schema zu erstellen',
    usage: 'POST zu dieser Route um Schema automatisch zu pushen',
    warning: 'Funktioniert nur wenn Prisma CLI in Vercel verfügbar ist'
  });
}
