import React from 'react'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import '../styles/cookie.css'
import { ConsentProvider } from '@/components/ConsentProvider'
import CookieBanner from '@/components/CookieBanner'
// import { initializeGtag } from '@/lib/gtag' // Wird in ConsentScripts verwendet

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Gastro CMS Österreich - Nur 10% Provision statt 30%',
    template: '%s | Gastro CMS Österreich'
  },
  description: 'Gastro CMS: Nur 10% Provision statt bis zu 30%! Jährlich €180 + eigene Domain. Lieferservice-Software für Restaurants, Lebensmittelhändler, Obsthändler und mehr. Kostenlos testen!',
  keywords: [
    'gastro cms',
    '10 prozent provision',
    'niedrige provision restaurant',
    'online bestellung',
    'restaurant software',
    'lieferung takeaway',
    'gastro website',
    'restaurant cms',
    'eigenes lieferportal',
    'günstige restaurant software',
    'restaurant software jährlich',
    'lebensmittelhandel lieferung',
    'obsthandel lieferung',
    'lieferservice software',
    'österreich'
  ],
  authors: [{ name: 'NextPuls Digital - Mario Gaupmann' }],
  openGraph: {
    title: 'Gastro CMS Österreich - Nur 10% Provision statt bis zu 30%',
    description: 'Gastro CMS: Nur 10% Provision statt bis zu 30%! Jährlich €180 + eigene Domain. Lieferservice-Software für Restaurants, Lebensmittelhändler, Obsthändler und mehr. Kostenlos testen!',
    type: 'website',
    url: 'https://gastro-cms.at',
    images: [
      {
        url: 'https://gastro-cms.at/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gastro CMS - Nur 10% Provision statt 30%',
        type: 'image/png'
      }
    ],
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
    countryName: 'Austria',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gastro CMS Österreich - Nur 10% Provision statt bis zu 30%',
    description: 'Gastro CMS: Nur 10% Provision statt bis zu 30%! Jährlich €180 + eigene Domain. Kostenlos testen!',
    images: ['https://gastro-cms.at/og-image.png'],
    creator: '@gastrocms',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://gastro-cms.at',
    languages: {
      'de-AT': 'https://gastro-cms.at',
      'de-DE': 'https://gastro-cms.at',
      'de-CH': 'https://gastro-cms.at',
      'x-default': 'https://gastro-cms.at',
    },
  },
  other: {
    'geo.region': 'AT',
    'geo.placename': 'Kaumberg',
    'geo.position': '48.0167;15.7167',
    'ICBM': '48.0167, 15.7167',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
          {/* Favicon */}
          <link rel="icon" href="/icon.png" type="image/png" />
          <link rel="shortcut icon" href="/icon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/icon.png" />
          
          {/* Consent Mode v2 Default - DSGVO-konform */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // dataLayer initialisieren
                window.dataLayer = window.dataLayer || [];
                
                // gtag-Funktion definieren
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                
                // Consent Mode v2 Defaults - alle optionalen Kategorien verweigert
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'analytics_storage': 'denied', 
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'functionality_storage': 'granted',
                  'security_storage': 'granted'
                });
              `
            }}
          />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Gastro CMS 3.0",
              "description": "Günstige Lieferservice-Software für Restaurants, Lebensmittelhändler, Obsthändler und andere Geschäfte mit nur 10% Provision statt bis zu 30%. Jährlich €180 + eigene Domain, Online-Bestellung und Lieferung & Takeaway.",
              "url": "https://gastro-cms.at",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "180.00",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-01-01",
                "description": "Jährliche Gebühr + 10% Provision pro Bestellung"
              },
              "publisher": {
                "@type": "Organization",
                "name": "NextPuls Digital",
                "url": "https://gastro-cms.at",
                "logo": "https://gastro-cms.at/logo.png",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Markt 141",
                  "addressLocality": "Kaumberg",
                  "postalCode": "2572",
                  "addressCountry": "AT"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+43-660-546-78-06",
                  "contactType": "customer service",
                  "email": "office@gastro-cms.at",
                  "availableLanguage": "German"
                },
                "sameAs": [
                  "https://gastro-cms.at"
                ]
              },
              "featureList": [
                "Nur 10% Provision statt 30%",
                "Jährlich nur €180",
                "Eigene Domain inklusive",
                "Online-Bestellung & Lieferung",
                "Online Bestellung & Lieferung",
                "Eigenes Lieferportal",
                "Reservierungssystem",
                "Kassensystem-Integration",
                "Mobile Apps"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NextPuls Digital",
              "url": "https://gastro-cms.at",
              "logo": "https://gastro-cms.at/logo.png",
              "description": "Österreichisches Software-Unternehmen spezialisiert auf Gastro-Software",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Markt 141",
                "addressLocality": "Kaumberg",
                "postalCode": "2572",
                "addressCountry": "AT"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+43-660-546-78-06",
                "contactType": "customer service",
                "email": "office@gastro-cms.at",
                "availableLanguage": "German"
              },
              "sameAs": [
                "https://gastro-cms.at"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Gastro CMS 3.0",
              "url": "https://gastro-cms.at",
              "description": "Günstige Lieferservice-Software für Restaurants, Lebensmittelhändler, Obsthändler und mehr mit nur 10% Provision statt bis zu 30%",
              "publisher": {
                "@type": "Organization",
                "name": "NextPuls Digital"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://gastro-cms.at/suche?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://gastro-cms.at"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Gastro CMS",
                  "item": "https://gastro-cms.at"
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Wie viel spare ich im Vergleich zu anderen Anbietern?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Bei einem monatlichen Umsatz von €10.000 zahlen Sie bei anderen Anbietern bis zu €3.000 Provision, bei Gastro CMS nur €1.000. Das sind €2.000 Ersparnis pro Monat oder €24.000 pro Jahr. Dazu nur €180 Jahresgebühr für die komplette Software."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Was kostet Gastro CMS pro Jahr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Gastro CMS kostet jährlich €180 brutto plus 10% Provision pro Bestellung. Im Vergleich zu anderen Anbietern mit bis zu 30% Provision sparen Sie tausende Euro pro Jahr. Keine versteckten Kosten, keine Mindestvertragslaufzeit."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kann ich meine bestehende Domain nutzen?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ja, Sie können Ihre bestehende Domain verwenden oder wir helfen Ihnen bei der Einrichtung einer neuen Restaurant-Website. Die Domain ist in der jährlichen Gebühr von €180 enthalten."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Wie funktioniert die 10% Provision?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Von jeder Bestellung über Ihr Gastro CMS System erhalten Sie 90% des Bestellwerts, Gastro CMS erhält 10%. Die Abrechnung erfolgt monatlich automatisch. Keine zusätzlichen Gebühren oder versteckten Kosten."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Gibt es versteckte Kosten?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nein, bei Gastro CMS gibt es keine versteckten Kosten. Sie zahlen nur die jährliche Gebühr von €180 und 10% Provision pro Bestellung. Alle Features wie Online-Bestellung, Lieferung & Takeaway, mobile Apps und Support sind inklusive."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Welche Kassensysteme werden unterstützt?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Gastro CMS integriert sich mit allen gängigen Kassensystemen in Österreich wie NCR, Micros, Gastrosoft und vielen mehr. Die Integration erfolgt über standardisierte Schnittstellen und ist meist innerhalb weniger Tage eingerichtet."
                  }
                }
              ]
            })
          }}
        />
        {/* Facebook Pixel noscript - wird nur angezeigt wenn JavaScript deaktiviert ist */}
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=4160310264190824&ev=PageView&noscript=1" alt="" />
        </noscript>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
            {/* Skip Links für Barrierefreiheit */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Zum Hauptinhalt springen
            </a>
            <a 
              href="#navigation" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Zur Navigation springen
            </a>
            
            <ConsentProvider>
        {children}
              <CookieBanner />
            </ConsentProvider>
      </body>
    </html>
  )
}