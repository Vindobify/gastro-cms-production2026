import { Metadata } from 'next'
import JsonLd, { generateOrganizationSchema, generateWebSiteSchema } from '@/components/seo/JsonLd'

// Force dynamic rendering for all frontend pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Static SEO settings for build time - prevents database calls during build
function getDefaultSEOSettings() {
  return {
    metaTitle: 'Gastro CMS - Online Restaurant',
    metaDescription: 'Bestellen Sie online bei unserem Restaurant. Frische Gerichte, schnelle Lieferung.',
    favicon: '/favicon.ico',
    ogImage: '/favicon.ico',
    restaurantName: 'Gastro CMS',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  }
}

// Static metadata for build time
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Checkout - Gastro CMS',
    template: '%s | Gastro CMS'
  },
  description: 'Bestellen Sie jetzt online! Sichere Bezahlung und schnelle Lieferung.',
  keywords: ['Checkout', 'Bestellung', 'Bezahlung', 'Restaurant', 'Online bestellen', 'Lieferservice'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'Checkout - Gastro CMS',
    description: 'Bestellen Sie jetzt online! Sichere Bezahlung und schnelle Lieferung.',
    siteName: 'Gastro CMS',
    images: [{
      url: '/favicon.ico',
      width: 1200,
      height: 630,
      alt: 'Gastro CMS',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkout - Gastro CMS',
    description: 'Bestellen Sie jetzt online! Sichere Bezahlung und schnelle Lieferung.',
  },
  alternates: {
    canonical: '/checkout',
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seoSettings = getDefaultSEOSettings()
  
  return (
    <>
      <JsonLd data={generateOrganizationSchema(seoSettings)} />
      <JsonLd data={generateWebSiteSchema(seoSettings)} />
      
      <div className="min-h-screen bg-gray-50">
        <nav role="navigation" aria-label="Hauptnavigation" className="sr-only">
          <ul>
            <li><a href="/">Startseite</a></li>
            <li><a href="/speisekarte">Speisekarte</a></li>
            <li><a href="/warenkorb">Warenkorb</a></li>
            <li><a href="/kontakt">Kontakt</a></li>
          </ul>
        </nav>
        
        <div id="skip-link">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded z-50">
            Zum Hauptinhalt springen
          </a>
        </div>
        
        {children}
      </div>
    </>
  )
}
