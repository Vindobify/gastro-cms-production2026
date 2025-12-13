# 🍕 Gastro-CMS - Restaurant Management System

Ein vollständiges Restaurant-Management-System für Speisekarten, Bestellungen und Kundenverwaltung mit SQLite-Datenbank und Docker-Deployment.

## 🚀 Features

- 📱 **Responsive Dashboard** - Verwaltung von Produkten, Kategorien, Bestellungen
- 🍽️ **Speisekarten-Management** - Dynamische Menü-Erstellung mit Extras
- 📊 **Bestellverwaltung** - Realtime-Updates und Status-Tracking
- 👥 **Kundenverwaltung** - Vollständige Kundendatenbank
- 🎯 **Marketing-Tools** - Gutscheine, QR-Codes, Slideshow
- 🔐 **Sicher** - JWT-Auth, CSRF-Schutz, Rate-Limiting
- 🐳 **Docker-Ready** - Einfaches Production-Deployment

## 🛠️ Installation & Deployment

### Voraussetzungen
- Docker & Docker Compose
- Git

### 🚀 Dokploy Deployment (Empfohlen)

#### 1. Repository in Dokploy einrichten
- **Repository URL:** `https://github.com/Vindobify/gastro-cms.git`
- **Build Type:** Docker Compose
- **Auto-Deploy:** Aktivieren

#### 2. Umgebungsvariablen in Dokploy setzen
Gehen Sie zu **Environment Variables** und fügen Sie hinzu:
\`\`\`bash
# WICHTIG: Generieren Sie neue sichere Schlüssel!
JWT_SECRET=IHR_SICHERER_64_ZEICHEN_SCHLUESSEL
NEXTAUTH_SECRET=IHR_SICHERER_64_ZEICHEN_SCHLUESSEL  
CSRF_SECRET=IHR_SICHERER_32_ZEICHEN_SCHLUESSEL

# Domain-Konfiguration für gastro-cms.at
NEXTAUTH_URL=https://gastro-cms.at
INTERNAL_API_URL=https://gastro-cms.at
ALLOWED_ORIGINS=https://gastro-cms.at,https://www.gastro-cms.at
\`\`\`

#### 3. Sichere Schlüssel generieren
\`\`\`bash
# Auf Ihrem lokalen System ausführen:
openssl rand -base64 64  # Kopieren für JWT_SECRET
openssl rand -base64 64  # Kopieren für NEXTAUTH_SECRET  
openssl rand -base64 32  # Kopieren für CSRF_SECRET
\`\`\`

### 🐳 Lokales Docker Deployment

#### 1. Repository klonen
\`\`\`bash
git clone https://github.com/Vindobify/gastro-cms.git
cd gastro-cms
\`\`\`

#### 2. Umgebungsvariablen konfigurieren
\`\`\`bash
# Sichere Schlüssel generieren
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 64)"
echo "CSRF_SECRET=$(openssl rand -base64 32)"

# ENV-Variablen als Datei setzen oder direkt in docker-compose
\`\`\`

### 3. Produktion starten
\`\`\`bash
# Docker Image bauen
./docker-scripts.sh build

# Produktions-Environment starten (mit Auto-DB-Init)
./docker-scripts.sh start

# Logs anzeigen
./docker-scripts.sh logs
\`\`\`

### 4. Zugriff
- **Dashboard:** http://localhost:3001/dashboard/login
- **Admin-Login:** office@gastro-cms.at / ComPaq1987!

## 📋 Docker-Befehle

\`\`\`bash
./docker-scripts.sh build     # Image bauen
./docker-scripts.sh start     # Produktion starten
./docker-scripts.sh stop      # Produktion stoppen
./docker-scripts.sh restart   # Neustart
./docker-scripts.sh logs      # Logs anzeigen
./docker-scripts.sh backup    # Datenbank-Backup
./docker-scripts.sh restore   # Datenbank wiederherstellen
\`\`\`

## 🔧 Konfiguration

### Wichtige ENV-Variablen:
- \`NEXTAUTH_URL=https://gastro-cms.at\` - Produktions-Domain
- \`ALLOWED_ORIGINS=https://gastro-cms.at,https://www.gastro-cms.at\` - Erlaubte Origins für CORS
- \`JWT_SECRET\` - Sicherer JWT-Schlüssel (64 Zeichen)
- \`NEXTAUTH_SECRET\` - NextAuth-Schlüssel (64 Zeichen)
- \`CSRF_SECRET\` - CSRF-Schutz-Schlüssel (32 Zeichen)

### Datenbank-Backup:
\`\`\`bash
# Automatisches Backup erstellen
./docker-scripts.sh backup

# Backup wiederherstellen
./docker-scripts.sh restore backup_20241207_120000.db
\`\`\`

## 🏗️ Entwicklung

\`\`\`bash
# Entwicklungsserver
npm install
npm run dev

# Datenbank-Tools
npm run db:push    # Schema zu DB pushen
npm run db:seed    # Testdaten laden
\`\`\`

## 📁 Projektstruktur

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── api/            # API-Routen
│   ├── dashboard/      # Admin-Dashboard
│   └── frontend/       # Kunden-Frontend
├── components/         # React-Komponenten
├── contexts/          # React-Contexts
└── lib/               # Utilities & Libraries

prisma/
├── schema.prisma      # Datenbank-Schema
├── seed.ts           # Seed-Daten
└── *.db              # SQLite-Datenbanken
\`\`\`

## 🔐 Sicherheit

- **JWT-Authentifizierung** mit HttpOnly-Cookies
- **CSRF-Schutz** für alle Formulare
- **Rate-Limiting** für API-Endpunkte
- **Input-Sanitization** für alle Eingaben
- **Sichere Headers** (CSP, HSTS, etc.)

## 🚢 Production Deployment

### Server-Requirements:
- Ubuntu/Debian Server
- Docker & Docker Compose
- Reverse Proxy (nginx/Traefik)
- SSL-Zertifikat

### Deployment-Schritte:
1. Repository auf Server klonen
2. \`.env.production\` konfigurieren
3. \`./docker-scripts.sh build\`
4. \`./docker-scripts.sh start\`
5. Reverse Proxy konfigurieren

## 📞 Support

Bei Fragen oder Problemen erstellen Sie ein Issue im Repository.

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

---

**Entwickelt für Restaurants 🍕 | Powered by Next.js & Docker 🐳**
