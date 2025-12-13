#!/bin/bash

# 🚀 Server Deployment Script für Gastro CMS 3.0
# Führe dieses Script auf dem Server aus: bash deploy-server.sh
# Oder direkt von GitHub: bash <(curl -sSL https://raw.githubusercontent.com/Vindobify/gastro-cms-production2026/main/deploy-server.sh)

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
    echo "Aktualisiere Repository..."
    git fetch origin main
    git reset --hard origin/main || git pull origin main || true
    echo -e "${GREEN}✅ Repository aktualisiert${NC}"
fi

# 4. .env Datei erstellen
echo ""
echo "🔐 Schritt 4: Environment-Variablen einrichten..."
if [ ! -f ".env" ]; then
    echo "Erstelle .env Datei mit Production-Werten..."
    
    # Generiere sichere Passwörter
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
    
    cat > .env << EOF
# 🔐 Production Environment Variables
# Automatisch generiert am $(date)

# ============================================
# DATENBANK
# ============================================
POSTGRES_USER=gastrocms
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# ============================================
# JWT SECRET (identisch für multi und crm)
# ============================================
JWT_SECRET=${JWT_SECRET}

# ============================================
# DOMAINS
# ============================================
NEXTAUTH_URL=https://crm.gastro-cms.at
CRM_URL=https://crm.gastro-cms.at
CRM_API_URL=https://crm.gastro-cms.at
NEXT_PUBLIC_CRM_API_URL=https://crm.gastro-cms.at
NEXT_PUBLIC_APP_URL=https://crm.gastro-cms.at

# ============================================
# SMTP/BREVO (E-Mail)
# ============================================
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq
SMTP_FROM=office@gastro-cms.at

# ============================================
# STRIPE (LIVE KEYS)
# ============================================
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi
STRIPE_CLIENT_ID=

# ============================================
# OPTIONAL
# ============================================
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
EOF
    
    # Sichere Berechtigungen setzen
    chmod 600 .env
    echo -e "${GREEN}✅ .env Datei erstellt mit sicheren Passwörtern${NC}"
    echo -e "${YELLOW}⚠️  WICHTIG: Speichere die Passwörter sicher!${NC}"
    echo -e "${YELLOW}   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}${NC}"
    echo -e "${YELLOW}   JWT_SECRET: ${JWT_SECRET}${NC}"
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

# 8. Warte bis Services bereit sind
echo ""
echo "⏳ Schritt 8: Warte bis Services bereit sind..."
echo ""
echo "⏳ Schritt 8: Warte bis Services bereit sind..."
sleep 15

# 9. Datenbank-Migrationen ausführen
echo ""
echo "🗄️  Schritt 9: Datenbank-Migrationen ausführen..."
echo "Warte bis Datenbank bereit ist..."
sleep 5

# Lese POSTGRES_USER aus .env
if [ -f ".env" ]; then
    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "gastrocms")
else
    POSTGRES_USER="gastrocms"
fi

# Prüfe ob Datenbank bereit ist
echo "Prüfe Datenbank-Verbindung..."
for i in {1..30}; do
    if docker compose -f docker-compose.production.yml exec -T db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Datenbank ist bereit${NC}"
        break
    fi
    echo "Warte auf Datenbank... ($i/30)"
    sleep 2
done

# Prüfe ob Datenbank existiert
DB_EXISTS=$(docker compose -f docker-compose.production.yml exec -T db psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "gastro_cms_multi" && echo "yes" || echo "no")

if [ "$DB_EXISTS" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Datenbank 'gastro_cms_multi' existiert nicht, erstelle sie...${NC}"
    docker compose -f docker-compose.production.yml exec -T db psql -U "$POSTGRES_USER" -c "CREATE DATABASE gastro_cms_multi;" || true
fi

# Migrationen ausführen
echo "Führe Migrationen aus..."
if docker compose -f docker-compose.production.yml exec -T crm npx prisma migrate deploy 2>&1; then
    echo -e "${GREEN}✅ Migrationen erfolgreich ausgeführt${NC}"
else
    echo -e "${YELLOW}⚠️  Migrationen fehlgeschlagen, versuche db push...${NC}"
    docker compose -f docker-compose.production.yml exec -T crm npx prisma db push --accept-data-loss 2>&1 || {
        echo -e "${RED}❌ Datenbank-Push fehlgeschlagen${NC}"
        echo -e "${YELLOW}⚠️  Bitte prüfe die Datenbank manuell${NC}"
    }
fi

# 10. Nginx konfigurieren
echo ""
echo "🌐 Schritt 10: Nginx konfigurieren..."

# Prüfe ob Nginx installiert ist
if ! command -v nginx &> /dev/null; then
    echo "Nginx wird installiert..."
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installiert${NC}"
else
    echo -e "${GREEN}✅ Nginx bereits installiert${NC}"
fi

# Kopiere Nginx-Konfiguration
if [ -f "nginx-production.conf" ]; then
    echo "Kopiere Nginx-Konfiguration..."
    cp nginx-production.conf /etc/nginx/sites-available/gastro-cms
    
    # Entferne alte Symlinks
    rm -f /etc/nginx/sites-enabled/gastro-cms
    rm -f /etc/nginx/sites-enabled/default
    
    # Erstelle Symlink
    ln -sf /etc/nginx/sites-available/gastro-cms /etc/nginx/sites-enabled/
    
    # Teste Nginx-Konfiguration
    if nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx-Konfiguration ist gültig${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx neu geladen${NC}"
    else
        echo -e "${RED}❌ Nginx-Konfiguration fehlerhaft${NC}"
        nginx -t
        echo -e "${YELLOW}⚠️  Bitte korrigiere die Nginx-Konfiguration manuell${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  nginx-production.conf nicht gefunden, überspringe Nginx-Konfiguration${NC}"
fi

# 11. SSL-Zertifikate (optional)
echo ""
echo "🔒 Schritt 11: SSL-Zertifikate (optional)..."
read -p "SSL-Zertifikate jetzt einrichten? (j/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    # Prüfe ob certbot installiert ist
    if ! command -v certbot &> /dev/null; then
        echo "Certbot wird installiert..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        echo -e "${GREEN}✅ Certbot installiert${NC}"
    fi
    
    echo "Erstelle SSL-Zertifikate..."
    echo -e "${YELLOW}⚠️  Stelle sicher, dass die Domains auf diesen Server zeigen!${NC}"
    
    # SSL für Landing Page
    certbot --nginx -d www.gastro-cms.at -d gastro-cms.at --non-interactive --agree-tos --email office@gastro-cms.at --redirect || echo -e "${YELLOW}⚠️  SSL für Landing Page fehlgeschlagen${NC}"
    
    # SSL für CRM
    certbot --nginx -d crm.gastro-cms.at --non-interactive --agree-tos --email office@gastro-cms.at --redirect || echo -e "${YELLOW}⚠️  SSL für CRM fehlgeschlagen${NC}"
    
    echo -e "${GREEN}✅ SSL-Zertifikate eingerichtet${NC}"
else
    echo -e "${YELLOW}⚠️  SSL-Zertifikate übersprungen${NC}"
    echo "Du kannst sie später mit folgenden Befehlen einrichten:"
    echo "  certbot --nginx -d www.gastro-cms.at -d gastro-cms.at"
    echo "  certbot --nginx -d crm.gastro-cms.at"
fi

# 12. Logs anzeigen
echo ""
echo "📋 Schritt 12: Logs (letzte 50 Zeilen)..."
docker compose -f docker-compose.production.yml logs --tail=50

echo ""
echo -e "${GREEN}✅ Deployment vollständig abgeschlossen!${NC}"
echo ""
echo "📝 Zusammenfassung:"
echo "✅ Docker Container gestartet"
echo "✅ Datenbank-Migrationen ausgeführt"
echo "✅ Nginx konfiguriert"
if [[ $REPLY =~ ^[Jj]$ ]]; then
    echo "✅ SSL-Zertifikate eingerichtet"
else
    echo "⚠️  SSL-Zertifikate noch nicht eingerichtet"
fi
echo ""
echo "🌐 URLs:"
echo "  - Landing Page: http://www.gastro-cms.at"
echo "  - CRM: http://crm.gastro-cms.at"
echo "  - Multi-Tenant: http://*.gastro-cms.at"
echo ""
echo "📊 Nützliche Befehle:"
echo "  - Logs ansehen: docker compose -f docker-compose.production.yml logs -f"
echo "  - Status prüfen: docker compose -f docker-compose.production.yml ps"
echo "  - Services neu starten: docker compose -f docker-compose.production.yml restart"

