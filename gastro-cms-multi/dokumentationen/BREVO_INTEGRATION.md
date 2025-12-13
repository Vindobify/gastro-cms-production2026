# Brevo E-Mail Integration

## Übersicht
Das Gastro CMS System wurde erfolgreich für die Verwendung von Brevo (ehemals Sendinblue) als E-Mail-Service-Provider konfiguriert.

## Konfiguration

### Umgebungsvariablen
Erstelle eine `.env`-Datei mit folgenden Einstellungen:

```env
# Brevo SMTP-Konfiguration
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="96fdd4001@smtp-brevo.com"
SMTP_PASS="zLCrHG9R6Qx4NjEq"
SMTP_FROM="office@gastro-cms.at"
```

### Brevo-spezifische Optimierungen

Das System wurde mit folgenden Brevo-optimierten Einstellungen konfiguriert:

#### SMTP-Konfiguration
- **Host**: `smtp-relay.brevo.com`
- **Port**: `587` (TLS)
- **Sicherheit**: TLS-Verschlüsselung
- **Authentifizierung**: SMTP-Auth mit Login und API-Key

#### Performance-Optimierungen
- **Verbindungspool**: Aktiviert für bessere Performance
- **Maximale Verbindungen**: 5 gleichzeitige Verbindungen
- **Maximale Nachrichten**: 100 E-Mails pro Verbindung
- **Rate-Limiting**: 14 E-Mails pro Sekunde (Brevo-Limit)
- **Timeouts**: Optimiert für Brevo-Server

#### E-Mail-Header
- **X-Mailer**: "Gastro CMS System"
- **X-Priority**: Normal (3)
- **Encoding**: UTF-8
- **TLS**: Erzwungen für sichere Übertragung

## Funktionen

### Verfügbare E-Mail-Typen
1. **Restaurant-Benachrichtigungen**: Neue Bestellungen
2. **Kunden-E-Mails**: 
   - Registrierungsbestätigung
   - Bestellbestätigung
   - Status-Updates
3. **Lieferanten-E-Mails**:
   - Bestellzuweisungen
   - Zugangsdaten
4. **Kontaktformular**: Automatische Weiterleitung

### E-Mail-Templates
Alle E-Mails verwenden professionelle HTML-Templates mit:
- Responsive Design
- Restaurant-Branding
- Strukturierte Informationen
- Mobile-optimierte Darstellung

## Testing

### SMTP-Verbindung testen
```bash
# Direkter SMTP-Test
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '96fdd4001@smtp-brevo.com',
    pass: 'zLCrHG9R6Qx4NjEq'
  }
});
transporter.verify().then(() => console.log('✅ Verbindung OK')).catch(console.error);
"
```

### E-Mail-Versand testen
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "office@gastro-cms.at",
    "subject": "Test E-Mail",
    "message": "<h1>Test</h1><p>E-Mail-Test erfolgreich!</p>"
  }'
```

## Vorteile von Brevo

### Zuverlässigkeit
- **Hohe Zustellbarkeit**: Professionelle E-Mail-Infrastruktur
- **Spam-Schutz**: Automatische Spam-Filter-Umgehung
- **Reputation**: Gute Sender-Reputation bei E-Mail-Providern

### Performance
- **Schnelle Zustellung**: Optimierte Server-Infrastruktur
- **Skalierbarkeit**: Unterstützt hohe E-Mail-Volumen
- **Monitoring**: Detaillierte Zustellungsstatistiken

### Compliance
- **DSGVO-konform**: EU-Datenschutzbestimmungen
- **Opt-out**: Automatische Abmeldung-Funktionen
- **Tracking**: E-Mail-Öffnungs- und Klick-Statistiken

## Wartung

### Logs überwachen
```bash
# E-Mail-Logs anzeigen
tail -f /var/log/gastro-cms/email.log
```

### Rate-Limits beachten
- **Maximal**: 14 E-Mails pro Sekunde
- **Täglich**: Abhängig von Brevo-Plan
- **Monitoring**: Über Brevo-Dashboard

### Backup-Konfiguration
Bei Problemen mit Brevo kann auf Gmail SMTP zurückgewechselt werden:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="deine-gmail@gmail.com"
SMTP_PASS="dein-app-password"
```

## Support

Bei Problemen mit der E-Mail-Integration:
1. **Logs prüfen**: Console-Ausgabe und Log-Dateien
2. **SMTP-Test**: Verbindungstest durchführen
3. **Brevo-Dashboard**: Zustellungsstatistiken prüfen
4. **Rate-Limits**: Überschreitungen vermeiden

## Changelog

### Version 1.0.0 (Aktuell)
- ✅ Brevo SMTP-Integration implementiert
- ✅ Performance-Optimierungen hinzugefügt
- ✅ E-Mail-Header optimiert
- ✅ Rate-Limiting konfiguriert
- ✅ Verbindungspool aktiviert
- ✅ TLS-Sicherheit verstärkt
