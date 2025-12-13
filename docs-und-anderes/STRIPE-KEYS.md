# 🔐 Stripe API Keys - Gastro CMS 3.0

## ⚠️ LIVE KEYS (NICHT VERGESSEN ZURÜCKZUSETZEN!)

```env
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi
```

### Webhook Endpoint (LIVE):
```
https://gastro-cms.at/api/webhook/stripe
```

---

## 🧪 TEST KEYS (Aktuell aktiv für Testing)

```env
STRIPE_SECRET_KEY=sk_test_51SUvV4A2kdfaPqbPLTWbzLoeZqNRzFs5pRoCFf7dT1h2JrAgvZq72bzjdCXuYe9mPgAvo4kLFGldMNQyCgaEBNDk00ezrYC3TZ
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SUvV4A2kdfaPqbPWOazXnxKmH1YepxjsT5ZtqkcCSVZ0HmtKSPhXMEaxheWBmmGlc14noYmVo35ooLvt56USakp00kgzsOAEE
STRIPE_WEBHOOK_SECRET=whsec_OXwNh8WLB8zhRCoWPvVpaUifx1JBgPMf
```

### Webhook Endpoint (TEST):
```
https://gastro-cms.at/api/webhook/stripe
```

---

## 📋 Test-Karten

### Erfolgreiche Zahlung:
- **Karte**: 4242 4242 4242 4242
- **Ablaufdatum**: Beliebig in Zukunft (z.B. 12/25)
- **CVC**: Beliebig (z.B. 123)
- **PLZ**: Beliebig

### Abgelehnte Zahlung:
- **Karte**: 4000 0000 0000 0002

### 3D Secure erforderlich:
- **Karte**: 4000 0027 6000 3184

---

## 🔄 Zurück zu LIVE wechseln

Wenn Testing abgeschlossen, einfach die LIVE Keys wieder einsetzen:

```bash
# Auf dem Server
ssh root@72.61.190.70
cd /var/www/gastro-cms-root
nano .env
# Keys ersetzen
npm run build
pm2 restart gastro-cms-root
```

---

**Erstellt am**: 25. November 2025

