import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface DistributionTarget {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate?: string;
  lastError?: string;
}

export async function GET(request: NextRequest) {
  try {
    const targets = await loadDistributionTargets();
    
    return NextResponse.json({
      success: true,
      targets
    });

  } catch (error) {
    console.error('❌ Targets Load Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Fehler beim Laden der Targets',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newTarget = await request.json();
    
    // Validierung
    if (!newTarget.name || !newTarget.url || !newTarget.apiKey) {
      return NextResponse.json({ 
        error: 'Name, URL und API-Key sind erforderlich' 
      }, { status: 400 });
    }

    const targets = await loadDistributionTargets();
    
    // Prüfen ob ID bereits existiert
    if (targets.find(t => t.id === newTarget.id)) {
      return NextResponse.json({ 
        error: 'Target-ID bereits vorhanden' 
      }, { status: 400 });
    }

    // Neues Target hinzufügen
    const target: DistributionTarget = {
      id: newTarget.id || `target-${Date.now()}`,
      name: newTarget.name,
      url: newTarget.url,
      apiKey: newTarget.apiKey,
      status: 'active'
    };

    targets.push(target);
    await saveDistributionTargets(targets);

    return NextResponse.json({
      success: true,
      message: 'Target erfolgreich hinzugefügt',
      target
    });

  } catch (error) {
    console.error('❌ Target Create Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Fehler beim Erstellen des Targets',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Target-ID ist erforderlich' 
      }, { status: 400 });
    }

    const targets = await loadDistributionTargets();
    const targetIndex = targets.findIndex(t => t.id === id);
    
    if (targetIndex === -1) {
      return NextResponse.json({ 
        error: 'Target nicht gefunden' 
      }, { status: 404 });
    }

    // Target aktualisieren
    targets[targetIndex] = { ...targets[targetIndex], ...updateData };
    await saveDistributionTargets(targets);

    return NextResponse.json({
      success: true,
      message: 'Target erfolgreich aktualisiert',
      target: targets[targetIndex]
    });

  } catch (error) {
    console.error('❌ Target Update Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Fehler beim Aktualisieren des Targets',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Target-ID ist erforderlich' 
      }, { status: 400 });
    }

    const targets = await loadDistributionTargets();
    const filteredTargets = targets.filter(t => t.id !== id);
    
    if (filteredTargets.length === targets.length) {
      return NextResponse.json({ 
        error: 'Target nicht gefunden' 
      }, { status: 404 });
    }

    await saveDistributionTargets(filteredTargets);

    return NextResponse.json({
      success: true,
      message: 'Target erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('❌ Target Delete Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Fehler beim Löschen des Targets',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

// Verteilungstargets laden
async function loadDistributionTargets(): Promise<DistributionTarget[]> {
  try {
    const configPath = join(process.cwd(), 'data', 'distribution-targets.json');
    const configData = await readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn('⚠️ Konnte Verteilungstargets nicht laden, erstelle Standard-Konfiguration');
    
    // Standard-Konfiguration erstellen
    const defaultTargets: DistributionTarget[] = [
      {
        id: 'production',
        name: 'Production Server',
        url: process.env.PRODUCTION_URL || 'https://gastro-cms.at',
        apiKey: process.env.PRODUCTION_API_KEY || '',
        status: 'active'
      }
    ];
    
    await saveDistributionTargets(defaultTargets);
    return defaultTargets;
  }
}

// Verteilungstargets speichern
async function saveDistributionTargets(targets: DistributionTarget[]): Promise<void> {
  const configPath = join(process.cwd(), 'data', 'distribution-targets.json');
  await writeFile(configPath, JSON.stringify(targets, null, 2));
}
