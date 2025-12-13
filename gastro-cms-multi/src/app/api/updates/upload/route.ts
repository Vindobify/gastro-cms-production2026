import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FileUpdate {
  path: string;
  content: string;
  hash: string;
  action: 'create' | 'update' | 'delete';
}

interface UpdatePackage {
  version: string;
  description: string;
  files: FileUpdate[];
  timestamp: string;
  checksum: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Update Upload gestartet...');
    
    const formData = await request.formData();
    const updateFile = formData.get('update') as File;
    const version = formData.get('version') as string;
    const description = formData.get('description') as string;
    
    if (!updateFile || !version) {
      return NextResponse.json({ 
        error: 'Update-Datei und Version sind erforderlich' 
      }, { status: 400 });
    }

    // Update-Paket verarbeiten
    const updateData = JSON.parse(await updateFile.text()) as UpdatePackage;
    
    // Validierung
    if (!updateData.files || !Array.isArray(updateData.files)) {
      return NextResponse.json({ 
        error: 'Ungültiges Update-Paket Format' 
      }, { status: 400 });
    }

    console.log(`📋 Update Version: ${version}`);
    console.log(`📝 Beschreibung: ${description || 'Keine Beschreibung'}`);
    console.log(`📁 Dateien: ${updateData.files.length}`);

    // Backup erstellen
    const backupResult = await createBackup(version);
    if (!backupResult.success) {
      throw new Error(`Backup fehlgeschlagen: ${backupResult.message}`);
    }

    // Update anwenden
    const applyResult = await applyUpdate(updateData, version);
    if (!applyResult.success) {
      // Rollback bei Fehler
      await rollbackUpdate(backupResult.backupPath!);
      throw new Error(`Update fehlgeschlagen: ${applyResult.message}`);
    }

    // Dependencies installieren
    await installDependencies();

    // Datenbank migrieren
    await migrateDatabase();

    // PM2 neu starten
    await restartPM2();

    // Update-Log erstellen
    await logUpdate(version, description, updateData.files.length);

    console.log('✅ Update erfolgreich installiert');

    return NextResponse.json({
      success: true,
      message: `Update ${version} erfolgreich installiert`,
      version,
      filesUpdated: updateData.files.length,
      backupPath: backupResult.backupPath
    });

  } catch (error) {
    console.error('❌ Update Upload Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Update fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

// Backup erstellen
async function createBackup(version: string): Promise<{ success: boolean; message: string; backupPath?: string }> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `/var/backups/gastro-cms/backup-${version}-${timestamp}`;
    
    await execAsync(`mkdir -p ${backupPath}`);
    
    // Wichtige Verzeichnisse sichern
    const importantDirs = [
      'src',
      'prisma',
      'public',
      'package.json',
      'package-lock.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'postcss.config.js'
    ];
    
    for (const dir of importantDirs) {
      try {
        await execAsync(`cp -r /var/www/gastro-cms/${dir} ${backupPath}/`);
      } catch (e) {
        console.warn(`⚠️ Konnte ${dir} nicht sichern:`, e);
      }
    }
    
    return { success: true, message: 'Backup erstellt', backupPath };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Backup fehlgeschlagen' 
    };
  }
}

// Update anwenden
async function applyUpdate(updateData: UpdatePackage, version: string): Promise<{ success: boolean; message: string }> {
  try {
    const projectRoot = '/var/www/gastro-cms';
    let updatedFiles = 0;
    let createdFiles = 0;
    let deletedFiles = 0;

    for (const file of updateData.files) {
      const filePath = join(projectRoot, file.path);
      const fileDir = dirname(filePath);

      try {
        // Verzeichnis erstellen falls nötig
        await mkdir(fileDir, { recursive: true });

        if (file.action === 'delete') {
          try {
            await execAsync(`rm -f "${filePath}"`);
            deletedFiles++;
            console.log(`🗑️ Gelöscht: ${file.path}`);
          } catch (e) {
            console.warn(`⚠️ Konnte Datei nicht löschen: ${file.path}`);
          }
        } else {
          // Datei schreiben
          await writeFile(filePath, file.content, 'utf8');
          
          if (file.action === 'create') {
            createdFiles++;
            console.log(`➕ Erstellt: ${file.path}`);
          } else {
            updatedFiles++;
            console.log(`📝 Aktualisiert: ${file.path}`);
          }
        }
      } catch (error) {
        console.error(`❌ Fehler bei Datei ${file.path}:`, error);
        throw error;
      }
    }

    console.log(`📊 Update-Statistik:`);
    console.log(`   ➕ Erstellt: ${createdFiles}`);
    console.log(`   📝 Aktualisiert: ${updatedFiles}`);
    console.log(`   🗑️ Gelöscht: ${deletedFiles}`);

    return { 
      success: true, 
      message: `${updatedFiles} aktualisiert, ${createdFiles} erstellt, ${deletedFiles} gelöscht` 
    };

  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Update-Anwendung fehlgeschlagen' 
    };
  }
}

// Rollback durchführen
async function rollbackUpdate(backupPath: string): Promise<void> {
  try {
    console.log('🔄 Führe Rollback durch...');
    await execAsync(`cp -r ${backupPath}/* /var/www/gastro-cms/`);
    console.log('✅ Rollback abgeschlossen');
  } catch (error) {
    console.error('❌ Rollback fehlgeschlagen:', error);
  }
}

// Dependencies installieren
async function installDependencies(): Promise<void> {
  try {
    console.log('📦 Installiere Dependencies...');
    await execAsync('cd /var/www/gastro-cms && npm install --production');
    console.log('✅ Dependencies installiert');
  } catch (error) {
    console.error('❌ Dependencies-Installation fehlgeschlagen:', error);
    throw error;
  }
}

// Datenbank migrieren
async function migrateDatabase(): Promise<void> {
  try {
    console.log('🗄️ Migriere Datenbank...');
    await execAsync('cd /var/www/gastro-cms && npx prisma db push');
    console.log('✅ Datenbank migriert');
  } catch (error) {
    console.error('❌ Datenbank-Migration fehlgeschlagen:', error);
    throw error;
  }
}

// PM2 neu starten
async function restartPM2(): Promise<void> {
  try {
    console.log('🔄 Starte PM2 neu...');
    await execAsync('pm2 restart gastro-cms');
    console.log('✅ PM2 neu gestartet');
  } catch (error) {
    console.error('❌ PM2-Neustart fehlgeschlagen:', error);
    throw error;
  }
}

// Update-Log erstellen
async function logUpdate(version: string, description: string, filesCount: number): Promise<void> {
  try {
    const logEntry = {
      version,
      description,
      filesCount,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    const logPath = '/var/log/gastro-cms/updates.log';
    await execAsync(`mkdir -p ${dirname(logPath)}`);
    await writeFile(logPath, JSON.stringify(logEntry, null, 2) + '\n', { flag: 'a' });
  } catch (error) {
    console.error('❌ Update-Log fehlgeschlagen:', error);
  }
}
