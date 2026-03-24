import type { Metadata } from 'next'

const BASE_URL = 'https://pizzeria1140.at'
const DEFAULT_MENU_URL = `${BASE_URL}/#speisekarte`
const DEFAULT_RESERVATION_URL = `${BASE_URL}/#reservierung`

const DAY_MAP: Record<string, string> = {
  montag: 'Monday',
  dienstag: 'Tuesday',
  mittwoch: 'Wednesday',
  donnerstag: 'Thursday',
  freitag: 'Friday',
  samstag: 'Saturday',
  sonntag: 'Sunday',
}

function toSchemaDay(day: unknown) {
  if (typeof day !== 'string') return undefined
  const normalized = day.trim().toLowerCase()
  const mapped = DAY_MAP[normalized]
  return mapped ? `https://schema.org/${mapped}` : undefined
}

function resolveOgImageUrl(raw: string) {
  if (!raw) return `${BASE_URL}/opengraph-image`
  const lower = raw.toLowerCase()
  if (lower.endsWith('.webp')) return `${BASE_URL}/opengraph-image`
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`
}

// ─── Metadata builder ────────────────────────────────────────────────────────

export function buildPageMetadata(
  settings: Record<string, string>,
  options: { title: string; description: string; path: string }
): Metadata {
  const ogImage = resolveOgImageUrl(settings.og_image || settings.logo_url || '')
  const siteName = settings.restaurant_name || 'Pizzeria Da Corrado'
  const canonicalUrl = `${BASE_URL}${options.path}`

  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: options.title,
      description: options.description,
      url: canonicalUrl,
      siteName,
      locale: 'de_AT',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [ogImage],
    },
  }
}

// ─── Structured Data Schemas ─────────────────────────────────────────────────

export function getRestaurantSchema(settings: Record<string, string>) {
  const openingHours = (() => {
    try { return settings.opening_hours ? JSON.parse(settings.opening_hours) : [] } catch { return [] }
  })()

  return {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'LocalBusiness'],
    '@id': BASE_URL,
    name: settings.restaurant_name || 'Pizzeria Da Corrado',
    description: settings.site_description || 'Authentische italienische Küche in 1140 Wien – Pizza, Pasta, Burger & mehr.',
    url: BASE_URL,
    image: settings.og_image || settings.logo_url || '',
    logo: settings.logo_url || '',
    telephone: settings.restaurant_phone || '',
    email: settings.restaurant_email || '',
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Debit Card',
    servesCuisine: ['Italienisch', 'Pizza', 'Pasta', 'Burger', 'Schnitzel'],
    menu: DEFAULT_MENU_URL,
    reservations: DEFAULT_RESERVATION_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.restaurant_address || 'Linzer Straße 86',
      addressLocality: 'Wien',
      postalCode: '1140',
      addressRegion: 'Wien',
      addressCountry: 'AT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings.restaurant_lat || '48.1985',
      longitude: settings.restaurant_lng || '16.2989',
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((settings.restaurant_address || 'Linzer Straße 86') + ', 1140 Wien')}`,
    openingHoursSpecification: openingHours
      .filter((h: { closed?: boolean }) => !h.closed)
      .map((h: { day?: string; open?: string; close?: string }) => {
        const dayOfWeek = toSchemaDay(h.day)
        if (!h.open || !h.close) return null
        if (!dayOfWeek) return null
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek,
          opens: h.open,
          closes: h.close,
        }
      })
      .filter(Boolean),
    sameAs: [],
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: DEFAULT_RESERVATION_URL,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Tischreservierung' },
    },
  }
}

export function getOrganizationSchema(settings: Record<string, string>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: settings.restaurant_name || 'Pizzeria Da Corrado',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: settings.logo_url || '',
      width: 300,
      height: 100,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.restaurant_phone || '',
      contactType: 'customer service',
      availableLanguage: ['German', 'Italian'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.restaurant_address || 'Linzer Straße 86',
      addressLocality: 'Wien',
      postalCode: '1140',
      addressCountry: 'AT',
    },
    sameAs: [],
  }
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function getImageSchema(image: { url: string; altText: string; title?: string; description?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: image.url,
    name: image.title || image.altText,
    description: image.description || image.altText,
    caption: image.altText,
  }
}
