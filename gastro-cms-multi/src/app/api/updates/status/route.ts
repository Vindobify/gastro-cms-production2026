import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Lese die aktuelle Version aus der VERSION-Datei
    const versionPath = join(process.cwd(), 'VERSION');
    let currentVersion = '3.0.0';
    
    try {
      const versionContent = readFileSync(versionPath, 'utf8');
      currentVersion = versionContent.trim();
    } catch (error) {
      console.warn('VERSION-Datei nicht gefunden, verwende Standard-Version');
    }

    return NextResponse.json({
      hasUpdate: false,
      currentVersion: currentVersion,
      latestVersion: currentVersion,
      releaseNotes: 'Keine Updates verfügbar',
      publishedAt: new Date().toISOString(),
      downloadUrl: '',
      message: 'System ist auf dem neuesten Stand'
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Update-Status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Update-Status' },
      { status: 500 }
    );
  }
}
