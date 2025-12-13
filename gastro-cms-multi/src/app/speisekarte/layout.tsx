import { Metadata } from 'next'
import JsonLd, { generateOrganizationSchema, generateWebSiteSchema } from '@/components/seo/JsonLd'
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
    default: 'Speisekarte - Gastro CMS',
    template: '%s | Gastro CMS'
  },
  description: 'Entdecken Sie unsere vielfältige Speisekarte mit frischen Gerichten und köstlichen Spezialitäten.',
  keywords: ['Speisekarte', 'Restaurant', 'Online bestellen', 'Lieferservice', 'Essen', 'Gastro', 'Delivery'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'Speisekarte - Gastro CMS',
    description: 'Entdecken Sie unsere vielfältige Speisekarte mit frischen Gerichten und köstlichen Spezialitäten.',
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
    title: 'Speisekarte - Gastro CMS',
    description: 'Entdecken Sie unsere vielfältige Speisekarte mit frischen Gerichten und köstlichen Spezialitäten.',
  },
  alternates: {
    canonical: '/speisekarte',
  },
}

export default function SpeisekarteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seoSettings = getDefaultSEOSettings()
  
  return (
    <>
      <JsonLd data={generateOrganizationSchema(seoSettings)} />
      <JsonLd data={generateWebSiteSchema(seoSettings)} />
      
      <ToastProvider>
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
      </ToastProvider>
    </>
  )
}
