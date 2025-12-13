#!/bin/bash

# 🔒 SSL-Zertifikat Setup für Gastro CMS 3.0
# Dieses Skript richtet SSL-Zertifikate für alle Domains ein

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 SSL-Zertifikat Setup für Gastro CMS 3.0${NC}"
echo "========================================"
echo ""

# Prüfe ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen${NC}"
    exit 1
fi

# Prüfe ob Certbot installiert ist
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot wird installiert..."
    apt-get update
    apt-get install -y certbot
    echo -e "${GREEN}✅ Certbot installiert${NC}"
else
    echo -e "${GREEN}✅ Certbot bereits installiert${NC}"
fi

# Prüfe ob Docker-Proxy läuft
if docker ps | grep -q "gastro-cms-proxy"; then
    echo -e "${YELLOW}⚠️  Docker-Proxy läuft auf Port 80${NC}"
    echo -e "${YELLOW}   Verwende Certbot im Standalone-Modus${NC}"
    echo ""
    
    # Stoppe Docker-Proxy temporär
    echo "🛑 Stoppe Docker-Proxy temporär..."
    cd /var/www/gastro-cms-production
    docker compose -f docker-compose.production.yml stop proxy
    
    # Warte kurz
    sleep 2
    
    # Erstelle Zertifikate für www.gastro-cms.at und gastro-cms.at
    echo ""
    echo "📜 Erstelle SSL-Zertifikat für www.gastro-cms.at und gastro-cms.at..."
    certbot certonly --standalone \
        -d www.gastro-cms.at \
        -d gastro-cms.at \
        --non-interactive \
        --agree-tos \
        --email office@gastro-cms.at \
        --preferred-challenges http || {
        echo -e "${RED}❌ SSL-Zertifikat für www.gastro-cms.at fehlgeschlagen${NC}"
        docker compose -f docker-compose.production.yml start proxy
        exit 1
    }
    
    # Erstelle Zertifikat für crm.gastro-cms.at
    echo ""
    echo "📜 Erstelle SSL-Zertifikat für crm.gastro-cms.at..."
    certbot certonly --standalone \
        -d crm.gastro-cms.at \
        --non-interactive \
        --agree-tos \
        --email office@gastro-cms.at \
        --preferred-challenges http || {
        echo -e "${RED}❌ SSL-Zertifikat für crm.gastro-cms.at fehlgeschlagen${NC}"
        docker compose -f docker-compose.production.yml start proxy
        exit 1
    }
    
    # Starte Docker-Proxy wieder
    echo ""
    echo "▶️  Starte Docker-Proxy wieder..."
    docker compose -f docker-compose.production.yml start proxy
    
    echo -e "${GREEN}✅ SSL-Zertifikate erstellt${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  WICHTIG: Nginx-Konfiguration muss noch für HTTPS aktualisiert werden!${NC}"
    echo ""
    echo "📋 Zertifikate gespeichert in:"
    echo "   - /etc/letsencrypt/live/www.gastro-cms.at/"
    echo "   - /etc/letsencrypt/live/crm.gastro-cms.at/"
    echo ""
    echo "🔧 Nächste Schritte:"
    echo "   1. Aktualisiere proxy/nginx.conf für HTTPS"
    echo "   2. Kopiere Zertifikate in Docker-Container oder mounte sie"
    echo "   3. Starte Docker-Proxy neu"
    
else
    echo -e "${GREEN}✅ Port 80 ist frei, verwende Nginx-Modus${NC}"
    
    # Erstelle Zertifikate mit Nginx-Plugin
    certbot --nginx \
        -d www.gastro-cms.at \
        -d gastro-cms.at \
        --non-interactive \
        --agree-tos \
        --email office@gastro-cms.at \
        --redirect || echo -e "${YELLOW}⚠️  SSL für www.gastro-cms.at fehlgeschlagen${NC}"
    
    certbot --nginx \
        -d crm.gastro-cms.at \
        --non-interactive \
        --agree-tos \
        --email office@gastro-cms.at \
        --redirect || echo -e "${YELLOW}⚠️  SSL für crm.gastro-cms.at fehlgeschlagen${NC}"
    
    echo -e "${GREEN}✅ SSL-Zertifikate eingerichtet${NC}"
fi

echo ""
echo -e "${GREEN}✅ SSL-Setup abgeschlossen!${NC}"

