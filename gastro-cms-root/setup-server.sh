#!/bin/bash

# Server Setup Script für Gastro CMS 3.0
# Dieses Script richtet den Server ein (einmalig ausführen)

set -e

echo "🔧 Richte Server für Gastro CMS 3.0 ein..."

SERVER="root@72.61.190.70"
REMOTE_DIR="/var/www/gastro-cms-root"
DOMAIN="www.gastro-cms.at"

# 1. Ordner erstellen
echo "📁 Erstelle Verzeichnisse..."
ssh $SERVER "mkdir -p $REMOTE_DIR/logs"
ssh $SERVER "mkdir -p $REMOTE_DIR/data"

# 2. Nginx-Konfiguration installieren
echo "🌐 Konfiguriere Nginx..."
scp nginx-gastro-cms.conf $SERVER:/tmp/nginx-gastro-cms.conf
ssh $SERVER "mv /tmp/nginx-gastro-cms.conf /etc/nginx/sites-available/gastro-cms-at"
ssh $SERVER "ln -sf /etc/nginx/sites-available/gastro-cms-at /etc/nginx/sites-enabled/gastro-cms-at"

# 3. Nginx-Konfiguration testen
echo "🧪 Teste Nginx-Konfiguration..."
ssh $SERVER "nginx -t"

# 4. SSL-Zertifikat mit Let's Encrypt erstellen (falls noch nicht vorhanden)
echo "🔒 Erstelle SSL-Zertifikat..."
ssh $SERVER "certbot --nginx -d $DOMAIN -d gastro-cms.at --non-interactive --agree-tos --email office@gastro-cms.at || echo 'Zertifikat existiert bereits oder Certbot nicht installiert'"

# 5. Nginx neu laden
echo "🔄 Lade Nginx neu..."
ssh $SERVER "systemctl reload nginx"

# 6. PM2 Startup-Script einrichten
echo "⚙️ Richte PM2 Startup ein..."
ssh $SERVER "pm2 startup systemd -u root --hp /root || echo 'PM2 Startup bereits konfiguriert'"

echo "✅ Server-Setup abgeschlossen!"
echo "📝 Nächste Schritte:"
echo "   1. Führe ./deploy.sh aus, um die Anwendung zu deployen"
echo "   2. Prüfe die Website unter https://$DOMAIN"

