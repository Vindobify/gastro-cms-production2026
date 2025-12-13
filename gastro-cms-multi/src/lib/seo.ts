import { absoluteUrl } from './url-server';

interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  openingHours?: string;
  priceRange?: string;
  cuisine?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
}

// Generate LocalBusiness Schema.org structured data
export function generateLocalBusinessSchema(settings: RestaurantSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": settings.restaurantName,
    "description": settings.description || `${settings.restaurantName} - Frische Küche mit Lieferservice`,
    "url": absoluteUrl('/'),
    "telephone": settings.phone,
    "email": settings.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings.address,
      "addressLocality": settings.city,
      "postalCode": settings.postalCode,
      "addressCountry": "AT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      // These would ideally come from settings or be geocoded
      "latitude": "48.2082",
      "longitude": "16.3738"
    },
    "openingHours": settings.openingHours || "Mo-Su 11:00-22:00",
    "priceRange": settings.priceRange || "€€",
    "servesCuisine": settings.cuisine || "International",
    "hasMenu": absoluteUrl('/speisekarte'),
    "acceptsReservations": true,
    "takeaway": true,
    "delivery": true,
    "paymentAccepted": ["Cash", "Credit Card", "PayPal"],
    "currenciesAccepted": "EUR"
  };
}

// Generate Product Schema.org structured data
export function generateProductSchema(product: Product, settings: RestaurantSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image ? absoluteUrl(product.image) : undefined,
    "category": product.category.name,
    "brand": {
      "@type": "Brand",
      "name": settings.restaurantName
    },
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": settings.restaurantName
      }
    }
  };
}

// Generate Menu Schema.org structured data
export function generateMenuSchema(categories: Category[], settings: RestaurantSettings) {
  // Ensure categories is an array
  const categoryArray = Array.isArray(categories) ? categories : [];
  
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": `${settings.restaurantName} - Speisekarte`,
    "description": "Unsere komplette Speisekarte mit frischen Gerichten",
    "url": absoluteUrl('/speisekarte'),
    "provider": {
      "@type": "Restaurant",
      "name": settings.restaurantName
    },
    "hasMenuSection": categoryArray.map(category => ({
      "@type": "MenuSection",
      "name": category.name,
      "description": category.description,
      "url": absoluteUrl(`/kategorie/${category.slug}`)
    }))
  };
}

// Generate BreadcrumbList Schema.org structured data
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  // Ensure breadcrumbs is an array
  const breadcrumbArray = Array.isArray(breadcrumbs) ? breadcrumbs : [];
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbArray.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": absoluteUrl(crumb.url)
    }))
  };
}

// Generate FAQ Schema.org structured data
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  // Ensure faqs is an array
  const faqArray = Array.isArray(faqs) ? faqs : [];
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqArray.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate default SEO meta tags
export function generateDefaultSEO(settings: RestaurantSettings) {
  return {
    title: `${settings.restaurantName} - Frische Küche mit Lieferservice`,
    description: `Bestellen Sie bei ${settings.restaurantName} in ${settings.city}. Frische Küche, schnelle Lieferung. Jetzt online bestellen!`,
    keywords: `Restaurant, Lieferservice, ${settings.city}, ${settings.cuisine || 'Essen'}, Online bestellen, ${settings.restaurantName}`,
    ogImage: absoluteUrl('/uploads/og-image.jpg') // Default OG image
  };
}

// Generate category-specific SEO
export function generateCategorySEO(category: Category, settings: RestaurantSettings) {
  return {
    title: `${category.name} - ${settings.restaurantName}`,
    description: category.description || `Entdecken Sie unsere ${category.name} bei ${settings.restaurantName}. Frisch zubereitet und schnell geliefert.`,
    canonical: `/kategorie/${category.slug}`,
    breadcrumbs: [
      { name: 'Startseite', url: '/' },
      { name: 'Speisekarte', url: '/speisekarte' },
      { name: category.name, url: `/kategorie/${category.slug}` }
    ]
  };
}

// Generate product-specific SEO
export function generateProductSEO(product: Product, settings: RestaurantSettings) {
  return {
    title: `${product.name} - ${settings.restaurantName}`,
    description: `${product.description} Jetzt bei ${settings.restaurantName} bestellen. Preis: €${product.price.toFixed(2)}`,
    canonical: `/produkt/${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
    breadcrumbs: [
      { name: 'Startseite', url: '/' },
      { name: 'Speisekarte', url: '/speisekarte' },
      { name: product.category.name, url: `/kategorie/${product.category.name.toLowerCase().replace(/\s+/g, '-')}` },
      { name: product.name, url: `/produkt/${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}` }
    ]
  };
}
