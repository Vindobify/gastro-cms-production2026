## SEO Konzept

* `sitemap.xml` (dynamisch, inkl. Produkte, Kategorien, Blog, Restaurantseiten)
* **Google My Business**: automatisch generiertes `LocalBusiness` Schema aus den Restaurant-Einstellungen
* **Liefergebiete**: SEO-optimiert aus Dashboard pflegbar → sowohl in der `sitemap.xml` als auch im `Schema.org`

Hier ist die fertige **MD-Datei**:

---

````markdown
# SEO-Konzept für Gastro CMS 3.0

**Version:** 1.0  
**Stand:** August 2025  
**System:** Gastro CMS 3.0 (Next.js + Prisma + MySQL)  
**Ziel:** Maximale Sichtbarkeit bei Google (organisch & Google Maps/Business) durch automatische SEO-Generierung aus den Restaurant-Daten.

---

## 1. Grundprinzipien

1. **Automatisierung:** SEO-Daten werden direkt aus den Restaurant-Einstellungen und Entitäten (Produkte, Kategorien, Blog) generiert.  
2. **Sofortige Indexierung:** Jeder neue Inhalt (Produkt, Blog, Deal) wird automatisch in die Sitemap eingetragen und über die Google Indexing API gepusht.  
3. **Schema.org Integration:**  
   - Global: `Restaurant` / `LocalBusiness`  
   - Produkte: `Product` + `Offer`  
   - Jobs (optional): `JobPosting`  
4. **Liefergebiete:** Werden explizit in den SEO-Daten gepflegt (Schema.org + sichtbare Landingpages).  
5. **Google My Business:** Alle relevanten Daten werden automatisch als strukturierte Daten (`LocalBusiness`) ausgespielt.

---

## 2. Restaurant SEO-Felder im Dashboard

### Global Settings (Tab „SEO“)
- Meta Title (max. 60 Zeichen)  
- Meta Description (max. 160 Zeichen)  
- Canonical URL (optional, Standard = Domain)  
- Open Graph Image (Upload)  
- Favicon + App Icon UPLOAD

### Restaurant Settings (für Business Schema)
- Aus meinen Einstellungen Dashboard

---

## 3. Sitemap.xml

**Pflicht-Inhalte in der Sitemap:**
- `/` (Startseite Restaurant)  
- `/speisekarte` (Übersicht)  
- `/kategorie/[slug]` (alle Kategorien)  
- `/produkt/[slug]` (alle Produkte) Keine Produkt Unterseiten

**Beispiel Next.js Route `/sitemap.xml/route.ts`:**
```ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://DOMAINNAME-AUTOMATISCH"; Domain muss automatisch erkannt werden.

  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  const blog = await prisma.blogPost.findMany();
  const delivery = await prisma.deliveryArea.findMany();

  const urls = [
    `${base}/`,
    `${base}/speisekarte`,
    ...categories.map(c => `${base}/kategorie/${c.slug}`),
    ...products.map(p => `${base}/produkt/${p.slug}`),
    ...blog.map(b => `${base}/blog/${b.slug}`),
    `${base}/kontakt`,
    ...delivery.map(d => `${base}/lieferung/${d.postcode}`)
  ];

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       ${urls.map(u => `<url><loc>${u}</loc></url>`).join("")}
     </urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}
````

---

## 4. Schema.org Markup

### LocalBusiness / Restaurant (global) aus meinen Einstellungen Dashboard

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Pizzeria Da Corrado",
  "image": "https://www.DOMAIN-AUTOMATISCH-ERKENN/logo.png",
  "telephone": "+43 1 234567",
  "email": "info@dacorrado.at",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstraße 5",
    "postalCode": "1140",
    "addressLocality": "Wien",
    "addressCountry": "AT"
  },
  "openingHours": [
    "Mo-Fr 11:00-23:00",
    "Sa-So 12:00-23:00"
  ],
  "servesCuisine": ["Italienisch", "Pizza", "Pasta"],
  "areaServed": [
    { "@type": "Place", "postalCode": "1140" },
    { "@type": "Place", "postalCode": "1150" }
  ],
  "url": "https://DOMAIN-AUTOMATISCH-ERKENNEN"
}
```

### Product + Offer (pro Gericht)

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Pizza Margherita",
  "image": "https://www.DOMAIN-AUTOMATISCH-ERKENN/uploads/margherita.jpg",
  "description": "Knusprige Pizza mit Tomaten, Mozzarella und frischem Basilikum.",
  "offers": {
    "@type": "Offer",
    "price": "8.90",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "eligibleRegion": [
      { "@type": "Place", "postalCode": "1140" },
      { "@type": "Place", "postalCode": "1150" }
    ]
  }
}
```

---

## 5. Liefergebiets-SEO

* Dashboard: Eingabe der Postleitzahlen im Tab „Lieferung“.
* Automatische Landingpages: Postleitzahlen aus Dashboard

  * `/lieferung/1140` → „Pizza bestellen in 1140 Wien“
  * `/lieferung/1150` → „Lieferung nach 1150 Wien – dein Lieblingsrestaurant“
* Jede Seite erhält:

  * Eigenen Title + Meta Description
  * Interne Verlinkung von der Speisekarte („Liefern wir in dein Gebiet?“ → Auswahl PLZ)
  * Schema.org `areaServed` pro Seite

---

## 6. Google My Business (GMB)

* GMB-Profil wird über **LocalBusiness-Schema** unterstützt.
* Daten (Name, Adresse, Telefon, Öffnungszeiten) kommen direkt aus den Dashboard-Einstellungen.
* Option: Export-Funktion (CSV/JSON) für manuelle Uploads in GMB.
* Ziel: Google crawlt `LocalBusiness`-Schema → Daten automatisch übernommen in Maps/Knowledge Panel.

---

## 7. Google Indexing API

* Jede Änderung an:

  * Produkten
  * Kategorien
  * Blogposts
  * Liefergebieten
    triggert einen **POST** an die Indexing API → innerhalb von 24h sichtbar.

```ts
await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: JSON.stringify({
    url: `https://www.DOMAIN-AUTOMATISCH-ERKENN/produkt/${slug}`,
    type: "URL_UPDATED"
  })
});
```

---

## 8. Dashboard-Features für SEO

* Globaler „SEO“-Tab im Admin
* SEO-Tab pro Kategorie/Produkt/Blog
* Vorschau: Google Snippet Preview (Title/Description, Pixel-Breite)
* OG/Twitter Card Preview
* Automatische `sitemap.xml`
* Automatische `robots.txt` (Disallow: /dashboard, Allow: /)
* Schema.org Generator (Dropdown: LocalBusiness, Product, Offer, JobPosting)

---

## 9. Checkliste

* [ ] `sitemap.xml` generiert dynamisch (Produkte, Kategorien, Blog, Liefergebiete)
* [ ] `robots.txt` vorhanden
* [ ] `LocalBusiness` Schema aus Restaurant-Einstellungen
* [ ] `Product + Offer` Schema pro Gericht
* [ ] `areaServed` Schema für Liefergebiete
* [ ] SEO-Tab im Dashboard implementiert
* [ ] Indexing API eingebaut
* [ ] Consent Mode 2.0 aktiv (für Analytics/Ads)
* [ ] GMB Daten in Schema.org automatisch gepflegt

---

## 10. Fazit

Mit dieser Umsetzung ist Gastro CMS 3.0 nicht nur **DSGVO-konform**, sondern auch **SEO-mäßig voll optimiert**:
Restaurants profitieren automatisch von **Google Maps Sichtbarkeit, Google Jobs, organischer Suche und regionalen Landingpages** – ohne dass sie sich mit SEO beschäftigen müssen.

```