#!/bin/bash

# Deployment Script für Gastro CMS 3.0
# Verwendung: ./deploy.sh

set -e

echo "🚀 Starte Deployment für Gastro CMS 3.0..."

# Server-Details
SERVER="root@72.61.190.70"
REMOTE_DIR="/var/www/gastro-cms-root"
DOMAIN="www.gastro-cms.at"

# 1. Production Build lokal erstellen
echo "📦 Erstelle Production Build..."
npm run build

# 2. Dateien zum Server kopieren (ausschließlich node_modules und .next)
echo "📤 Kopiere Dateien zum Server..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude '.env.development' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  ./ $SERVER:$REMOTE_DIR/

# 3. Auf dem Server: Dependencies installieren und Build erstellen
echo "🔧 Installiere Dependencies auf dem Server..."
ssh $SERVER "cd $REMOTE_DIR && npm ci --production=false"

echo "🏗️ Erstelle Build auf dem Server..."
ssh $SERVER "cd $REMOTE_DIR && npm run build"

# 4. PM2 Service starten/neustarten
echo "🔄 Starte/Neustarte PM2 Service..."
ssh $SERVER "cd $REMOTE_DIR && pm2 delete gastro-cms-root 2>/dev/null || true"
ssh $SERVER "cd $REMOTE_DIR && pm2 start ecosystem.config.js --name gastro-cms-root"
ssh $SERVER "pm2 save"

echo "✅ Deployment abgeschlossen!"
echo "🌐 Website sollte unter https://$DOMAIN erreichbar sein"

