# 🚀 GitHub Update System Setup

## 📋 Checkliste für automatisches Update-System

### **Phase 1: GitHub Setup** ✅

#### 1.1 GitHub Personal Access Token erstellen
- [ ] GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
- [ ] "Generate new token (classic)" klicken
- [ ] **Token Name:** `gastro-cms-updates`
- [ ] **Expiration:** `No expiration` (oder 1 Jahr)
- [ ] **Scopes auswählen:**
  - [x] `repo` (Full control of private repositories)
  - [x] `read:org` (Read org and team membership)
- [ ] Token generieren und **SOFORT KOPIEREN** (nur einmal sichtbar!)

#### 1.2 Repository Webhook konfigurieren
- [ ] Repository: `https://github.com/Vindobify/gastro-cms`
- [ ] Settings → Webhooks → "Add webhook"
- [ ] **Payload URL:** `https://huefe.pro/api/updates/webhook`
- [ ] **Content type:** `application/json`
- [ ] **Events:** Nur `Push` events auswählen
- [ ] **Active:** ✅ aktiviert
- [ ] Webhook erstellen

#### 1.3 GitHub Actions (Optional - für automatische Releases)
- [ ] `.github/workflows/auto-release.yml` erstellen
- [ ] Automatische Release-Erstellung bei Tags
- [ ] Changelog-Generierung

### **Phase 2: Server Konfiguration** ✅

#### 2.1 Environment Variables
- [ ] `.env` erweitern um:
  ```bash
  # GitHub Update System
  GITHUB_TOKEN=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
  GITHUB_REPO=Vindobify/gastro-cms
  UPDATE_WEBHOOK_SECRET=your-secret-key-here
  ```

#### 2.2 Backup System
- [ ] Automatisches Backup vor jedem Update
- [ ] Database Backup in `/var/backups/gastro-cms/`
- [ ] File Backup in `/var/backups/gastro-cms/files/`

#### 2.3 Update Directory
- [ ] Update-Verzeichnis erstellen: `/var/www/da-corrado-updates/`
- [ ] Berechtigungen setzen: `chmod 755 /var/www/da-corrado-updates/`

### **Phase 3: API Implementation** ✅

#### 3.1 Update Check API
- [ ] `GET /api/updates/check` - Prüft verfügbare Updates
- [ ] GitHub API Integration
- [ ] Version Comparison
- [ ] Changelog Fetching

#### 3.2 Update Installation API
- [ ] `POST /api/updates/install` - Führt Update aus
- [ ] Safe File Download
- [ ] Database Migration
- [ ] Rollback bei Fehlern

#### 3.3 Webhook Handler
- [ ] `POST /api/updates/webhook` - GitHub Webhook
- [ ] Signature Verification
- [ ] Update Notification

### **Phase 4: Frontend Integration** ✅

#### 4.1 Dashboard Update Badge
- [ ] Update Badge im Hauptmenü
- [ ] Rote Anzeige bei verfügbaren Updates
- [ ] Update Counter

#### 4.2 Update Modal
- [ ] Update Modal mit Changelog
- [ ] "Update Now" Button
- [ ] Progress Bar
- [ ] Success/Error Messages

#### 4.3 Update History
- [ ] Update History Seite
- [ ] Rollback Option
- [ ] Update Logs

### **Phase 5: Sicherheitsmaßnahmen** ✅

#### 5.1 Datenbank-Schutz
- [ ] **NIEMALS Datenbank löschen**
- [ ] Automatisches Backup vor Migration
- [ ] Migration Rollback bei Fehlern
- [ ] **.env Datei NIEMALS ändern**

#### 5.2 Update-Sicherheit
- [ ] File Integrity Checks (SHA-256)
- [ ] Version Validation
- [ ] Dry-Run Mode
- [ ] Multi-Domain Support

#### 5.3 Rollback System
- [ ] Automatischer Rollback bei Fehlern
- [ ] Manueller Rollback über Dashboard
- [ ] Backup-Wiederherstellung

### **Phase 6: Testing** ✅

#### 6.1 Test Updates
- [ ] Test-Update auf Staging-Server
- [ ] Rollback-Test
- [ ] Multi-Domain Test

#### 6.2 Production Deployment
- [ ] Update-System auf huefe.pro aktivieren
- [ ] Webhook-Test
- [ ] Update-Test mit kleinem Update

## 🔧 **Technische Details**

### **GitHub API Endpoints**
```bash
# Latest Release
GET https://api.github.com/repos/Vindobify/gastro-cms/releases/latest

# All Releases
GET https://api.github.com/repos/Vindobify/gastro-cms/releases

# Repository Info
GET https://api.github.com/repos/Vindobify/gastro-cms
```

### **Update Flow**
1. **GitHub Push** → Webhook → Server
2. **Update Check** → API → Dashboard Badge
3. **User Clicks Update** → Download → Backup → Install → Migrate
4. **Success** → Restart PM2 → Notification
5. **Error** → Rollback → Error Notification

### **Sicherheits-Garantien**
- ✅ **Datenbank wird NIEMALS gelöscht**
- ✅ **.env bleibt unverändert**
- ✅ **Automatisches Backup vor jedem Update**
- ✅ **Rollback bei Fehlern**
- ✅ **Multi-Domain Support**

## 📝 **Nächste Schritte**

1. **GitHub Token erstellen** (siehe Phase 1.1)
2. **Webhook konfigurieren** (siehe Phase 1.2)
3. **Environment Variables setzen** (siehe Phase 2.1)
4. **API Implementation** (siehe Phase 3)
5. **Frontend Integration** (siehe Phase 4)
6. **Testing** (siehe Phase 6)

---

**⚠️ WICHTIG:** Alle Updates werden sicher durchgeführt mit automatischem Backup und Rollback-Möglichkeit!
