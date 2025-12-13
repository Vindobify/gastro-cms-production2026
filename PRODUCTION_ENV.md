# 🔐 Production Environment-Variablen

## 📋 Übersicht

Diese Datei dokumentiert alle erforderlichen Environment-Variablen für Production-Deployment.

**WICHTIG**: Diese Datei enthält **KEINE echten Secrets**. Trage die tatsächlichen Werte in Coolify ein!

---

## 🏠 gastro-cms-root (Landing Page)

### ✅ ERFORDERLICH

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public
```

### ⚠️ EMPFOHLEN

```env
# SMTP/Brevo (für E-Mail-Versand)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq
SMTP_FROM=office@gastro-cms.at

# CRM URL (für Formular-Weiterleitung)
CRM_API_URL=https://crm.gastro-cms.at
NEXT_PUBLIC_CRM_API_URL=https://crm.gastro-cms.at
```

### 🔐 OPTIONAL (nur wenn Stripe verwendet wird)

```env
# Stripe LIVE Keys (nicht TEST!)
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi
```

### 📊 OPTIONAL (Analytics)

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🏢 gastro-crm (CRM-System)

### ✅ ERFORDERLICH

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang-ERFORDERLICH
NEXTAUTH_URL=https://crm.gastro-cms.at
```

### 🔐 ERFORDERLICH (für Stripe Connect)

```env
# Stripe LIVE Keys (nicht TEST!)
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SUvUvAOr7EPlltydhV9UILlfsB6GVHaALQsEMU5tMOByNm76RdirRyQF62noUdciBmZzNMV1F2DQ0sjkQusDZEq00Tk7doRV0
STRIPE_WEBHOOK_SECRET=whsec_T6Pl8UjEENn1vDmbP4jJEL2WP2B3DOzi
NEXT_PUBLIC_APP_URL=https://crm.gastro-cms.at
```

### ⚠️ OPTIONAL (für erweiterte Connect OAuth Features)

```env
STRIPE_CLIENT_ID=ca_... # Nur wenn OAuth verwendet wird
```

---

## 🏪 gastro-cms-multi (Multi-Tenant)

### ✅ ERFORDERLICH

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/gastro_cms_multi?schema=public
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang-ERFORDERLICH
```

**WICHTIG**: `JWT_SECRET` muss **identisch** mit `gastro-crm` sein!

### ⚠️ EMPFOHLEN

```env
# NextAuth URL (Fallback, wird dynamisch pro Tenant gesetzt)
NEXTAUTH_URL=https://www.gastro-cms.at

# CRM URL (für Stripe Connect Weiterleitung)
CRM_URL=https://crm.gastro-cms.at
```

### 📧 OPTIONAL (für E-Mail-Benachrichtigungen)

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq
SMTP_FROM=office@gastro-cms.at
```

---

## 🔑 Wichtige Hinweise

### JWT_SECRET

- **MUSS** mindestens 32 Zeichen lang sein
- **MUSS** für `gastro-cms-multi` und `gastro-crm` **identisch** sein
- **SOLLTE** zufällig und sicher generiert werden

**Beispiel-Generierung:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### DATABASE_URL Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Beispiel:**
```
postgresql://gastrocms:SecurePassword123@db.example.com:5432/gastro_cms_multi?schema=public
```

### Stripe Keys

- **LIVE Keys** für Production verwenden (nicht TEST!)
- **Webhook Secret** muss für den Webhook-Endpoint konfiguriert werden
- **Webhook URL**: `https://crm.gastro-cms.at/api/webhooks/stripe`

### Domain-Konfiguration

- **gastro-cms-root**: `https://www.gastro-cms.at`
- **gastro-crm**: `https://crm.gastro-cms.at`
- **gastro-cms-multi**: Wildcard `*.gastro-cms.at` oder einzelne Domains

---

## 🔒 Sicherheit

### Best Practices

1. ✅ **Niemals** Secrets in Git committen
2. ✅ Verwende **Coolify Secrets** für sensible Daten
3. ✅ Rotiere Secrets regelmäßig
4. ✅ Verwende starke Passwörter
5. ✅ Aktiviere **2FA** für alle Accounts
6. ✅ Verwende **HTTPS** (SSL/TLS) für alle Domains

### Secrets Rotation

Empfohlene Rotation:
- **JWT_SECRET**: Alle 90 Tage
- **Database Passwords**: Alle 180 Tage
- **Stripe Keys**: Bei Kompromittierung sofort

---

## 📝 Checkliste

Vor Production-Deployment:

- [ ] Alle ERFORDERLICHEN Variablen gesetzt
- [ ] JWT_SECRET für multi und crm identisch
- [ ] DATABASE_URL korrekt formatiert
- [ ] LIVE Stripe Keys verwendet (nicht TEST!)
- [ ] Domains korrekt konfiguriert
- [ ] SSL/TLS aktiviert
- [ ] Backups konfiguriert
- [ ] Monitoring aktiviert

---

**Erstellt am**: 2025-01-12
**Version**: 1.0

