# Gastro CMS Multi - Multitenant System Plan

## 1. Übersicht und Ziel
Das Ziel ist es, das bestehende **Gastro CMS 3.0** (Single Tenant) in ein **Multitenantes System** (`gastro-cms-multi`) zu verwandeln, das tausende von Restaurants (Tenants) über eine einzige Codebasis bedienen kann. Verwaltet wird alles über das **Gastro CMS CRM**.

### Die Architektur
Wir nutzen eine **Shared Database Architektur**.
*   **Eine Next.js App (`gastro-cms-multi`)**: Bedient alle Kunden-Websites (Frontend) und deren Restaurant-Dashboards.
*   **Eine CRM App (`gastro-cms-crm`)**: Bedient den Super-Admin (Dich). Hier legst du Restaurants an.
*   **Eine Datenbank (PostgreSQL)**: Beide Apps greifen auf dieselbe Datenbank zu.

```mermaid
graph TD
    A[Super Admin (Du)] -->|Verwaltet| B(Gastro CMS CRM)
    C[Endkunde (Hungriger)] -->|Besucht domain.at| D(Gastro CMS Multi)
    E[Restaurant Besitzer] -->|Besucht domain.at/dashboard| D
    B -->|Schreibt| F[(PostgreSQL Datenbank)]
    D -->|Liest/Schreibt| F
```

## 2. Datenbank Schema (Der Kern)

Wir erweitern das Schema von `gastro-cms`. Das wichtigste neue Konzept ist der `Tenant` (Das Restaurant).

### Neues Model: `Tenant`
Dieses Model wird primär vom CRM verwaltet.

```prisma
model Tenant {
  id              String   @id @default(cuid())
  name            String   // Name des Restaurants
  domain          String   @unique // Hauptdomain (z.B. pizzeria-mario.at)
  subdomain       String?  @unique // Fallback (z.B. mario.gastro-cms.io)
  isActive        Boolean  @default(true)
  plan            String   @default("STANDARD")
  
  // Kontaktdaten des Inhabers
  ownerName       String?
  email           String
  phone           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relationen zu allen Daten des Restaurants
  products        Product[]
  categories      Category[]
  users           User[]
  orders          Order[]
  settings        RestaurantSettings? // Jedes Restaurant hat eigene Settings
  // ... alle anderen Models
}
```

### Anpassung bestehender Models
Nahezu JEDES Model aus `gastro-cms` bekommt ein Feld `tenantId`.

**Beispiel Product:**
```prisma
model Product {
  id          Int      @id @default(autoincrement())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  name        String
  // ... restliche Felder
  
  @@index([tenantId]) // WICHTIG für Performance
}
```

**Beispiel User:**
User sind auch an einen Tenant gebunden (Kundenkonten gehören zu einem Restaurant).
```prisma
model User {
  id          Int      @id @default(autoincrement())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  email       String
  // ...
  
  @@unique([tenantId, email]) // Email ist nur pro Restaurant unique!
}
```

## 3. Die Applikation: `gastro-cms-multi`

### Middleware Routing (Die Magie)
In `src/middleware.ts` prüfen wir jeden Request.

1.  Hostname auslesen (z.B. `pizzeria-mario.at`).
2.  In der DB (oder Redis Cache für Speed) prüfen: Zu welcher `tenantId` gehört diese Domain?
3.  Die `tenantId` wird als Header (`x-tenant-id`) an die App weitergegeben.

### Data Access Layer
Wir dürfen NIEMALS vergessen, nach `tenantId` zu filtern.
Statt `prisma.product.findMany()` schreiben wir Wrapper-Funktionen oder nutzen Prisma Extensions, die automatisch `where: { tenantId: currentTenantId }` hinzufügen.

## 4. Das CRM: `gastro-cms-crm`

Das CRM wird die Schaltzentrale.
1.  Wir verbinden das CRM mit derselben PostgreSQL Datenbank wie die Multi-App.
2.  Wir erstellen ein Formular "Neues Restaurant anlegen".
3.  Eingabefelder:
    *   Restaurant Name
    *   Domain (z.B. `schnitzel-kaiser.at`)
    *   Admin User (Email / Passwort für den Restaurant-Besitzer)
    
    Daten zum Restaurant
    *   Alle Einstellungen Felder zum Restaurant.
        Diese Daten sollen beim erstellen des Restaurants automatisch in deren Gastro CMS eingefügt werden.
4.  **Action**:
    *   Legt `Tenant` Record an.
    *   Legt `User` Record ( Rolle: RESTAURANT_MANAGER) für diesen Tenant an.
    *   Legt initiale `RestaurantSettings` an.
    *   Gastro CMS Admin (ICH) soll sich in alle Lieferservices (Restaurants) einloggen können mit:
        E-Mail: office@nextpuls.com  Passwort: ComPaq1987! | Egal welches Restaurant erstellt wird.
        Ich bin Administrator von allen Plattformen.

## 5. Implementierungs-Plan

### Phase 1: Setup & Schema (Heute)
1.  [x] `gastro-cms` Dateien in `gastro-cms-multi` kopieren.
2.  [x] Bereinigen (unnötige lokale Files löschen).
3.  [x] `prisma/schema.prisma` massiv überarbeiten (Tenant Model & Relations adden).
4.  [ ] Datenbank initialisieren und migrieren.

### Phase 2: Middleware & Core (Morgen/Demnächst)
1.  [x] Middleware schreiben, die Domains erkennt.
2.  [x] Hilfsfunktionen schreiben (`getTenant()`), die auf der Serverseite den aktuellen Tenant holen.

### Phase 3: Refactoring der App
1.  [x] Alle `findMany`, `findFirst`, `create` Calls suchen und `tenantId` hinzufügen.
2.  [x] Authentication (NextAuth/Jose) anpassen, damit es pro Tenant funktioniert.

### Phase 3.5: System Tests & Lokale Entwicklung ✅ ABGESCHLOSSEN
1.  [x] Docker PostgreSQL Datenbank aufgesetzt
2.  [x] Prisma Schema migriert (`npx prisma db push`)
3.  [x] 3 Test-Tenants angelegt (CRM Platform, Pizzeria Mario, Sushi Wien)
4.  [x] `.env.local` Problem gelöst (Cookie-basierte Auth funktioniert)
5.  [x] Login funktioniert mit Session-Persistenz
6.  [x] Build erfolgreich (`npm run build`)
7.  [x] Cart API mit `tenantId` gefixt
8.  [x] Extras API mit `tenantId` gefixt

### Phase 3.6: API Routes Multitenant-Refactoring 🔄 IN ARBEIT
**Bereits refactoriert:**
- [x] `/api/auth/login` - Login mit Cookie-Session
- [x] `/api/auth/session` - Session-Validierung
- [x] `/api/settings` - Restaurant-Einstellungen
- [x] `/api/seo-settings` - SEO-Einstellungen
- [x] `/api/categories` - Kategorien
- [x] `/api/products` - Produkte
- [x] `/api/orders` - Bestellungen
- [x] `/api/orders/[id]` - Einzelne Bestellung
- [x] `/api/cart` - Warenkorb
- [x] `/api/extras` - Extras/Zusätze
- [x] `/api/coupons` - Gutscheine
- [x] `/api/customers` - Kunden
- [x] `/api/delivery-drivers` - Lieferfahrer

**Noch zu refactorieren:**
- [x] `/api/allergens` - Allergene (statische Liste, kein tenantId nötig)
- [ ] `/api/orders/[code]/status` - Bestellstatus (öffentlich)
- [ ] Alle anderen API Routes prüfen

### Phase 3.7: UX & Echtzeit-Features ✅ ABGESCHLOSSEN!
**Warenkorb-Verbesserungen:**
- [x] Warenkorb nach erfolgreicher Bestellung leeren
- [x] Toast-Benachrichtigungen beim Hinzufügen zum Warenkorb
- [x] Warenkorb-Overlay/Sidebar vor Checkout (✅ Komponente + Header-Integration)
- [x] Warenkorb-Icon mit Item-Count Badge (✅ Im Header integriert)

**Echtzeit-Bestellungen:**
- [x] Server-Sent Events (SSE) Endpoint (`/api/orders/live`)
- [x] Dashboard: Live-Updates mit Polling (alle 5 Sekunden)
- [x] Sound-Benachrichtigung bei neuer Bestellung (✅ Web Audio API Beep)
- [x] Toast-Benachrichtigung bei neuer Bestellung
- [x] Browser-Benachrichtigung (falls Berechtigung erteilt)
- [x] Bestellbestätigungsseite: Live-Updates des Bestellstatus
- [x] Push-Benachrichtigungen für Restaurant-Manager
- [x] `/api/orders/[code]/status` tenant-sicher (öffentlich)

**Weitere UX-Verbesserungen:**
- [x] Loading States für alle API-Calls
- [x] Error Handling & User Feedback (Toast-System)
- [x] Optimistic UI Updates

### Phase 4: CRM Verbindung
1.  [x] `gastro-cms-crm` Schema anpassen, damit es Zugriff auf die `Tenant` Tabelle hat.
2.  [x] "Create Restaurant" Flow im CRM bauen.

### Phase 5: Stripe
1.  [x] Stripe API Keys in CRM einrichten.
2.  [x] Stripe Webhooks in CRM einrichten.
3.  [x] Stripe Checkout Flow in Multi-App implementieren.

### Phase 6: Push Notifications via eigenem Server
1.  [ ] Push Notifications via eigenem Server implementieren

### Phase 7: PWA
1.  [ ] PWA Implementierung inkl. Push Notifications (Multitenant)

### Phase 8: Deployment
1.  [ ] Deployment lokal in einem Docker um zu testen

### Phase 9: Deployment
1.  [ ] Deployment auf eigenem VPS Server via Docker

Infos dazu:
Ich habe bereits eine Website erstellt für gastro-cms.at - @gastro-cms-root Ordner. Das ist meine Firmenwebsite. (Hat angeblich einen Virus??)
Ich habe eine eigene Domain wo wir eine Landingpage erstellen können
und von wo wir die App deployen können. Auf dieser LandingPage sollen  dann die Restaurants zu sehen sein.
Klickt man auf ein Restaurant, soll man auf die Restaurant-Website gelangen im neuem Tab.

Restaurant Card soll wie folgt aussehen:
Logo
Restaurant Name
Öffnungszeiten
Adresse, Postleitzahl und Ort
Link zur Restaurant Website

Die Domain wäre dazu: https://www.restaurant-lieferservice.online

CRM Verwaltung: CRM Verwaltung zum anlegen der Restaurants wie geplant auf https://crm.restaurant-lieferservice.online

Lokale Domain für CRM: http://crm.restaurant-lieferservice.localhost
LandingPage aller Restaurants: http://restaurant-lieferservice.localhost



Lokale Domains bereits eingetragen in Windows host Datei:


landingpage.local
crm.restaurant-lieferservice.localhost
pizzeria1140.local
gastro-cms.local


## Deployment
Deploy Domains:

https://crm.gastro-cms.at                 |   CRM
https://www.gastro-cms.at                 |   Gastro CMS 3.0 Hauptwebsite

Gastro CMS muss ab sofort für jede Domain funktionieren die ich dann in das neue Restaurant eintrage.