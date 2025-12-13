# 💳 Stripe-Integration für Gastro CMS 3.0

## ✅ Erfolgreich implementiert!

Die Stripe-Integration für die Bestellungen ist jetzt live auf **https://gastro-cms.at/bestellung**

---

## 🚀 Was wurde implementiert?

### 1. **Bestellformular mit Stripe-Zahlung**
   - URL: https://gastro-cms.at/bestellung
   - Preis: **€ 180,00 / Jahr** (inkl. MwSt.)
   - Nach dem Absenden wird der Kunde direkt zur Stripe Checkout-Seite weitergeleitet
   - Unterstützte Zahlungsmethoden: Kreditkarte, PayPal, Klarna

### 2. **CRM Dashboard - Bestellungsverwaltung**
   - URL: https://dashboard.gastro-cms.at/bestellungen
   - Vollständige Übersicht aller Bestellungen
   - Zahlungsstatus: Ausstehend, Bezahlt, Fehlgeschlagen
   - Bestellstatus: Ausstehend, In Bearbeitung, Aktiv, Storniert, Abgeschlossen
   - Admin-Notizen für jede Bestellung
   - Detail-Ansicht mit allen Kundeninformationen

### 3. **Erfolgsseite nach Zahlung**
   - URL: https://gastro-cms.at/bestellung/erfolg
   - Bestätigungsseite nach erfolgreicher Zahlung
   - Informationen über die nächsten Schritte
   - Kontaktinformationen

---

## 🔧 Technische Details

### Stripe API Keys (LIVE)
```env
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
```

### API Endpoints

#### **gastro-cms-crm** (CRM Dashboard)
1. **POST /api/orders** - Neue Bestellung erstellen
2. **GET /api/orders** - Alle Bestellungen abrufen
3. **PATCH /api/orders** - Bestellung aktualisieren
4. **POST /api/checkout** - Stripe Checkout Session erstellen
5. **POST /api/webhook/stripe** - Stripe Webhooks verarbeiten

### Datenbank-Schema

```prisma
model Order {
  id                    Int      @id @default(autoincrement())
  
  // Restaurant Informationen
  restaurantName        String
  ownerName             String?
  email                 String
  phone                 String?
  address               String?
  postalCode            String?
  city                  String?
  
  // Lieferservice Informationen
  hasDeliveryService    Boolean  @default(false)
  monthlyRevenue        String?
  
  // Domain Informationen
  hasDomain             Boolean  @default(false)
  domainName            String?
  
  // Zusätzliche Informationen
  message               String?
  
  // Stripe Payment
  stripeSessionId       String?  @unique
  stripePaymentIntent   String?
  paymentStatus         String   @default("pending") // pending, paid, failed, refunded
  paidAt                DateTime?
  amount                Float    @default(180.00) // € 180,00 jährlich
  
  // Bestellstatus
  orderStatus           String   @default("pending") // pending, processing, active, cancelled, completed
  activatedAt           DateTime?
  expiresAt             DateTime?
  
  // Admin Notizen
  adminNotes            String?
  
  // Timestamps
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("orders")
}
```

---

## 📋 Workflow

1. **Kunde füllt Bestellformular aus** auf gastro-cms.at/bestellung
2. **Formular wird an CRM gesendet** → Neue Bestellung wird in Datenbank gespeichert
3. **Stripe Checkout Session wird erstellt** → Kunde wird zur Stripe-Zahlungsseite weitergeleitet
4. **Kunde zahlt** mit Kreditkarte, PayPal oder Klarna
5. **Stripe Webhook benachrichtigt CRM** → Bestellung wird als "bezahlt" markiert
6. **Kunde wird auf Erfolgsseite weitergeleitet** → gastro-cms.at/bestellung/erfolg
7. **Admin sieht Bestellung im CRM Dashboard** → dashboard.gastro-cms.at/bestellungen

---

## ⚠️ WICHTIG: Stripe Webhook Setup

Um die Zahlungsbestätigungen zu erhalten, muss ein Stripe Webhook eingerichtet werden:

1. Gehe zu: https://dashboard.stripe.com/webhooks
2. Klicke auf "Add endpoint"
3. **Endpoint URL**: `https://dashboard.gastro-cms.at/api/webhook/stripe`
4. **Events to send**: Wähle:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Kopiere den **Signing secret** (beginnt mit `whsec_...`)
6. Füge ihn zur `.env` Datei hinzu:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_DEIN_WEBHOOK_SECRET
   ```
7. Deploye das CRM neu mit:
   ```bash
   pm2 restart gastro-crm
   ```

---

## 🧪 Testen

### Stripe Test-Karten (nur für Test-Modus)
Für Live-Modus bitte echte Karten verwenden!

- **Erfolgreiche Zahlung**: 4242 4242 4242 4242
- **Fehlgeschlagene Zahlung**: 4000 0000 0000 0002
- Beliebiges Ablaufdatum in der Zukunft
- Beliebiger CVC (3 Ziffern)

---

## 📊 Monitoring

- **Stripe Dashboard**: https://dashboard.stripe.com/payments
- **CRM Dashboard**: https://dashboard.gastro-cms.at/bestellungen
- **PM2 Logs**: `pm2 logs gastro-crm`

---

## 🔄 Updates deployen

```bash
# CRM Updates
cd gastro-cms-crm
npm run build
pm2 restart gastro-crm

# gastro-cms.at Updates
cd gastro-cms-root
npm run build
pm2 restart gastro-cms-root
```

---

## ✅ Status

- ✅ Bestellformular mit Stripe-Integration
- ✅ CRM Dashboard für Bestellungen
- ✅ Erfolgsseite nach Zahlung
- ✅ Datenbank-Schema für Bestellungen
- ✅ API Endpoints für Bestellungen
- ✅ Stripe Checkout Integration
- ⚠️ **Stripe Webhook Setup noch ausstehend** (siehe oben)
- ⏳ Automatische Kundenregistrierung nach Zahlung (TODO)
- ⏳ E-Mail-Benachrichtigungen (TODO)

---

## 🎉 Live URLs

- **Bestellformular**: https://gastro-cms.at/bestellung
- **Erfolgsseite**: https://gastro-cms.at/bestellung/erfolg
- **CRM Dashboard**: https://dashboard.gastro-cms.at/bestellungen
- **Login**: https://dashboard.gastro-cms.at/login
  - E-Mail: office@nextpuls.com
  - Passwort: ComPaq1987!

---

**Erstellt am**: 25. November 2025
**Version**: 1.0
**Status**: ✅ Live & Funktional

