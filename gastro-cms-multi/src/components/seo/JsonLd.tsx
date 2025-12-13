import { Metadata } from 'next'

interface JsonLdProps {
  data: any
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Organization Schema for Restaurant
export function generateOrganizationSchema(settings: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": settings.restaurantName || "Restaurant",
    "description": settings.metaDescription || `Professionelles Restaurant ${settings.restaurantName || ''} mit Online-Bestellung und Lieferservice`,
    "url": process.env.NEXTAUTH_URL || "https://localhost:3000",
    "logo": settings.favicon || "/favicon.ico",
    "image": settings.ogImage || settings.favicon || "/favicon.ico",
    "telephone": settings.phone || "",
    "email": settings.email || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings.address || "",
      "addressLocality": settings.city || "",
      "postalCode": settings.zipCode || "",
      "addressCountry": "AT"
    },
    "geo": settings.latitude && settings.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": settings.latitude,
      "longitude": settings.longitude
    } : undefined,
    "openingHours": settings.openingHours || [],
    "servesCuisine": settings.cuisineType || ["Austrian", "International"],
    "priceRange": settings.priceRange || "€€",
    "acceptsReservations": true,
    "hasDeliveryService": {
      "@type": "DeliveryService",
      "name": `${settings.restaurantName || 'Restaurant'} Lieferservice`,
      "url": process.env.NEXTAUTH_URL + "/frontend"
    },
    "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
    "currenciesAccepted": "EUR"
  }
}

// WebSite Schema for better search appearance
export function generateWebSiteSchema(settings: any) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": settings.metaTitle || settings.restaurantName || "Restaurant",
    "description": settings.metaDescription || `${settings.restaurantName || 'Restaurant'} Management System`,
    "url": process.env.NEXTAUTH_URL || "https://localhost:3000",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": (process.env.NEXTAUTH_URL || "https://localhost:3000") + "/frontend/speisekarte?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": settings.restaurantName || "Restaurant",
      "logo": {
        "@type": "ImageObject",
        "url": settings.favicon || "/favicon.ico"
      }
    }
  }
}

// Breadcrumb Schema for navigation
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": process.env.NEXTAUTH_URL + item.url
    }))
  }
}
