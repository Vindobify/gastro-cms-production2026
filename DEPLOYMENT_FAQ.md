# ❓ Deployment FAQ - Häufige Fragen

## 🤔 Wird die Datenbank automatisch erstellt?

### Szenario 1: Docker Compose (OHNE Coolify)

**JA!** Wenn du `docker-compose.production.yml` verwendest, wird die PostgreSQL-Datenbank automatisch erstellt:

```bash
docker-compose -f docker-compose.production.yml up -d
```

Die Datenbank wird als Docker-Container erstellt und läuft zusammen mit den Anwendungen.

### Szenario 2: Coolify

**NEIN!** Coolify verwendet **KEINE** `docker-compose.yml` Dateien!

In Coolify musst du die Datenbank **separat erstellen**:

1. **Coolify Dashboard** → **Resources** → **PostgreSQL**
2. Neue Datenbank erstellen:
   - Name: `gastro_cms_multi`
   - Version: `15`
   - Username/Password: Wähle sichere Credentials
3. Notiere die **Connection String** für die Environment-Variablen

---

## 🚀 Wie deploye ich in Coolify?

### WICHTIG: Coolify verwendet KEINE docker-compose.yml!

Coolify erstellt Container **direkt aus den Dockerfiles**. Du musst:

### Schritt 1: GitHub Repository vorbereiten

```bash
# Projekt auf GitHub pushen
git add .
git commit -m "Production ready"
git push origin main
```

### Schritt 2: In Coolify drei Anwendungen erstellen

Für **jede** Anwendung (`gastro-cms-root`, `gastro-crm`, `gastro-cms-multi`):

1. **Coolify** → **New Resource** → **Application**
2. **Source**: GitHub Repository auswählen
3. **Dockerfile Location**: 
   - `gastro-cms-root/Dockerfile` (für root)
   - `gastro-crm/Dockerfile` (für crm)
   - `gastro-cms-multi/Dockerfile` (für multi)
4. **Docker Build Context**: 
   - `gastro-cms-root/` (für root)
   - `gastro-crm/` (für crm)
   - `gastro-cms-multi/` (für multi)

### Schritt 3: Datenbank in Coolify erstellen

1. **Coolify** → **Resources** → **PostgreSQL**
2. Neue Datenbank erstellen
3. Connection String notieren

### Schritt 4: Environment-Variablen setzen

In jeder Anwendung in Coolify die Environment-Variablen setzen (siehe `PRODUCTION_ENV.md`).

### Schritt 5: Domains konfigurieren

- `gastro-cms-root` → `www.gastro-cms.at`
- `gastro-crm` → `crm.gastro-cms.at`
- `gastro-cms-multi` → Wildcard `*.gastro-cms.at` oder einzelne Domains

### Schritt 6: Deployen

Klicke auf **Deploy** in jeder Anwendung.

### Schritt 7: Migrationen ausführen

**WICHTIG**: Migrationen laufen **NICHT automatisch**!

1. Öffne **gastro-crm** in Coolify
2. **Terminal** → **Open Terminal**
3. Führe aus:
   ```bash
   npx prisma migrate deploy
   ```
   Oder:
   ```bash
   npx prisma db push
   ```

---

## 📋 Zusammenfassung: Coolify vs. Docker Compose

| Feature | Docker Compose | Coolify |
|---------|---------------|---------|
| **Datenbank** | Automatisch erstellt | Muss separat erstellt werden |
| **docker-compose.yml** | ✅ Wird verwendet | ❌ Wird NICHT verwendet |
| **Dockerfiles** | ✅ Wird verwendet | ✅ Wird verwendet |
| **Migrationen** | Manuell ausführen | Manuell ausführen |
| **Environment-Variablen** | In `.env` Datei | In Coolify UI |
| **Domains/SSL** | Manuell konfigurieren | Automatisch (Let's Encrypt) |

---

## 🔄 Automatische Migrationen?

**NEIN**, Migrationen laufen **nicht automatisch**!

Du musst sie **manuell ausführen**:

### Option 1: Über Coolify Terminal

1. Öffne die Anwendung in Coolify
2. **Terminal** → **Open Terminal**
3. Führe aus:
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Lokal (wenn Datenbank extern erreichbar)

```bash
cd gastro-crm
DATABASE_URL="postgresql://USER:PASS@HOST:5432/gastro_cms_multi?schema=public" npx prisma migrate deploy
```

### Option 3: Init-Script (kann hinzugefügt werden)

Du könntest ein Init-Script in den Dockerfiles hinzufügen, das Migrationen automatisch ausführt. **Aber**: Das ist nicht empfohlen, da es bei jedem Container-Start läuft.

---

## ✅ Checkliste für Coolify Deployment

- [ ] GitHub Repository gepusht
- [ ] PostgreSQL Datenbank in Coolify erstellt
- [ ] Drei Anwendungen in Coolify erstellt (root, crm, multi)
- [ ] Dockerfile Location korrekt gesetzt
- [ ] Docker Build Context korrekt gesetzt
- [ ] Environment-Variablen gesetzt (siehe `PRODUCTION_ENV.md`)
- [ ] Domains konfiguriert
- [ ] Alle drei Anwendungen deployed
- [ ] **Migrationen manuell ausgeführt** (wichtig!)
- [ ] Landing Page getestet
- [ ] CRM getestet
- [ ] Multi-Tenant getestet

---

## 🆘 Häufige Probleme

### Problem: "Datenbank nicht gefunden"

**Lösung**: 
- Prüfe ob Datenbank in Coolify erstellt wurde
- Prüfe `DATABASE_URL` Format
- Prüfe ob Datenbank erreichbar ist

### Problem: "Migrationen fehlgeschlagen"

**Lösung**:
```bash
# Im Coolify Terminal
npx prisma generate
npx prisma db push --accept-data-loss
```

### Problem: "Container startet nicht"

**Lösung**:
- Prüfe Dockerfile Location
- Prüfe Build Context
- Prüfe Build-Logs in Coolify
- Prüfe ob alle Environment-Variablen gesetzt sind

---

**Erstellt am**: 2025-01-12

