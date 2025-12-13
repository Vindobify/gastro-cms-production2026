# Umgebungsvariablen Übersicht

## Zusammenfassung

**WICHTIG:** Die `.env.local` Dateien werden von Docker Compose über `env_file` geladen, aber die wichtigsten Variablen werden direkt in `docker-compose.local.yml` gesetzt. Daher sind `.env.local` Dateien **optional**, aber können für lokale Entwicklung nützlich sein.

---

## gastro-cms-multi

### ✅ ERFORDERLICH (werden in docker-compose.local.yml gesetzt):
- `DATABASE_URL` - PostgreSQL Verbindungsstring (wird automatisch gesetzt)
- `JWT_SECRET` - Mindestens 32 Zeichen, für JWT-Token (ERFORDERLICH!)
- `NODE_ENV` - Wird automatisch auf `production` gesetzt

### ⚠️ OPTIONAL (aber empfohlen):
- `NEXTAUTH_URL` - Base URL der Anwendung (wird in docker-compose.local.yml gesetzt)
- `gastro_DATABASE_URL` - Alternative DATABASE_URL (Fallback)

### ❌ NICHT ERFORDERLICH:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - E-Mail wird nicht verwendet
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` - Nur wenn Stripe verwendet wird
- `NEXT_PUBLIC_*` - Keine Client-seitigen Variablen erforderlich

### 📝 Empfohlene .env.local:
```env
# ERFORDERLICH
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang

# OPTIONAL
NODE_ENV=production
```

---

## gastro-crm

### ✅ ERFORDERLICH:
- `DATABASE_URL` - PostgreSQL Verbindungsstring (wird automatisch gesetzt)
- `JWT_SECRET` - Mindestens 32 Zeichen (OPTIONAL, hat Fallback)

### ⚠️ OPTIONAL:
- `NEXTAUTH_URL` - Base URL der Anwendung (wird in docker-compose.local.yml gesetzt)
- `STRIPE_SECRET_KEY` - Nur wenn Stripe Connect verwendet wird
- `STRIPE_PUBLISHABLE_KEY` - Nur wenn Stripe Connect verwendet wird
- `STRIPE_WEBHOOK_SECRET` - Nur wenn Stripe Webhooks verwendet werden
- `STRIPE_CLIENT_ID` - Nur wenn Stripe Connect verwendet wird
- `NEXT_PUBLIC_APP_URL` - Nur wenn Stripe Connect verwendet wird

### ❌ NICHT ERFORDERLICH:
- `SMTP_*` - E-Mail wird nicht verwendet
- Andere `NEXT_PUBLIC_*` Variablen

### 📝 Empfohlene .env.local:
```env
# OPTIONAL (hat Fallback)
JWT_SECRET=dein-sehr-langer-geheimer-schlüssel-mindestens-32-zeichen-lang

# OPTIONAL - Nur wenn Stripe verwendet wird
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CLIENT_ID=ca_...
NEXT_PUBLIC_APP_URL=http://crm.gastro.local
```

---

## gastro-cms-root

### ✅ ERFORDERLICH:
- `DATABASE_URL` - PostgreSQL Verbindungsstring (wird automatisch gesetzt, aber OPTIONAL - hat Fallback)

### ⚠️ OPTIONAL:
- `SMTP_HOST` - E-Mail-Server (Standard: `smtp-relay.brevo.com`)
- `SMTP_PORT` - E-Mail-Port (Standard: `587`)
- `SMTP_USER` oder `BREVO_USER` - E-Mail-Benutzer (Standard: `96fdd4001@smtp-brevo.com`)
- `SMTP_PASS` oder `BREVO_PASSWORD` - E-Mail-Passwort (Standard: `zLCrHG9R6Qx4NjEq`)
- `STRIPE_SECRET_KEY` - Nur wenn Stripe verwendet wird (ERFORDERLICH wenn Stripe aktiv)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Nur wenn Stripe verwendet wird
- `CRM_API_URL` oder `NEXT_PUBLIC_CRM_API_URL` - URL zum CRM (Standard: `http://crm.gastro-cms.local`)

### ❌ NICHT ERFORDERLICH:
- `JWT_SECRET` - Wird nicht verwendet
- `NEXTAUTH_URL` - Wird nicht verwendet
- Andere `NEXT_PUBLIC_*` Variablen (außer Stripe)

### 📝 Empfohlene .env.local:
```env
# OPTIONAL - E-Mail (hat Standardwerte)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=96fdd4001@smtp-brevo.com
SMTP_PASS=zLCrHG9R6Qx4NjEq

# OPTIONAL - Stripe (nur wenn verwendet)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OPTIONAL - CRM URL
CRM_API_URL=http://crm.gastro.local
```

---

## Wichtige Hinweise

1. **DATABASE_URL**: Wird automatisch von `docker-compose.local.yml` gesetzt - **NICHT** in `.env.local` setzen!
2. **JWT_SECRET**: 
   - **gastro-cms-multi**: ERFORDERLICH (kein Fallback)
   - **gastro-crm**: OPTIONAL (hat Fallback, aber nicht sicher)
   - **gastro-cms-root**: NICHT ERFORDERLICH
3. **E-Mail**: Nur `gastro-cms-root` verwendet E-Mail (hat Standardwerte)
4. **Stripe**: Nur wenn Stripe-Features aktiviert sind

---

## Aktueller Status

- ✅ `docker-compose.local.yml` setzt alle erforderlichen Variablen automatisch
- ⚠️ `.env.local` Dateien sind **optional** für lokale Entwicklung
- ⚠️ Für Produktion müssen alle Variablen explizit gesetzt werden

---

## Empfehlung

**Für lokale Entwicklung:**
- `.env.local` Dateien sind **nicht erforderlich**, da alles in `docker-compose.local.yml` gesetzt wird
- Optional können `.env.local` Dateien für lokale Tests ohne Docker verwendet werden

**Für Produktion:**
- Alle Variablen müssen explizit gesetzt werden
- `.env.local` Dateien sollten **NICHT** in Git committed werden
- Verwende sichere Secrets-Management-Tools

