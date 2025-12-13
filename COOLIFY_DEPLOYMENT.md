# 🚀 Coolify Deployment-Anleitung - Gastro CMS 3.0

## 📋 Übersicht

Diese Anleitung beschreibt den vollständigen Deployment-Prozess für alle drei Anwendungen des Gastro CMS 3.0 Systems über Coolify.

## 🏗️ System-Architektur

- **gastro-cms-root**: Landing Page (`https://www.gastro-cms.at`)
- **gastro-crm**: CRM-System (`https://crm.gastro-cms.at`)
- **gastro-cms-multi**: Multi-Tenant Anwendung (dynamische Domains)

## 📦 Voraussetzungen

1. **GitHub Repository**: Alle drei Anwendungen müssen in einem Repository sein
2. **Coolify Installation**: Coolify muss installiert und konfiguriert sein
3. **PostgreSQL Datenbank**: Externe PostgreSQL-Datenbank (z.B. Coolify Managed Database)
4. **Domain-Konfiguration**: Domains müssen auf den Coolify-Server zeigen

## ⚠️ Wichtiger Hinweis zu Docker Compose

**Coolify verwendet KEINE `docker-compose.yml` Dateien!**

Coolify erstellt Container direkt aus den `Dockerfile` Dateien. Die `docker-compose.production.yml` Datei ist nur für den Fall, dass du Docker Compose auf einem eigenen Server ohne Coolify verwenden möchtest.

Falls du Docker Compose für Production verwendest:
- Verwende `docker-compose.production.yml`
- Kopiere `docker-compose.production.env.example` zu `.env` und trage deine Werte ein
- Siehe `docker-compose.production.yml` für Details

## 🔧 Schritt 1: GitHub Repository vorbereiten

### Repository-Struktur

```
lieferservice/
├── gastro-cms-root/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
├── gastro-crm/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
├── gastro-cms-multi/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
└── README.md
```

### Wichtige Dateien für Git

Stelle sicher, dass folgende Dateien **NICHT** committed werden:
- `.env*` (alle Environment-Dateien)
- `node_modules/`
- `.next/`
- `*.log`

Die `.gitignore` Dateien sind bereits konfiguriert.

## 🗄️ Schritt 2: PostgreSQL Datenbank einrichten

### Option A: Coolify Managed Database

1. In Coolify: **Resources** → **PostgreSQL**
2. Neue Datenbank erstellen:
   - **Name**: `gastro_cms_multi`
   - **Version**: `15` (empfohlen)
   - **Username**: Wähle einen sicheren Benutzernamen
   - **Password**: Generiere ein starkes Passwort
3. Notiere die **Connection String**:
   ```
   postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public
   ```

### Option B: Externe PostgreSQL-Datenbank

Falls du eine externe Datenbank verwendest, notiere die Connection String.

## 🚀 Schritt 3: Deployment in Coolify

### 3.1: gastro-cms-root (Landing Page)

#### Neue Anwendung erstellen

1. **Coolify Dashboard** → **New Resource** → **Application**
2. **Name**: `gastro-cms-root`
3. **Source**: **GitHub**
   - Repository auswählen
   - **Branch**: `main` (oder dein Standard-Branch)
   - **Dockerfile Location**: `gastro-cms-root/Dockerfile`
   - **Docker Build Context**: `gastro-cms-root/`

#### Ports konfigurieren

- **Port**: `3000` (intern)
- **Public Port**: Automatisch von Coolify verwaltet

#### Environment-Variablen setzen

In **Environment Variables** folgende Variablen hinzufügen:

```env
# Basis
NODE_ENV=production
PORT=3000

# Datenbank (aus Schritt 2)
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public

# SMTP/Brevo (E-Mail)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq
SMTP_FROM=office@gastro-cms.at

# CRM URL (für Formular-Weiterleitung)
CRM_API_URL=https://crm.gastro-cms.at
NEXT_PUBLIC_CRM_API_URL=https://crm.gastro-cms.at

# Stripe (falls verwendet - LIVE KEYS!)
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi

# Google Analytics (optional)
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Domain konfigurieren

1. **Domains** → **Add Domain**
2. **Domain**: `www.gastro-cms.at`
3. **SSL**: Automatisch von Coolify verwaltet (Let's Encrypt)

#### Deployment

1. **Deploy** klicken
2. Warte auf erfolgreichen Build und Start

---

### 3.2: gastro-crm (CRM-System)

#### Neue Anwendung erstellen

1. **Coolify Dashboard** → **New Resource** → **Application**
2. **Name**: `gastro-crm`
3. **Source**: **GitHub**
   - Repository auswählen
   - **Branch**: `main`
   - **Dockerfile Location**: `gastro-crm/Dockerfile`
   - **Docker Build Context**: `gastro-crm/`

#### Ports konfigurieren

- **Port**: `3000` (intern)

#### Environment-Variablen setzen

```env
# Basis
NODE_ENV=production
PORT=3000

# Datenbank (gleiche Datenbank wie root)
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public

# JWT Secret (MINDESTENS 32 Zeichen!)
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang-ERFORDERLICH

# NextAuth URL
NEXTAUTH_URL=https://crm.gastro-cms.at

# Stripe Connect (LIVE KEYS!)
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi
# STRIPE_CLIENT_ID=ca_... # Optional: Nur für erweiterte Connect OAuth Features

# App URL (für Stripe Connect Redirects)
NEXT_PUBLIC_APP_URL=https://crm.gastro-cms.at
```

#### Domain konfigurieren

1. **Domains** → **Add Domain**
2. **Domain**: `crm.gastro-cms.at`
3. **SSL**: Automatisch

#### Deployment

1. **Deploy** klicken
2. Warte auf erfolgreichen Build

---

### 3.3: gastro-cms-multi (Multi-Tenant)

#### Neue Anwendung erstellen

1. **Coolify Dashboard** → **New Resource** → **Application**
2. **Name**: `gastro-cms-multi`
3. **Source**: **GitHub**
   - Repository auswählen
   - **Branch**: `main`
   - **Dockerfile Location**: `gastro-cms-multi/Dockerfile`
   - **Docker Build Context**: `gastro-cms-multi/`

#### Ports konfigurieren

- **Port**: `3000` (intern)

#### Environment-Variablen setzen

```env
# Basis
NODE_ENV=production
PORT=3000

# Datenbank (gleiche Datenbank wie root und crm)
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public

# JWT Secret (ERFORDERLICH! MINDESTENS 32 Zeichen!)
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang-ERFORDERLICH

# NextAuth URL (wird dynamisch pro Tenant gesetzt, aber Fallback)
NEXTAUTH_URL=https://www.gastro-cms.at

# CRM URL (für Stripe Connect Weiterleitung)
CRM_URL=https://crm.gastro-cms.at

# SMTP/Brevo (optional, für E-Mail-Benachrichtigungen)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq
SMTP_FROM=office@gastro-cms.at
```

#### Domain konfigurieren

**WICHTIG**: Multi-Tenant Anwendung benötigt **Wildcard-Domain** oder **mehrere Domains**.

**Option A: Wildcard-Domain (empfohlen)**
1. **Domains** → **Add Domain**
2. **Domain**: `*.gastro-cms.at` (Wildcard)
3. **SSL**: Automatisch (Let's Encrypt unterstützt Wildcard mit DNS-Challenge)

**Option B: Einzelne Domains**
Füge jede Restaurant-Domain einzeln hinzu:
- `pizzeria1140.gastro-cms.at`
- `restaurant2.gastro-cms.at`
- etc.

#### Deployment

1. **Deploy** klicken
2. Warte auf erfolgreichen Build

---

## 🗄️ Schritt 4: Datenbank-Migrationen ausführen

⚠️ **WICHTIG**: Migrationen laufen **NICHT automatisch**! Du musst sie **manuell ausführen**!

Nach dem ersten Deployment müssen die Datenbank-Migrationen ausgeführt werden.

### Option A: Über Coolify Terminal (empfohlen)

1. Öffne die **gastro-crm** Anwendung in Coolify
2. **Terminal** → **Open Terminal**
3. Führe aus:
   ```bash
   npx prisma migrate deploy
   ```
   Oder falls `migrate deploy` nicht verfügbar:
   ```bash
   npx prisma db push
   ```

### Option B: Lokal ausführen

Falls du lokal Zugriff auf die Datenbank hast:

```bash
cd gastro-crm
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public" npx prisma migrate deploy
```

### ⚠️ Wichtig: Migrationen nur EINMAL ausführen

Die Migrationen müssen nur **einmal** nach dem ersten Deployment ausgeführt werden. Bei späteren Updates werden die Migrationen automatisch durch Prisma erkannt und angewendet (wenn `prisma migrate deploy` verwendet wird).

## 🔐 Schritt 5: Secrets und Sicherheit

### Wichtige Secrets

1. **JWT_SECRET**: Muss für `gastro-cms-multi` und `gastro-crm` **identisch** sein!
2. **DATABASE_URL**: Enthält Passwörter - niemals in Git committen!
3. **Stripe Keys**: LIVE Keys nur in Production verwenden!

### Best Practices

- ✅ Verwende **Coolify Secrets** für sensible Daten
- ✅ Rotiere Secrets regelmäßig
- ✅ Verwende starke Passwörter (mindestens 32 Zeichen für JWT_SECRET)
- ✅ Aktiviere **2FA** für Coolify

## 🔄 Schritt 6: Automatische Deployments

### GitHub Actions (optional)

Coolify unterstützt automatische Deployments bei Git Push:

1. In Coolify: **Settings** → **Source**
2. **Auto Deploy**: Aktivieren
3. Bei jedem Push auf `main` wird automatisch deployed

### Manuelles Deployment

1. In Coolify: **Deploy** Button klicken
2. Oder: **Redeploy** für Neustart ohne Rebuild

## 🧪 Schritt 7: Testing

### 1. Landing Page testen

- ✅ `https://www.gastro-cms.at` öffnen
- ✅ Kontaktformular testen
- ✅ Bestellformular testen
- ✅ Termin-Formular testen

### 2. CRM testen

- ✅ `https://crm.gastro-cms.at` öffnen
- ✅ Login testen (Admin-Account erstellen falls nötig)
- ✅ Stripe-Einstellungen prüfen
- ✅ Restaurant-Verwaltung testen

### 3. Multi-Tenant testen

- ✅ Restaurant-Domain öffnen (z.B. `pizzeria1140.gastro-cms.at`)
- ✅ Dashboard-Login testen
- ✅ Produktverwaltung testen
- ✅ Stripe Connect testen

## 🐛 Troubleshooting

### Problem: Build schlägt fehl

**Lösung:**
- Prüfe Dockerfile Location und Build Context
- Prüfe ob alle Dependencies in `package.json` vorhanden sind
- Prüfe Build-Logs in Coolify

### Problem: Datenbank-Verbindung fehlgeschlagen

**Lösung:**
- Prüfe `DATABASE_URL` Format
- Prüfe ob Datenbank erreichbar ist (Firewall, Netzwerk)
- Prüfe Credentials

### Problem: 500 Internal Server Error

**Lösung:**
- Prüfe Application-Logs in Coolify
- Prüfe ob alle Environment-Variablen gesetzt sind
- Prüfe ob JWT_SECRET gesetzt ist (für multi und crm)

### Problem: Domain nicht erreichbar

**Lösung:**
- Prüfe DNS-Einträge (A-Record auf Coolify-Server-IP)
- Prüfe SSL-Zertifikat in Coolify
- Prüfe Domain-Konfiguration in Coolify

### Problem: Prisma Migration fehlgeschlagen

**Lösung:**
```bash
# Im Coolify Terminal
npx prisma generate
npx prisma db push --accept-data-loss
```

## 📊 Schritt 8: Monitoring und Wartung

### Logs ansehen

1. In Coolify: **Logs** Tab
2. Filter nach Log-Level (Error, Warning, Info)

### Health Checks

Coolify führt automatisch Health Checks durch. Prüfe:
- **Status**: Green = Healthy
- **Uptime**: Sollte kontinuierlich sein

### Backups

1. **Database Backups**: Konfiguriere automatische Backups in Coolify
2. **Application Backups**: Coolify erstellt automatisch Snapshots

## 🔄 Updates deployen

### Automatisch (empfohlen)

1. Push auf `main` Branch
2. Coolify deployed automatisch

### Manuell

1. In Coolify: **Deploy** → **Redeploy**
2. Oder: **Deploy** → **Deploy Latest Commit**

## 📝 Checkliste vor Production

- [ ] Alle Environment-Variablen gesetzt
- [ ] LIVE Stripe Keys verwendet (nicht TEST!)
- [ ] JWT_SECRET für multi und crm identisch
- [ ] Datenbank-Migrationen ausgeführt
- [ ] Domains konfiguriert und SSL aktiv
- [ ] Alle drei Anwendungen deployed
- [ ] Landing Page getestet
- [ ] CRM getestet
- [ ] Multi-Tenant getestet
- [ ] Backups konfiguriert
- [ ] Monitoring aktiviert

## 🆘 Support

Bei Problemen:
1. Prüfe Coolify-Logs
2. Prüfe Application-Logs
3. Prüfe Datenbank-Verbindung
4. Prüfe Environment-Variablen

## 📚 Weitere Ressourcen

- [Coolify Dokumentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Erstellt am**: 2025-01-12
**Version**: 1.0

