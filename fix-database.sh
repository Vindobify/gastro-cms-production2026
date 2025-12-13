#!/bin/bash

# 🔧 Datenbank-Initialisierung korrigieren
# Dieses Skript initialisiert die Datenbank mit den korrekten Credentials neu

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Datenbank-Initialisierung korrigieren${NC}"
echo "========================================"
echo ""

# Prüfe ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen${NC}"
    exit 1
fi

cd /var/www/gastro-cms-production

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env Datei nicht gefunden${NC}"
    exit 1
fi

# Lese POSTGRES_USER und POSTGRES_PASSWORD aus .env
POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "gastrocms")
POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}❌ POSTGRES_PASSWORD nicht in .env gefunden${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WICHTIG: Dies wird alle Daten in der Datenbank löschen!${NC}"
read -p "Möchtest du fortfahren? (j/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo "Abgebrochen."
    exit 1
fi

echo ""
echo "🛑 Stoppe Container..."
docker compose -f docker-compose.production.yml down

echo ""
echo "🗑️  Lösche Datenbank-Volume..."
docker volume rm gastro-cms-production_db_data 2>/dev/null || echo "Volume existiert nicht oder wurde bereits gelöscht"

echo ""
echo "🚀 Starte Container neu (Datenbank wird mit neuen Credentials initialisiert)..."
docker compose -f docker-compose.production.yml up -d db

echo ""
echo "⏳ Warte bis Datenbank bereit ist..."
for i in {1..30}; do
    if docker compose -f docker-compose.production.yml exec -T db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Datenbank ist bereit${NC}"
        break
    fi
    echo "Warte auf Datenbank... ($i/30)"
    sleep 2
done

echo ""
echo "📦 Starte alle Services..."
docker compose -f docker-compose.production.yml up -d

echo ""
echo "⏳ Warte bis alle Services bereit sind..."
sleep 10

echo ""
echo "🗄️  Führe Migrationen aus..."

# URL-encode das Passwort für DATABASE_URL
POSTGRES_PASSWORD_ENCODED=$(echo -n "$POSTGRES_PASSWORD" | sed 's/#/%23/g' | sed 's/@/%40/g' | sed 's/!/%21/g' | sed 's/\$/%24/g' | sed 's/&/%26/g' | sed 's/\*/%2A/g' | sed 's/+/%2B/g' | sed 's/,/%2C/g' | sed 's/:/%3A/g' | sed 's/;/%3B/g' | sed 's/=/%3D/g' | sed 's/?/%3F/g' | sed 's/\[/%5B/g' | sed 's/\]/%5D/g')
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD_ENCODED}@db:5432/gastro_cms_multi?schema=public"

# Setze DATABASE_URL im Container für Prisma
if docker compose -f docker-compose.production.yml exec -T crm sh -c "export DATABASE_URL='$DATABASE_URL' && npx prisma migrate deploy" 2>&1; then
    echo -e "${GREEN}✅ Migrationen erfolgreich ausgeführt${NC}"
else
    echo -e "${YELLOW}⚠️  Migrationen fehlgeschlagen, versuche db push...${NC}"
    docker compose -f docker-compose.production.yml exec -T crm sh -c "export DATABASE_URL='$DATABASE_URL' && npx prisma db push --accept-data-loss" 2>&1 || {
        echo -e "${RED}❌ Datenbank-Push fehlgeschlagen${NC}"
        exit 1
    }
fi

echo ""
echo -e "${GREEN}✅ Datenbank erfolgreich neu initialisiert!${NC}"
echo ""
echo "📊 Service-Status:"
docker compose -f docker-compose.production.yml ps

