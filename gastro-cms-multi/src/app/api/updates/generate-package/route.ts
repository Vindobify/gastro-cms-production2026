import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createHash } from 'crypto';

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
    console.log('📦 Update-Paket Generator gestartet...');
    
    const { 
      version, 
      description, 
      sourcePath, 
      targetPath, 
      ignorePatterns = [],
      includePatterns = []
    } = await request.json();
    
    if (!version || !sourcePath || !targetPath) {
      return NextResponse.json({ 
        error: 'version, sourcePath und targetPath sind erforderlich' 
      }, { status: 400 });
    }

    // Dateien scannen
    const sourceFiles = await scanDirectory(sourcePath, ignorePatterns, includePatterns);
    const targetFiles = await scanDirectory(targetPath, ignorePatterns, includePatterns);

    // Diff berechnen
    const diff = calculateDiff(sourceFiles, targetFiles);

    // Update-Paket erstellen
    const updatePackage = await createUpdatePackage(
      version, 
      description, 
      diff, 
      sourcePath
    );

    console.log(`📦 Update-Paket erstellt:`);
    console.log(`   Version: ${version}`);
    console.log(`   Dateien: ${updatePackage.files.length}`);
    console.log(`   Größe: ${JSON.stringify(updatePackage).length} bytes`);

    return NextResponse.json({
      success: true,
      package: updatePackage,
      summary: {
        version,
        totalFiles: updatePackage.files.length,
        addedCount: diff.added.length,
        modifiedCount: diff.modified.length,
        deletedCount: diff.deleted.length
      }
    });

  } catch (error) {
    console.error('❌ Update-Paket Generator Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Update-Paket Generator fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

// Verzeichnis rekursiv scannen
async function scanDirectory(
  dirPath: string, 
  ignorePatterns: string[] = [],
  includePatterns: string[] = []
): Promise<Array<{ path: string; hash: string; size: number; lastModified: Date; content?: string }>> {
  const files: Array<{ path: string; hash: string; size: number; lastModified: Date; content?: string }> = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = relative(process.cwd(), fullPath);
      
      // Ignore-Patterns prüfen
      if (shouldIgnore(relativePath, ignorePatterns)) {
        continue;
      }
      
      // Include-Patterns prüfen (falls definiert)
      if (includePatterns.length > 0 && !shouldInclude(relativePath, includePatterns)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Rekursiv in Unterverzeichnisse gehen
        const subFiles = await scanDirectory(fullPath, ignorePatterns, includePatterns);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        try {
          const stats = await stat(fullPath);
          const content = await readFile(fullPath, 'utf8');
          const hash = createHash('sha256').update(content).digest('hex');
          
          files.push({
            path: relativePath,
            hash,
            size: stats.size,
            lastModified: stats.mtime,
            content
          });
        } catch (error) {
          console.warn(`⚠️ Konnte Datei nicht lesen: ${fullPath}`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Konnte Verzeichnis nicht lesen: ${dirPath}`, error);
  }
  
  return files;
}

// Prüfen ob Datei ignoriert werden soll
function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    } else {
      return filePath === pattern || filePath.startsWith(pattern + '/');
    }
  });
}

// Prüfen ob Datei eingeschlossen werden soll
function shouldInclude(filePath: string, includePatterns: string[]): boolean {
  if (includePatterns.length === 0) return true;
  
  return includePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    } else {
      return filePath === pattern || filePath.startsWith(pattern + '/');
    }
  });
}

// Diff zwischen zwei Datei-Listen berechnen
function calculateDiff(
  sourceFiles: Array<{ path: string; hash: string; size: number; lastModified: Date; content?: string }>,
  targetFiles: Array<{ path: string; hash: string; size: number; lastModified: Date; content?: string }>
) {
  const sourceMap = new Map(sourceFiles.map(f => [f.path, f]));
  const targetMap = new Map(targetFiles.map(f => [f.path, f]));
  
  const added = sourceFiles.filter(f => !targetMap.has(f.path));
  const modified = sourceFiles.filter(f => {
    const target = targetMap.get(f.path);
    return target && f.hash !== target.hash;
  });
  const deleted = targetFiles.filter(f => !sourceMap.has(f.path));
  
  return { added, modified, deleted };
}

// Update-Paket erstellen
async function createUpdatePackage(
  version: string,
  description: string,
  diff: { added: any[]; modified: any[]; deleted: any[] },
  sourcePath: string
): Promise<UpdatePackage> {
  const files: FileUpdate[] = [];
  
  // Hinzugefügte und geänderte Dateien
  for (const file of [...diff.added, ...diff.modified]) {
    if (file.content) {
      files.push({
        path: file.path,
        content: file.content,
        hash: file.hash,
        action: diff.added.includes(file) ? 'create' : 'update'
      });
    }
  }
  
  // Gelöschte Dateien
  for (const file of diff.deleted) {
    files.push({
      path: file.path,
      content: '',
      hash: '',
      action: 'delete'
    });
  }
  
  // Checksum des gesamten Pakets
  const packageContent = JSON.stringify({ version, description, files, timestamp: new Date().toISOString() });
  const checksum = createHash('sha256').update(packageContent).digest('hex');
  
  return {
    version,
    description,
    files,
    timestamp: new Date().toISOString(),
    checksum
  };
}
