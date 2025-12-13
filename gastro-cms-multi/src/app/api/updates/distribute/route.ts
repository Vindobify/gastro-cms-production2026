import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface UpdatePackage {
  version: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
    hash: string;
    action: 'create' | 'update' | 'delete';
  }>;
  timestamp: string;
  checksum: string;
}

interface DistributionTarget {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate?: string;
  lastError?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Update-Verteilung gestartet...');
    
    const { updatePackage, targetIds = [] } = await request.json();
    
    if (!updatePackage) {
      return NextResponse.json({ 
        error: 'Update-Paket ist erforderlich' 
      }, { status: 400 });
    }

    // Verteilungstargets laden
    const targets = await loadDistributionTargets();
    
    // Filtere Targets (falls spezifische IDs angegeben)
    const selectedTargets = targetIds.length > 0 
      ? targets.filter(t => targetIds.includes(t.id))
      : targets.filter(t => t.status === 'active');

    if (selectedTargets.length === 0) {
      return NextResponse.json({ 
        error: 'Keine aktiven Verteilungstargets gefunden' 
      }, { status: 400 });
    }

    console.log(`📡 Verteile Update an ${selectedTargets.length} Targets...`);

    // Update an alle Targets verteilen
    const results = await distributeToTargets(updatePackage, selectedTargets);

    // Ergebnisse zusammenfassen
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`📊 Verteilung abgeschlossen:`);
    console.log(`   ✅ Erfolgreich: ${successCount}`);
    console.log(`   ❌ Fehler: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `Update an ${successCount}/${selectedTargets.length} Targets verteilt`,
      results,
      summary: {
        totalTargets: selectedTargets.length,
        successCount,
        errorCount
      }
    });

  } catch (error) {
    console.error('❌ Update-Verteilung Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Update-Verteilung fehlgeschlagen',
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
    console.warn('⚠️ Konnte Verteilungstargets nicht laden, verwende Standard-Konfiguration');
    return [
      {
        id: 'production',
        name: 'Production Server',
        url: process.env.PRODUCTION_URL || 'https://gastro-cms.at',
        apiKey: process.env.PRODUCTION_API_KEY || '',
        status: 'active'
      }
    ];
  }
}

// Update an alle Targets verteilen
async function distributeToTargets(
  updatePackage: UpdatePackage, 
  targets: DistributionTarget[]
): Promise<Array<{ targetId: string; success: boolean; message: string; error?: string }>> {
  const results = [];
  
  for (const target of targets) {
    try {
      console.log(`📤 Verteile an ${target.name} (${target.url})...`);
      
      const result = await distributeToTarget(updatePackage, target);
      results.push({
        targetId: target.id,
        success: true,
        message: result.message
      });
      
      // Target-Status aktualisieren
      await updateTargetStatus(target.id, 'active', new Date().toISOString());
      
    } catch (error) {
      console.error(`❌ Fehler bei ${target.name}:`, error);
      
      results.push({
        targetId: target.id,
        success: false,
        message: 'Verteilung fehlgeschlagen',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
      
      // Target-Status als Fehler markieren
      await updateTargetStatus(target.id, 'error', undefined, error instanceof Error ? error.message : 'Unbekannter Fehler');
    }
  }
  
  return results;
}

// Update an ein einzelnes Target verteilen
async function distributeToTarget(
  updatePackage: UpdatePackage, 
  target: DistributionTarget
): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();
    
    // Update-Paket als Blob erstellen
    const updateBlob = new Blob([JSON.stringify(updatePackage)], { 
      type: 'application/json' 
    });
    
    formData.append('update', updateBlob, 'update.json');
    formData.append('version', updatePackage.version);
    formData.append('description', updatePackage.description);
    
    // API-Key hinzufügen
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${target.apiKey}`,
      'X-Update-Source': 'distribution-system'
    };
    
    // Update an Target senden
    const response = await fetch(`${target.url}/api/updates/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Update fehlgeschlagen');
    }
    
    return {
      success: true,
      message: `Update ${updatePackage.version} erfolgreich verteilt`
    };
    
  } catch (error) {
    throw new Error(`Verteilung an ${target.name} fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

// Target-Status aktualisieren
async function updateTargetStatus(
  targetId: string, 
  status: 'active' | 'inactive' | 'error',
  lastUpdate?: string,
  lastError?: string
): Promise<void> {
  try {
    const configPath = join(process.cwd(), 'data', 'distribution-targets.json');
    const configData = await readFile(configPath, 'utf8');
    const targets = JSON.parse(configData);
    
    const target = targets.find((t: DistributionTarget) => t.id === targetId);
    if (target) {
      target.status = status;
      if (lastUpdate) target.lastUpdate = lastUpdate;
      if (lastError) target.lastError = lastError;
      
      await writeFile(configPath, JSON.stringify(targets, null, 2));
    }
  } catch (error) {
    console.warn('⚠️ Konnte Target-Status nicht aktualisieren:', error);
  }
}
