import { Metadata } from 'next'
import JsonLd, { generateOrganizationSchema, generateWebSiteSchema } from '@/components/seo/JsonLd'
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';

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
    default: 'Gastro CMS - Online Restaurant',
    template: '%s | Gastro CMS'
  },
  description: 'Bestellen Sie online bei unserem Restaurant. Frische Gerichte, schnelle Lieferung.',
  keywords: ['Restaurant', 'Online bestellen', 'Lieferservice', 'Essen', 'Gastro', 'Speisekarte', 'Delivery'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'Gastro CMS - Online Restaurant',
    description: 'Bestellen Sie online bei unserem Restaurant. Frische Gerichte, schnelle Lieferung.',
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
    title: 'Gastro CMS - Online Restaurant',
    description: 'Bestellen Sie online bei unserem Restaurant. Frische Gerichte, schnelle Lieferung.',
  },
  alternates: {
    canonical: '/frontend',
  },
}

export default function FrontendLayout({
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
            <li><a href="/frontend">Startseite</a></li>
            <li><a href="/frontend/speisekarte">Speisekarte</a></li>
            <li><a href="/frontend/warenkorb">Warenkorb</a></li>
            <li><a href="/frontend/kontakt">Kontakt</a></li>
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