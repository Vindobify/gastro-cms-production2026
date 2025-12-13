# 🍽️ Gastro CMS 3.0 - Multi-Tenant Restaurant Management System

## 📋 Übersicht

Gastro CMS 3.0 ist ein vollständiges Multi-Tenant-System für Restaurant-Management mit drei Hauptkomponenten:

- **gastro-cms-root**: Landing Page und öffentliche Website
- **gastro-crm**: CRM-System für Restaurant-Verwaltung
- **gastro-cms-multi**: Multi-Tenant Anwendung für individuelle Restaurant-Websites

## 🏗️ System-Architektur

```
┌─────────────────┐
│  Landing Page   │  https://www.gastro-cms.at
│ gastro-cms-root │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌─────▼──────┐
│   CRM System    │  │ Multi-Tenant│
│   gastro-crm    │  │ gastro-cms │
│                 │  │   -multi   │
│ crm.gastro-cms  │  │  *.domains │
└────────┬────────┘  └─────┬──────┘
         │                 │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │    Database     │
         └─────────────────┘
```

## 🚀 Quick Start

### Lokale Entwicklung

```bash
# Repository klonen
git clone <repository-url>
cd lieferservice

# Docker Compose starten
docker-compose -f docker-compose.local.yml up -d

# Domains in /etc/hosts eintragen:
# 127.0.0.1 gastro-cms.local
# 127.0.0.1 crm.gastro.local
# 127.0.0.1 pizzeria1140.local
```

### Production mit Docker Compose (ohne Coolify)

```bash
# Environment-Variablen vorbereiten
cp docker-compose.production.env.example .env
# .env Datei bearbeiten und echte Werte eintragen

# Services starten
docker-compose -f docker-compose.production.yml up -d

# Logs ansehen
docker-compose -f docker-compose.production.yml logs -f
```

### Production Deployment

**Für Coolify**: Siehe **[COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)** für vollständige Anleitung.

**WICHTIG**: Coolify verwendet **KEINE** `docker-compose.yml` Dateien! Coolify erstellt Container direkt aus den Dockerfiles.

**Für Docker Compose (ohne Coolify)**: Siehe **[DEPLOYMENT_FAQ.md](./DEPLOYMENT_FAQ.md)** für Details.

**Häufige Fragen**: Siehe **[DEPLOYMENT_FAQ.md](./DEPLOYMENT_FAQ.md)**

## 📁 Projekt-Struktur

```
lieferservice/
├── gastro-cms-root/      # Landing Page
├── gastro-crm/          # CRM-System
├── gastro-cms-multi/    # Multi-Tenant Anwendung
├── proxy/               # Nginx Proxy (nur lokal)
├── docker-compose.local.yml          # Lokale Entwicklung
├── docker-compose.production.yml     # Production (optional, nicht für Coolify)
├── docker-compose.production.env.example
├── COOLIFY_DEPLOYMENT.md
├── PRODUCTION_ENV.md
└── README.md
```

## 🔧 Technologie-Stack

- **Framework**: Next.js 15/16
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (jose)
- **Payments**: Stripe Connect
- **Email**: Brevo (SMTP)
- **Deployment**: Coolify / Docker

## 📚 Dokumentation

### Deployment

- **[COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)**: Vollständige Coolify-Deployment-Anleitung
- **[PRODUCTION_ENV.md](./PRODUCTION_ENV.md)**: Production Environment-Variablen

### Entwicklung

- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)**: Environment-Variablen Übersicht
- **[ENV_SETUP_ANLEITUNG.md](./ENV_SETUP_ANLEITUNG.md)**: Setup-Anleitung für Environment-Variablen
- **[STRIPE_CONFIG_ERKLAERUNG.md](./STRIPE_CONFIG_ERKLAERUNG.md)**: Stripe-Konfiguration

## 🔐 Sicherheit

- ✅ Alle Secrets werden über Environment-Variablen verwaltet
- ✅ Keine Secrets in Git committed
- ✅ JWT-basierte Authentifizierung
- ✅ HTTPS/SSL für alle Domains
- ✅ Sichere Datenbank-Credentials

## 🗄️ Datenbank

Alle drei Anwendungen teilen sich eine PostgreSQL-Datenbank:

- **Schema**: `public`
- **Multi-Tenancy**: Über `Tenant` Model
- **Migrations**: Prisma Migrate

## 🌐 Domains

### Production

- **Landing Page**: `https://www.gastro-cms.at`
- **CRM**: `https://crm.gastro-cms.at`
- **Multi-Tenant**: `*.gastro-cms.at` (Wildcard) oder individuelle Domains

### Lokal

- **Landing Page**: `http://gastro-cms.local`
- **CRM**: `http://crm.gastro.local`
- **Multi-Tenant**: `http://pizzeria1140.local` (Beispiel)

## 📦 Deployment

### Voraussetzungen

1. GitHub Repository
2. Coolify Installation
3. PostgreSQL Datenbank
4. Domain-Konfiguration

### Schritte

1. Repository auf GitHub pushen
2. In Coolify drei Anwendungen erstellen
3. Environment-Variablen setzen (siehe [PRODUCTION_ENV.md](./PRODUCTION_ENV.md))
4. Domains konfigurieren
5. Deployen

**Detaillierte Anleitung**: [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)

## 🧪 Testing

### Lokal

```bash
# Alle Services starten
docker-compose -f docker-compose.local.yml up -d

# Logs ansehen
docker-compose -f docker-compose.local.yml logs -f

# Services stoppen
docker-compose -f docker-compose.local.yml down
```

### Production

- Landing Page: `https://www.gastro-cms.at`
- CRM: `https://crm.gastro-cms.at`
- Multi-Tenant: Restaurant-Domains

## 🐛 Troubleshooting

### Häufige Probleme

1. **Datenbank-Verbindung fehlgeschlagen**
   - Prüfe `DATABASE_URL` Format
   - Prüfe Firewall/Netzwerk

2. **500 Internal Server Error**
   - Prüfe Application-Logs
   - Prüfe Environment-Variablen
   - Prüfe JWT_SECRET (für multi und crm)

3. **Domain nicht erreichbar**
   - Prüfe DNS-Einträge
   - Prüfe SSL-Zertifikat
   - Prüfe Domain-Konfiguration

Siehe [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) für detaillierte Troubleshooting-Anleitung.

## 📝 License

Proprietär - Alle Rechte vorbehalten

## 👥 Support

Bei Fragen oder Problemen:
1. Prüfe Dokumentation
2. Prüfe Logs
3. Kontaktiere Support

---

**Version**: 3.0
**Letzte Aktualisierung**: 2025-01-12

