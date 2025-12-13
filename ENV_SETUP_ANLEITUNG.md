# 📋 Environment-Variablen Setup-Anleitung

## ✅ Zusammenfassung

**JA, die Stripe-Daten im CRM werden für gastro-cms-multi verwendet!**

Wenn Sie im CRM die Stripe-Daten eingeben, können Restaurants ihr Stripe Express-Konto erstellen/verbinden.

---

## 🔧 Wichtige Informationen zu Docker

### Problem:
- Im CRM-Interface eingegebene Stripe-Daten werden in `.env.local` geschrieben
- **In Docker funktioniert das NICHT**, weil `.env.local` Teil des Images ist und zur Laufzeit nicht beschreibbar ist

### Lösung:
**Für Docker müssen die Stripe-Daten in `docker-compose.local.yml` aktiv gesetzt werden!**

---

## 📝 Was muss wo eingetragen werden?

### 1. **gastro-cms-multi/.env.local**
✅ **ERFORDERLICH:**
- `JWT_SECRET` - Mindestens 32 Zeichen

✅ **OPTIONAL (haben Standardwerte):**
- `CRM_URL` - Für Stripe Connect Weiterleitung
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Für E-Mails
- `BREVO_USER`, `BREVO_PASSWORD` - Alternative zu SMTP_USER/SMTP_PASS

### 2. **gastro-crm/.env.local**
✅ **EMPFOHLEN:**
- `JWT_SECRET` - Mindestens 32 Zeichen

⚠️ **WICHTIG für Stripe Connect:**
- `STRIPE_SECRET_KEY` - **MUSS in docker-compose.local.yml gesetzt werden (nicht auskommentiert!)**
- `STRIPE_WEBHOOK_SECRET` - **MUSS in docker-compose.local.yml gesetzt werden**
- `STRIPE_CLIENT_ID` - **MUSS in docker-compose.local.yml gesetzt werden**
- `NEXT_PUBLIC_APP_URL` - **MUSS in docker-compose.local.yml gesetzt werden**

### 3. **gastro-cms-root/.env.local**
✅ **ERFORDERLICH (haben Standardwerte):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Für E-Mails
- `BREVO_USER`, `BREVO_PASSWORD` - Alternative zu SMTP_USER/SMTP_PASS

✅ **OPTIONAL:**
- `CRM_API_URL`, `NEXT_PUBLIC_CRM_API_URL` - Für Formular-Weiterleitung
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Für Checkout-Zahlungen
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` - Für Google Analytics

---

## 🐳 Docker Setup (docker-compose.local.yml)

### **crm Service - Stripe Configuration:**

**WICHTIG:** Entfernen Sie die `#` Zeichen und tragen Sie Ihre Stripe-Daten ein:

```yaml
crm:
  environment:
    # ... andere Variablen ...
    STRIPE_SECRET_KEY: sk_test_... # Ihre Stripe Secret Key hier
    STRIPE_WEBHOOK_SECRET: whsec_... # Ihr Stripe Webhook Secret hier
    STRIPE_CLIENT_ID: ca_... # Ihr Stripe Client ID hier
    STRIPE_PUBLISHABLE_KEY: pk_test_... # Optional
    NEXT_PUBLIC_APP_URL: http://crm.gastro.local # Bereits aktiv!
```

### **multi Service - SMTP/Brevo (optional):**

Die SMTP-Daten können in `.env.local` bleiben, da sie Standardwerte haben. Falls Sie sie überschreiben möchten:

```yaml
multi:
  environment:
    # ... andere Variablen ...
    SMTP_HOST: smtp-relay.brevo.com
    SMTP_PORT: 587
    SMTP_USER: 96fdd4001@smtp-brevo.com
    SMTP_PASS: zLCrHG9R6Qx4NjEq
    SMTP_FROM: office@gastro-cms.at
    CRM_URL: http://crm.gastro.local
```

### **root Service - SMTP/Brevo & Stripe (optional):**

Die SMTP-Daten können in `.env.local` bleiben. Falls Sie Stripe Checkout verwenden:

```yaml
root:
  environment:
    # ... andere Variablen ...
    SMTP_HOST: smtp-relay.brevo.com
    SMTP_PORT: 587
    SMTP_USER: 96fdd4001@smtp-brevo.com
    SMTP_PASS: zLCrHG9R6Qx4NjEq
    SMTP_FROM: office@gastro-cms.at
    STRIPE_SECRET_KEY: sk_test_... # Nur wenn Stripe Checkout verwendet wird
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_... # Nur wenn Stripe Checkout verwendet wird
```

---

## ✅ Checkliste

### Für Stripe Connect (Restaurants können Stripe verbinden):

- [ ] `STRIPE_SECRET_KEY` in `docker-compose.local.yml` (crm service) **OHNE #** eintragen
- [ ] `STRIPE_WEBHOOK_SECRET` in `docker-compose.local.yml` (crm service) **OHNE #** eintragen
- [ ] `STRIPE_CLIENT_ID` in `docker-compose.local.yml` (crm service) **OHNE #** eintragen
- [ ] `NEXT_PUBLIC_APP_URL` ist bereits aktiv gesetzt ✅

### Für E-Mails (SMTP/Brevo):

- [ ] SMTP-Daten sind bereits in `.env.local` Dateien mit Standardwerten ✅
- [ ] Optional: In `docker-compose.local.yml` überschreiben (falls gewünscht)

### Für Stripe Checkout (gastro-cms-root):

- [ ] Nur wenn Stripe Checkout auf der Landing-Page verwendet wird
- [ ] `STRIPE_SECRET_KEY` und `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `docker-compose.local.yml` (root service) eintragen

---

## 🎯 Zusammenfassung

**Die auskommentierten Variablen (#) sind NICHT aktiv!**

**Für Docker müssen Sie:**
1. ✅ Stripe-Daten für CRM in `docker-compose.local.yml` **aktiv setzen** (ohne #)
2. ✅ SMTP-Daten können in `.env.local` bleiben (haben Standardwerte)
3. ✅ Nach Änderungen: Container neu starten (`docker-compose restart crm`)

**Die Stripe-Daten im CRM-Interface funktionieren nur für lokale Entwicklung ohne Docker!**

