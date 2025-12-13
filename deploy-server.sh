#!/bin/bash

# 🚀 Server Deployment Script für Gastro CMS 3.0
# Führe dieses Script auf dem Server aus: bash deploy-server.sh

set -e  # Exit on error

echo "🚀 Gastro CMS 3.0 - Server Deployment"
echo "======================================"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Prüfe ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen: sudo bash deploy-server.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Als root ausgeführt${NC}"

# 1. Docker installieren
echo ""
echo "📦 Schritt 1: Docker installieren..."
if ! command -v docker &> /dev/null; then
    echo "Docker wird installiert..."
    
    # Alte Versionen entfernen
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Updates
    apt-get update
    
    # Docker Dependencies installieren
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
    
    echo -e "${GREEN}✅ Docker installiert${NC}"
else
    echo -e "${GREEN}✅ Docker bereits installiert${NC}"
fi

# 2. Docker Compose prüfen
echo ""
echo "📦 Schritt 2: Docker Compose prüfen..."
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose nicht gefunden${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose verfügbar${NC}"

# 3. /var/www erstellen
echo ""
echo "📁 Schritt 3: /var/www Verzeichnis erstellen..."
mkdir -p /var/www
cd /var/www

if [ -d "gastro-cms-production" ]; then
    echo -e "${YELLOW}⚠️  Verzeichnis gastro-cms-production existiert bereits${NC}"
    read -p "Löschen und neu klonen? (j/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        rm -rf gastro-cms-production
        echo -e "${GREEN}✅ Altes Verzeichnis gelöscht${NC}"
    else
        echo -e "${YELLOW}⚠️  Überspringe Klonen, verwende existierendes Verzeichnis${NC}"
        cd gastro-cms-production
        git pull origin main || true
    fi
fi

if [ ! -d "gastro-cms-production" ]; then
    echo "Repository wird geklont..."
    git clone https://github.com/Vindobify/gastro-cms-production2026.git gastro-cms-production
    echo -e "${GREEN}✅ Repository geklont${NC}"
    cd gastro-cms-production
else
    cd gastro-cms-production
    git pull origin main || true
fi

# 4. .env Datei erstellen
echo ""
echo "🔐 Schritt 4: Environment-Variablen einrichten..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env Datei nicht gefunden. Erstelle aus Template...${NC}"
    cp docker-compose.production.env.example .env
    echo -e "${YELLOW}⚠️  WICHTIG: Bearbeite .env Datei und trage deine echten Werte ein!${NC}"
    echo -e "${YELLOW}⚠️  nano .env${NC}"
    read -p "Drücke Enter wenn du .env bearbeitet hast..."
else
    echo -e "${GREEN}✅ .env Datei vorhanden${NC}"
fi

# 5. Docker Images bauen
echo ""
echo "🔨 Schritt 5: Docker Images bauen..."
docker compose -f docker-compose.production.yml build --no-cache

# 6. Services starten
echo ""
echo "🚀 Schritt 6: Services starten..."
docker compose -f docker-compose.production.yml up -d

# 7. Status anzeigen
echo ""
echo "📊 Schritt 7: Service-Status prüfen..."
docker compose -f docker-compose.production.yml ps

# 8. Logs anzeigen
echo ""
echo "📋 Schritt 8: Logs (letzte 50 Zeilen)..."
docker compose -f docker-compose.production.yml logs --tail=50

echo ""
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo ""
echo "📝 Nächste Schritte:"
echo "1. Prüfe die Logs: docker compose -f docker-compose.production.yml logs -f"
echo "2. Migrationen ausführen: docker compose -f docker-compose.production.yml exec crm npx prisma migrate deploy"
echo "3. Domains konfigurieren (Nginx/Apache)"
echo "4. SSL-Zertifikate einrichten (Let's Encrypt)"

