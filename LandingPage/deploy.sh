#!/bin/bash

# ============================================
# Da Corrado – Auto Deploy Script
# Auf dem Hostinger Server ausführen:
# bash deploy.sh
# ============================================

set -e

echo "🚀 Da Corrado Deployment gestartet..."

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# ── 1. .env prüfen ──────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env Datei fehlt! Bitte zuerst .env anlegen.${NC}"
  exit 1
fi

source .env

# DB-Daten aus DATABASE_URL extrahieren
DB_USER=$(echo $DATABASE_URL | sed 's/mysql:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed 's/mysql:\/\/[^:]*:\([^@]*\)@.*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')

echo "📦 Datenbank: $DB_NAME @ $DB_HOST"

# ── 2. Permissions fixen ────────────────────
echo ""
echo "Fixing file permissions..."
find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -exec chmod 755 {} \;
find . -type f -not -path "*/node_modules/*" -not -path "*/.next/*" -exec chmod 644 {} \;
chmod +x deploy.sh

# ── 3. Dependencies installieren ────────────
echo ""
echo "Installing dependencies..."
npm install --legacy-peer-deps

# ── 3. Prisma Client generieren ─────────────
echo ""
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# ── 4. Datenbank Schema erstellen ───────────
echo ""
echo "🗄️  Creating database schema..."
npx prisma db push --accept-data-loss

# ── 5. Daten importieren ────────────────────
if [ -f "prisma/database.sql" ]; then
  echo ""
  echo "📊 Importing database data..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < prisma/database.sql
  echo -e "${GREEN}✅ Daten erfolgreich importiert!${NC}"
else
  echo "⚠️  Keine prisma/database.sql gefunden – überspringe Datenimport."
fi

# ── 6. Production Build ─────────────────────
echo ""
echo "🔨 Building Next.js app..."
npm run build

echo ""
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo "👉 App starten mit: npm start"
