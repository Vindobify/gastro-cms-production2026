# DSGVO-Integration für Gastro CMS

## Übersicht

Diese Dokumentation beschreibt die vollständige DSGVO-konforme Cookie- und Datenschutz-Integration in das Gastro CMS System.

## Implementierte Features

### 1. Cookie-Management System
- **ConsentProvider**: React Context für globale Consent-Verwaltung
- **CookieBanner**: DSGVO-konformer Cookie-Banner mit granularen Einstellungen
- **CookieManagementForm**: Verwaltungsinterface für Cookie-Einstellungen
- **ConsentScripts**: Automatische Integration von Google Analytics 4

### 2. Cookie-Kategorien
- **Notwendige Cookies**: Immer aktiv, für Grundfunktionen erforderlich
- **Analytics Cookies**: Google Analytics 4 mit IP-Anonymisierung
- **Marketing Cookies**: Vorbereitet, aber derzeit nicht aktiv

### 3. Rechtliche Compliance
- **DSGVO-konform**: Vollständige Einhaltung der Datenschutz-Grundverordnung
- **Consent Mode v2**: Google Analytics 4 mit Consent Mode v2
- **Granulare Kontrolle**: Einzelne Cookie-Kategorien können aktiviert/deaktiviert werden
- **Widerruf**: Einwilligung kann jederzeit widerrufen werden

## Technische Implementierung

### Dateien
```
src/
├── lib/
│   ├── consent.ts              # Consent-Management Bibliothek
│   └── gtag.ts                 # Google Analytics 4 Integration
├── components/
│   ├── ConsentProvider.tsx     # React Context Provider
│   ├── CookieBanner.tsx        # Cookie-Banner Komponente
│   ├── ConsentScripts.tsx      # Analytics Scripts
│   └── CookieManagementForm.tsx # Cookie-Verwaltung
├── app/
│   ├── api/consent/route.ts    # Consent-Logging API
│   ├── frontend/
│   │   ├── datenschutz/page.tsx # Datenschutzerklärung
│   │   ├── agb/page.tsx        # Allgemeine Geschäftsbedingungen
│   │   └── cookies/page.tsx    # Cookie-Management Seite
│   └── layout.tsx              # Integration in Root Layout
└── styles/
    └── cookie.css              # Cookie-Banner Styling
```

### Umgebungsvariablen
Erstellen Sie eine `.env.local` Datei mit folgenden Variablen:

```env
# Google Analytics 4 Configuration
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Site Verification (optional)
GOOGLE_SITE_VERIFICATION=your-verification-code
```

## Verwendung

### 1. Cookie-Banner
Der Cookie-Banner erscheint automatisch beim ersten Besuch der Website. Benutzer können:
- Alle Cookies akzeptieren
- Alle Cookies ablehnen
- Granulare Einstellungen vornehmen

### 2. Cookie-Verwaltung
Benutzer können ihre Cookie-Einstellungen jederzeit über die Cookie-Management-Seite anpassen:
- URL: `/frontend/cookies`
- Einstellungen ändern
- Alle Cookies löschen
- Cookie-Banner erneut anzeigen

### 3. Google Analytics 4
- Wird nur geladen, wenn Analytics-Cookies akzeptiert werden
- IP-Anonymisierung ist aktiviert
- Consent Mode v2 wird verwendet
- Keine personenbezogenen Daten werden ohne Einwilligung verarbeitet

## Rechtliche Seiten

### Datenschutzerklärung
- URL: `/frontend/datenschutz`
- Vollständige DSGVO-konforme Datenschutzerklärung
- Beschreibung aller verarbeiteten Daten
- Benutzerrechte und Kontaktinformationen

### Allgemeine Geschäftsbedingungen
- URL: `/frontend/agb`
- Geschäftsbedingungen für die Nutzung des Gastro CMS
- Haftungsausschlüsse und Nutzungsrechte

## Anpassungen

### Cookie-Kategorien erweitern
Um neue Cookie-Kategorien hinzuzufügen:

1. `src/lib/consent.ts` erweitern:
```typescript
export interface ConsentCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  // Neue Kategorie hinzufügen
  social: boolean;
}
```

2. `src/components/CookieBanner.tsx` erweitern
3. `src/components/CookieManagementForm.tsx` erweitern

### Styling anpassen
Das Cookie-Banner-Styling kann in `src/styles/cookie.css` angepasst werden.

### Google Analytics 4 konfigurieren
1. GA4 Property erstellen
2. Measurement ID in `.env.local` eintragen
3. Consent Mode v2 ist bereits konfiguriert

## Testing

### Lokale Entwicklung
```bash
npm run dev
```

### Cookie-Banner testen
1. Browser-Cookies löschen
2. Seite neu laden
3. Cookie-Banner sollte erscheinen
4. Verschiedene Einstellungen testen

### Google Analytics testen
1. Analytics-Cookies akzeptieren
2. Browser-Entwicklertools öffnen
3. Network-Tab prüfen auf GA4-Requests
4. Console prüfen auf gtag-Aufrufe

## Compliance-Checkliste

- [x] Cookie-Banner beim ersten Besuch
- [x] Granulare Cookie-Kontrolle
- [x] Einwilligung kann widerrufen werden
- [x] Datenschutzerklärung vorhanden
- [x] AGB vorhanden
- [x] Google Analytics 4 mit Consent Mode v2
- [x] IP-Anonymisierung aktiviert
- [x] Keine Cookies ohne Einwilligung
- [x] Cookie-Verwaltungsseite
- [x] Barrierefreie Implementierung

## Support

Bei Fragen zur DSGVO-Integration wenden Sie sich an:
- E-Mail: office@nextpuls.com
- Website: www.nextpuls.com

## Version

- **Version**: 1.0
- **Datum**: 17. September 2025
- **Compliance**: DSGVO, österreichisches Datenschutzgesetz
