# 💳 Stripe-Konfiguration - Wo wird sie verwendet?

## 🎯 Übersicht

Die Stripe-Konfiguration, die Sie im CRM-Einstellungen eingeben, wird **NUR im CRM** verwendet und dient für **Stripe Connect**.

---

## 📍 Verwendung der Stripe-Konfiguration

### 1. **Stripe Connect Account Erstellung** (`gastro-crm/app/api/stripe/connect/route.ts`)
- **Zweck**: Erstellt Stripe Connect Accounts für Restaurants
- **Verwendung**: 
  - Wenn ein Restaurant im Dashboard auf "Stripe verbinden" klickt
  - Das CRM erstellt einen Stripe Express Account für das Restaurant
  - Die `stripeAccountId` wird in der Datenbank gespeichert (Tabelle `tenants`)
- **Benötigte Keys**:
  - `STRIPE_SECRET_KEY` - Für API-Calls zu Stripe
  - `STRIPE_CLIENT_ID` - Für Connect OAuth (optional)
  - `NEXT_PUBLIC_APP_URL` - Für Redirect-URLs

### 2. **Stripe Webhooks** (`gastro-crm/app/api/webhooks/stripe/route.ts`)
- **Zweck**: Empfängt Events von Stripe (z.B. wenn ein Restaurant sein Stripe-Konto aktiviert)
- **Verwendung**:
  - `account.updated` - Aktualisiert den Onboarding-Status in der Datenbank
  - `checkout.session.completed` - Verarbeitet Checkout-Abschlüsse
  - `payment_intent.succeeded` - Verarbeitet erfolgreiche Zahlungen
- **Benötigte Keys**:
  - `STRIPE_SECRET_KEY` - Für Webhook-Verifizierung
  - `STRIPE_WEBHOOK_SECRET` - Für Signatur-Validierung

### 3. **Stripe Account Status Prüfung** (`gastro-crm/app/api/stripe/connect/route.ts` - GET)
- **Zweck**: Prüft ob ein Restaurant sein Stripe-Konto verbunden hat
- **Verwendung**: 
  - Wird von `gastro-cms-multi` aufgerufen (weitergeleitet)
  - Zeigt den Status im Restaurant-Dashboard an

---

## 🔄 Datenfluss

```
1. Restaurant-Besitzer klickt "Stripe verbinden" in gastro-cms-multi
   ↓
2. gastro-cms-multi leitet Request an CRM weiter (POST /api/stripe/connect)
   ↓
3. CRM verwendet STRIPE_SECRET_KEY, um Stripe Connect Account zu erstellen
   ↓
4. CRM speichert stripeAccountId in Datenbank (tenants.stripeAccountId)
   ↓
5. Restaurant-Besitzer wird zu Stripe Onboarding weitergeleitet
   ↓
6. Stripe sendet Webhook an CRM (account.updated)
   ↓
7. CRM aktualisiert stripeOnboardingStatus in Datenbank
   ↓
8. Restaurant kann jetzt Zahlungen empfangen
```

---

## ❌ Was wird NICHT verwendet

### gastro-cms-multi verwendet KEINE Stripe API Keys direkt!
- `gastro-cms-multi` hat **KEINE** Stripe API Keys in `.env.local`
- `gastro-cms-multi` leitet nur Requests an das CRM weiter
- Die Stripe Account IDs werden aus der **gemeinsamen Datenbank** gelesen

### gastro-cms-root verwendet eigene Stripe Keys
- `gastro-cms-root` hat **eigene** Stripe Keys für Checkout-Zahlungen
- Diese sind **separat** von der CRM-Konfiguration
- Wird für Bestellungen auf der Landing-Page verwendet

---

## ✅ Zusammenfassung

**Die Stripe-Konfiguration im CRM wird verwendet für:**

1. ✅ **Stripe Connect Account Erstellung** - Erstellt Accounts für Restaurants
2. ✅ **Stripe Webhook Verarbeitung** - Empfängt Events von Stripe
3. ✅ **Account Status Prüfung** - Prüft ob Restaurant Stripe verbunden hat

**Die Stripe-Konfiguration wird NICHT verwendet für:**

1. ❌ Direkte Zahlungen in `gastro-cms-multi` (Restaurants haben eigene Stripe Accounts)
2. ❌ Checkout-Zahlungen in `gastro-cms-root` (hat eigene Keys)

---

## 🔧 Wichtige Hinweise

1. **In Docker**: Die Stripe-Daten müssen in `docker-compose.local.yml` als Environment-Variablen gesetzt werden, da `.env.local` zur Laufzeit nicht beschreibbar ist.

2. **Webhook URL**: Die Webhook-URL in Stripe Dashboard muss auf `http://crm.gastro.local/api/webhooks/stripe` zeigen (oder die Produktions-URL).

3. **Stripe Connect**: Jedes Restaurant bekommt seinen eigenen Stripe Connect Account. Die Platform Keys (die Sie im CRM eingeben) werden nur verwendet, um diese Accounts zu erstellen.

