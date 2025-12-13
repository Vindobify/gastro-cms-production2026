# File-based Update System

Das neue Update-System ermöglicht es, nur geänderte Dateien auf den Server zu laden und Updates automatisch zu verteilen.

## 🚀 Features

- **Nur geänderte Dateien** werden übertragen
- **Automatische Verteilung** an mehrere Server
- **Backup-System** vor jedem Update
- **Rollback-Funktionalität** bei Fehlern
- **Dashboard-Interface** für einfache Verwaltung
- **CLI-Tool** für Entwickler
- **API-basiert** für Integration

## 📁 System-Architektur

```
src/app/api/updates/
├── upload/route.ts          # Update-Paket hochladen
├── diff/route.ts            # File-Diff berechnen
├── generate-package/route.ts # Update-Paket generieren
├── distribute/route.ts      # Update verteilen
├── targets/route.ts         # Verteilungstargets verwalten
└── logs/route.ts            # Update-Logs verwalten

tools/
└── generate-update.js       # CLI-Tool für Update-Generierung

data/
├── distribution-targets.json # Server-Konfiguration
└── update-logs.json         # Update-Historie
```

## 🛠️ Verwendung

### 1. Update-Paket generieren

#### Mit CLI-Tool:
```bash
# Einfaches Update
node tools/generate-update.js -v 1.2.0 -d "Bugfixes und Verbesserungen"

# Mit benutzerdefinierten Verzeichnissen
node tools/generate-update.js -s ./src -t ./dist -v 1.3.0

# Mit zusätzlichen Ignore-Patterns
node tools/generate-update.js -i "*.tmp" -i "temp/**" -v 1.4.0
```

#### Mit Deploy-Script:
```bash
# Update generieren und direkt deployen
./deploy-update.sh 1.2.0 "Bugfixes und Verbesserungen" https://gastro-cms.at

# Mit API-Key
./deploy-update.sh 1.2.0 "Neue Features" https://gastro-cms.at abc123def456
```

### 2. Update über Dashboard

1. Gehen Sie zu `/dashboard/updates-new`
2. Klicken Sie auf "Update-Paket generieren"
3. Laden Sie das generierte Paket hoch
4. Wählen Sie Verteilungstargets aus
5. Klicken Sie auf "Update verteilen"

### 3. API-Integration

#### Update-Paket hochladen:
```bash
curl -X POST "https://gastro-cms.at/api/updates/upload" \
  -F "update=@update-1.2.0.json" \
  -F "version=1.2.0" \
  -F "description=Bugfixes"
```

#### Update verteilen:
```bash
curl -X POST "https://gastro-cms.at/api/updates/distribute" \
  -H "Content-Type: application/json" \
  -d '{
    "updatePackage": {...},
    "targetIds": ["production"]
  }'
```

## ⚙️ Konfiguration

### Verteilungstargets

Bearbeiten Sie `data/distribution-targets.json`:

```json
[
  {
    "id": "production",
    "name": "Production Server",
    "url": "https://gastro-cms.at",
    "apiKey": "your-api-key",
    "status": "active"
  },
  {
    "id": "staging",
    "name": "Staging Server",
    "url": "https://staging.gastro-cms.at",
    "apiKey": "staging-api-key",
    "status": "active"
  }
]
```

### Ignore-Patterns

Standardmäßig werden folgende Dateien/Verzeichnisse ignoriert:

- `node_modules/**`
- `.next/**`
- `.git/**`
- `*.log`
- `.env*`
- `data/**`
- `backups/**`
- `*.db`
- `*.sqlite*`
- `coverage/**`
- `dist/**`
- `build/**`

### Include-Patterns

Standardmäßig werden folgende Dateien/Verzeichnisse eingeschlossen:

- `src/**`
- `prisma/**`
- `public/**`
- `package.json`
- `package-lock.json`
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `postcss.config.js`
- `eslint.config.mjs`

## 🔒 Sicherheit

- **API-Key-Authentifizierung** für alle Endpunkte
- **Checksum-Validierung** für Update-Pakete
- **Backup vor Update** mit Rollback-Möglichkeit
- **Audit-Logging** aller Update-Operationen

## 📊 Monitoring

### Update-Logs anzeigen:
```bash
curl "https://gastro-cms.at/api/updates/logs?limit=10"
```

### Server-Status prüfen:
```bash
curl "https://gastro-cms.at/api/health"
```

### Verteilungstargets verwalten:
```bash
# Alle Targets anzeigen
curl "https://gastro-cms.at/api/updates/targets"

# Neues Target hinzufügen
curl -X POST "https://gastro-cms.at/api/updates/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Server",
    "url": "https://new-server.com",
    "apiKey": "api-key"
  }'
```

## 🚨 Fehlerbehebung

### Update fehlgeschlagen

1. **Backup wiederherstellen:**
   ```bash
   pm2 restart gastro-cms --rollback /var/backups/gastro-cms/backup-1.2.0-2024-01-01T12-00-00
   ```

2. **Logs prüfen:**
   ```bash
   pm2 logs gastro-cms
   tail -f /var/log/gastro-cms/updates.log
   ```

3. **Manueller Rollback:**
   ```bash
   cd /var/www/gastro-cms
   git checkout HEAD~1
   npm install
   pm2 restart gastro-cms
   ```

### Verteilung fehlgeschlagen

1. **Target-Status prüfen:**
   ```bash
   curl "https://gastro-cms.at/api/updates/targets"
   ```

2. **API-Key validieren:**
   ```bash
   curl -H "Authorization: Bearer your-api-key" "https://target-server.com/api/health"
   ```

3. **Manuell verteilen:**
   ```bash
   ./deploy-update.sh 1.2.0 "Manual Update" https://target-server.com your-api-key
   ```

## 🔄 Workflow

### Entwickler-Workflow:

1. **Code ändern** und testen
2. **Update-Paket generieren:**
   ```bash
   node tools/generate-update.js -v 1.2.0 -d "Feature X"
   ```
3. **Update deployen:**
   ```bash
   ./deploy-update.sh 1.2.0 "Feature X" https://gastro-cms.at
   ```

### Server-Administrator-Workflow:

1. **Dashboard öffnen** (`/dashboard/updates-new`)
2. **Update-Paket hochladen** oder generieren
3. **Verteilungstargets auswählen**
4. **Update verteilen**
5. **Status überwachen**

## 📈 Vorteile gegenüber GitHub-System

- ✅ **Nur geänderte Dateien** werden übertragen
- ✅ **Keine GitHub-Abhängigkeit**
- ✅ **Schnellere Updates** (weniger Daten)
- ✅ **Bessere Kontrolle** über Update-Prozess
- ✅ **Multi-Server-Verteilung**
- ✅ **Einfache Integration** in bestehende Workflows
- ✅ **Rollback-Funktionalität**
- ✅ **Audit-Logging**

## 🎯 Nächste Schritte

1. **Verteilungstargets konfigurieren**
2. **API-Keys für alle Server einrichten**
3. **Update-System testen** mit kleineren Updates
4. **Monitoring einrichten** für Update-Status
5. **Dokumentation** für Team aktualisieren
