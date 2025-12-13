#!/usr/bin/env node

/**
 * Update-Paket Generator CLI Tool
 * Generiert Update-Pakete für das File-based Update System
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Konfiguration
const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  '.git/**',
  '*.log',
  '.env*',
  'data/**',
  'backups/**',
  '*.db',
  '*.sqlite',
  '*.sqlite3',
  'coverage/**',
  'dist/**',
  'build/**'
];

const DEFAULT_INCLUDE_PATTERNS = [
  'src/**',
  'prisma/**',
  'public/**',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'postcss.config.js',
  'eslint.config.mjs'
];

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  try {
    const config = parseArgs(args);
    console.log('🚀 Update-Paket Generator gestartet...');
    console.log(`📦 Version: ${config.version}`);
    console.log(`📝 Beschreibung: ${config.description}`);
    console.log(`📁 Source: ${config.sourcePath}`);
    console.log(`📁 Target: ${config.targetPath}`);

    // Verzeichnisse scannen
    console.log('\n🔍 Scanne Verzeichnisse...');
    const sourceFiles = await scanDirectory(config.sourcePath, config.ignorePatterns, config.includePatterns);
    const targetFiles = await scanDirectory(config.targetPath, config.ignorePatterns, config.includePatterns);

    console.log(`📊 Source-Dateien: ${sourceFiles.length}`);
    console.log(`📊 Target-Dateien: ${targetFiles.length}`);

    // Diff berechnen
    console.log('\n🔄 Berechne Diff...');
    const diff = calculateDiff(sourceFiles, targetFiles);

    console.log(`➕ Neu: ${diff.added.length}`);
    console.log(`📝 Geändert: ${diff.modified.length}`);
    console.log(`🗑️ Gelöscht: ${diff.deleted.length}`);

    if (diff.added.length === 0 && diff.modified.length === 0 && diff.deleted.length === 0) {
      console.log('✅ Keine Änderungen gefunden - Update-Paket ist leer');
      return;
    }

    // Update-Paket erstellen
    console.log('\n📦 Erstelle Update-Paket...');
    const updatePackage = await createUpdatePackage(config.version, config.description, diff, config.sourcePath);

    // Paket speichern
    const outputPath = path.join(process.cwd(), `update-${config.version}.json`);
    await fs.writeFile(outputPath, JSON.stringify(updatePackage, null, 2));

    console.log(`✅ Update-Paket erstellt: ${outputPath}`);
    console.log(`📊 Dateien im Paket: ${updatePackage.files.length}`);
    console.log(`📏 Paket-Größe: ${(await fs.stat(outputPath)).size} bytes`);

    // Optional: Paket validieren
    if (config.validate) {
      console.log('\n🔍 Validiere Update-Paket...');
      await validateUpdatePackage(updatePackage);
      console.log('✅ Update-Paket ist gültig');
    }

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  }
}

function parseArgs(args) {
  const config = {
    version: '1.0.0',
    description: 'Update via CLI generiert',
    sourcePath: process.cwd(),
    targetPath: process.cwd(),
    ignorePatterns: DEFAULT_IGNORE_PATTERNS,
    includePatterns: DEFAULT_INCLUDE_PATTERNS,
    validate: false,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--version':
      case '-v':
        config.version = args[++i];
        break;
      case '--description':
      case '-d':
        config.description = args[++i];
        break;
      case '--source':
      case '-s':
        config.sourcePath = path.resolve(args[++i]);
        break;
      case '--target':
      case '-t':
        config.targetPath = path.resolve(args[++i]);
        break;
      case '--ignore':
      case '-i':
        config.ignorePatterns.push(args[++i]);
        break;
      case '--include':
        config.includePatterns.push(args[++i]);
        break;
      case '--validate':
        config.validate = true;
        break;
      case '--output':
      case '-o':
        config.output = args[++i];
        break;
    }
  }

  return config;
}

async function scanDirectory(dirPath, ignorePatterns = [], includePatterns = []) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      // Ignore-Patterns prüfen
      if (shouldIgnore(relativePath, ignorePatterns)) {
        continue;
      }
      
      // Include-Patterns prüfen
      if (includePatterns.length > 0 && !shouldInclude(relativePath, includePatterns)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, ignorePatterns, includePatterns);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, 'utf8');
          const hash = crypto.createHash('sha256').update(content).digest('hex');
          
          files.push({
            path: relativePath,
            hash,
            size: stats.size,
            lastModified: stats.mtime,
            content
          });
        } catch (error) {
          console.warn(`⚠️ Konnte Datei nicht lesen: ${fullPath}`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Konnte Verzeichnis nicht lesen: ${dirPath}`);
  }
  
  return files;
}

function shouldIgnore(filePath, ignorePatterns) {
  return ignorePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    } else {
      return filePath === pattern || filePath.startsWith(pattern + '/');
    }
  });
}

function shouldInclude(filePath, includePatterns) {
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

function calculateDiff(sourceFiles, targetFiles) {
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

async function createUpdatePackage(version, description, diff, sourcePath) {
  const files = [];
  
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
  
  const packageContent = {
    version,
    description,
    files,
    timestamp: new Date().toISOString()
  };
  
  const checksum = crypto.createHash('sha256').update(JSON.stringify(packageContent)).digest('hex');
  
  return {
    ...packageContent,
    checksum
  };
}

async function validateUpdatePackage(updatePackage) {
  // Grundlegende Validierung
  if (!updatePackage.version) {
    throw new Error('Update-Paket muss eine Version haben');
  }
  
  if (!updatePackage.files || !Array.isArray(updatePackage.files)) {
    throw new Error('Update-Paket muss ein files-Array haben');
  }
  
  // Datei-Validierung
  for (const file of updatePackage.files) {
    if (!file.path) {
      throw new Error('Jede Datei muss einen Pfad haben');
    }
    
    if (!['create', 'update', 'delete'].includes(file.action)) {
      throw new Error(`Ungültige Aktion: ${file.action}`);
    }
    
    if (file.action !== 'delete' && !file.content) {
      throw new Error(`Datei ${file.path} muss Inhalt haben`);
    }
  }
  
  // Checksum validieren
  const { checksum, ...packageWithoutChecksum } = updatePackage;
  const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(packageWithoutChecksum)).digest('hex');
  
  if (checksum !== calculatedChecksum) {
    throw new Error('Checksum stimmt nicht überein');
  }
}

function showHelp() {
  console.log(`
Update-Paket Generator CLI Tool

Verwendung:
  node tools/generate-update.js [Optionen]

Optionen:
  -v, --version <version>        Version des Updates (Standard: 1.0.0)
  -d, --description <text>       Beschreibung des Updates
  -s, --source <pfad>           Source-Verzeichnis (Standard: aktuelles Verzeichnis)
  -t, --target <pfad>           Target-Verzeichnis (Standard: aktuelles Verzeichnis)
  -i, --ignore <pattern>        Ignore-Pattern hinzufügen
  --include <pattern>           Include-Pattern hinzufügen
  --validate                    Update-Paket nach Generierung validieren
  -o, --output <pfad>           Ausgabedatei (Standard: update-<version>.json)
  -h, --help                    Diese Hilfe anzeigen

Beispiele:
  # Einfaches Update-Paket generieren
  node tools/generate-update.js -v 1.2.0 -d "Bugfixes und Verbesserungen"

  # Update-Paket mit benutzerdefinierten Verzeichnissen
  node tools/generate-update.js -s ./src -t ./dist -v 1.3.0

  # Update-Paket mit zusätzlichen Ignore-Patterns
  node tools/generate-update.js -i "*.tmp" -i "temp/**" -v 1.4.0
`);
}

// CLI starten
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  scanDirectory,
  calculateDiff,
  createUpdatePackage,
  validateUpdatePackage
};
