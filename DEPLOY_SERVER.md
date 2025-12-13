# 🚀 Manuelles Server-Deployment - Gastro CMS 3.0

## 📋 Übersicht

Dieses Dokument beschreibt das manuelle Deployment auf einem Server ohne Coolify.

## 🔧 Voraussetzungen

- Server mit Root-Zugriff
- SSH-Zugriff auf den Server
- Internet-Verbindung

## 📦 Schritt 1: SSH-Verbindung herstellen

```bash
ssh root@152.53.44.238
# Passwort: c24o7W4LqVJpIlk
```

## 🐳 Schritt 2: Docker installieren

Falls Docker noch nicht installiert ist:

```bash
# Updates
apt-get update

# Alte Docker-Versionen entfernen
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Dependencies installieren
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Docker GPG Key hinzufügen
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Docker Repository hinzufügen
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker installieren
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker Service starten
systemctl start docker
systemctl enable docker

# Prüfen
docker --version
docker compose version
```

## 📁 Schritt 3: Projekt klonen

```bash
# /var/www erstellen
mkdir -p /var/www
cd /var/www

# Repository klonen
git clone https://github.com/Vindobify/gastro-cms-production2026.git gastro-cms-production
cd gastro-cms-production
```

## 🔐 Schritt 4: Environment-Variablen einrichten

```bash
# .env Datei aus Template erstellen
cp docker-compose.production.env.example .env

# .env Datei bearbeiten
nano .env
```

**WICHTIG**: Trage alle echten Werte ein:
- `POSTGRES_USER` und `POSTGRES_PASSWORD` (starke Passwörter!)
- `JWT_SECRET` (mindestens 32 Zeichen, identisch für multi und crm!)
- `DATABASE_URL` (wird automatisch aus POSTGRES_USER/PASSWORD erstellt)
- Stripe LIVE Keys
- SMTP/Brevo Daten

Siehe `PRODUCTION_ENV.md` für Details.

## 🗄️ Schritt 5: Datenbank starten

```bash
# Nur Datenbank starten (für Migrationen)
docker compose -f docker-compose.production.yml up -d db

# Warte bis Datenbank bereit ist
sleep 10
```

## 🔨 Schritt 6: Images bauen

```bash
# Alle Images bauen
docker compose -f docker-compose.production.yml build
```

## 🚀 Schritt 7: Services starten

```bash
# Alle Services starten
docker compose -f docker-compose.production.yml up -d

# Status prüfen
docker compose -f docker-compose.production.yml ps
```

## 🗄️ Schritt 8: Datenbank-Migrationen ausführen

```bash
# Migrationen ausführen
docker compose -f docker-compose.production.yml exec crm npx prisma migrate deploy

# Oder falls migrate deploy nicht verfügbar:
docker compose -f docker-compose.production.yml exec crm npx prisma db push
```

## 🌐 Schritt 9: Nginx/Apache konfigurieren

### Nginx Beispiel-Konfiguration

Erstelle `/etc/nginx/sites-available/gastro-cms`:

```nginx
# Landing Page
server {
    listen 80;
    server_name www.gastro-cms.at gastro-cms.at;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# CRM
server {
    listen 80;
    server_name crm.gastro-cms.at;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Multi-Tenant (Wildcard)
server {
    listen 80;
    server_name *.gastro-cms.at;
    
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**WICHTIG**: Die Ports müssen in `docker-compose.production.yml` angepasst werden!

### Nginx aktivieren

```bash
# Symlink erstellen
ln -s /etc/nginx/sites-available/gastro-cms /etc/nginx/sites-enabled/

# Nginx testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

## 🔒 Schritt 10: SSL-Zertifikate (Let's Encrypt)

```bash
# Certbot installieren
apt-get install -y certbot python3-certbot-nginx

# SSL-Zertifikate erstellen
certbot --nginx -d www.gastro-cms.at -d gastro-cms.at
certbot --nginx -d crm.gastro-cms.at
certbot --nginx -d *.gastro-cms.at  # Wildcard benötigt DNS-Challenge
```

## 📊 Schritt 11: Monitoring

### Logs ansehen

```bash
# Alle Logs
docker compose -f docker-compose.production.yml logs -f

# Spezifischer Service
docker compose -f docker-compose.production.yml logs -f crm
docker compose -f docker-compose.production.yml logs -f multi
docker compose -f docker-compose.production.yml logs -f root
```

### Status prüfen

```bash
# Container-Status
docker compose -f docker-compose.production.yml ps

# Ressourcen-Verbrauch
docker stats
```

## 🔄 Updates deployen

```bash
cd /var/www/gastro-cms-production

# Änderungen pullen
git pull origin main

# Images neu bauen
docker compose -f docker-compose.production.yml build

# Services neu starten
docker compose -f docker-compose.production.yml up -d

# Migrationen ausführen (falls nötig)
docker compose -f docker-compose.production.yml exec crm npx prisma migrate deploy
```

## 🛠️ Wartung

### Services neu starten

```bash
# Alle Services
docker compose -f docker-compose.production.yml restart

# Einzelner Service
docker compose -f docker-compose.production.yml restart crm
```

### Services stoppen

```bash
docker compose -f docker-compose.production.yml down
```

### Services starten

```bash
docker compose -f docker-compose.production.yml up -d
```

## 🆘 Troubleshooting

### Problem: Container startet nicht

```bash
# Logs prüfen
docker compose -f docker-compose.production.yml logs [service-name]

# Container-Status
docker compose -f docker-compose.production.yml ps
```

### Problem: Datenbank-Verbindung fehlgeschlagen

```bash
# Datenbank-Container prüfen
docker compose -f docker-compose.production.yml ps db

# Datenbank-Logs
docker compose -f docker-compose.production.yml logs db

# DATABASE_URL prüfen
docker compose -f docker-compose.production.yml exec crm env | grep DATABASE_URL
```

### Problem: Port bereits belegt

```bash
# Ports prüfen
netstat -tulpn | grep :3000

# Ports in docker-compose.production.yml anpassen
nano docker-compose.production.yml
```

## 📝 Wichtige Dateien

- `/var/www/gastro-cms-production/.env` - Environment-Variablen
- `/var/www/gastro-cms-production/docker-compose.production.yml` - Docker Compose Konfiguration
- `/etc/nginx/sites-available/gastro-cms` - Nginx Konfiguration

## ✅ Checkliste

- [ ] Docker installiert
- [ ] Docker Compose installiert
- [ ] Repository geklont
- [ ] .env Datei erstellt und konfiguriert
- [ ] Images gebaut
- [ ] Services gestartet
- [ ] Migrationen ausgeführt
- [ ] Nginx/Apache konfiguriert
- [ ] SSL-Zertifikate installiert
- [ ] Domains getestet

---

**Erstellt am**: 2025-01-12

