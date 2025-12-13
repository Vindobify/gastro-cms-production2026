import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createHash } from 'crypto';

interface FileInfo {
  path: string;
  hash: string;
  size: number;
  lastModified: Date;
}

interface DiffResult {
  added: FileInfo[];
  modified: FileInfo[];
  deleted: FileInfo[];
  unchanged: FileInfo[];
  totalFiles: number;
  changedFiles: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 File Diff gestartet...');
    
    const { sourcePath, targetPath, ignorePatterns = [] } = await request.json();
    
    if (!sourcePath || !targetPath) {
      return NextResponse.json({ 
        error: 'sourcePath und targetPath sind erforderlich' 
      }, { status: 400 });
    }

    // Dateien scannen
    const sourceFiles = await scanDirectory(sourcePath, ignorePatterns);
    const targetFiles = await scanDirectory(targetPath, ignorePatterns);

    // Diff berechnen
    const diff = calculateDiff(sourceFiles, targetFiles);

    console.log(`📊 Diff-Ergebnis:`);
    console.log(`   ➕ Neu: ${diff.added.length}`);
    console.log(`   📝 Geändert: ${diff.modified.length}`);
    console.log(`   🗑️ Gelöscht: ${diff.deleted.length}`);
    console.log(`   ✅ Unverändert: ${diff.unchanged.length}`);

    return NextResponse.json({
      success: true,
      diff,
      summary: {
        totalFiles: diff.totalFiles,
        changedFiles: diff.changedFiles,
        addedCount: diff.added.length,
        modifiedCount: diff.modified.length,
        deletedCount: diff.deleted.length,
        unchangedCount: diff.unchanged.length
      }
    });

  } catch (error) {
    console.error('❌ File Diff Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'File Diff fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

// Verzeichnis rekursiv scannen
async function scanDirectory(dirPath: string, ignorePatterns: string[] = []): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = relative(process.cwd(), fullPath);
      
      // Ignore-Patterns prüfen
      if (shouldIgnore(relativePath, ignorePatterns)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Rekursiv in Unterverzeichnisse gehen
        const subFiles = await scanDirectory(fullPath, ignorePatterns);
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
            lastModified: stats.mtime
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
      // Wildcard-Pattern
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    } else {
      // Exakte Übereinstimmung oder Pfad-Start
      return filePath === pattern || filePath.startsWith(pattern + '/');
    }
  });
}

// Diff zwischen zwei Datei-Listen berechnen
function calculateDiff(sourceFiles: FileInfo[], targetFiles: FileInfo[]): DiffResult {
  const sourceMap = new Map(sourceFiles.map(f => [f.path, f]));
  const targetMap = new Map(targetFiles.map(f => [f.path, f]));
  
  const added: FileInfo[] = [];
  const modified: FileInfo[] = [];
  const deleted: FileInfo[] = [];
  const unchanged: FileInfo[] = [];
  
  // Dateien in Source aber nicht in Target = Neu
  for (const [path, file] of sourceMap) {
    if (!targetMap.has(path)) {
      added.push(file);
    }
  }
  
  // Dateien in beiden = Vergleichen
  for (const [path, sourceFile] of sourceMap) {
    const targetFile = targetMap.get(path);
    if (targetFile) {
      if (sourceFile.hash !== targetFile.hash) {
        modified.push(sourceFile);
      } else {
        unchanged.push(sourceFile);
      }
    }
  }
  
  // Dateien in Target aber nicht in Source = Gelöscht
  for (const [path, file] of targetMap) {
    if (!sourceMap.has(path)) {
      deleted.push(file);
    }
  }
  
  const totalFiles = sourceFiles.length;
  const changedFiles = added.length + modified.length + deleted.length;
  
  return {
    added,
    modified,
    deleted,
    unchanged,
    totalFiles,
    changedFiles
  };
}
