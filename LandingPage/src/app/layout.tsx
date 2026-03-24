import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { prisma } from '@/lib/db'
import { getRestaurantSchema, getOrganizationSchema } from '@/lib/seo'
import { Toaster } from 'sonner'
import DeliveryWidget from '@/components/frontend/DeliveryWidget'
import CookieBanner from '@/components/frontend/CookieBanner'
import GoogleAnalytics from '@/components/frontend/GoogleAnalytics'

export const revalidate = 300

/* latin-ext: korrekte Darstellung von Umlauten und osteurop. Zeichen in der Systemschrift */
const inter = Inter({ subsets: ['latin', 'latin-ext'] })

async function getSettings() {
  try {
    const settings = await prisma.settings.findMany()
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {} as Record<string, string>)
  } catch {
    return {} as Record<string, string>
  }
}

function resolveOgImageUrl(ogImage: string) {
  if (!ogImage) return 'https://pizzeria1140.at/opengraph-image'
  const lower = ogImage.toLowerCase()
  // WhatsApp and some social crawlers often ignore WebP in OG tags.
  if (lower.endsWith('.webp')) return 'https://pizzeria1140.at/opengraph-image'
  if (ogImage.startsWith('http://') || ogImage.startsWith('https://')) return ogImage
  return `https://pizzeria1140.at${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = settings.site_title || 'Pizzeria Da Corrado | Authentische Italienische Küche · 1140 Wien'
  const description = settings.site_description || 'Pizzeria Ristorante Da Corrado in 1140 Wien – Pizza, Pasta, Burger & mehr. Jetzt online bestellen oder Tisch reservieren.'
  const ogImage = settings.og_image || settings.logo_url || ''
  const resolvedOgImage = resolveOgImageUrl(ogImage)
  const siteName = settings.restaurant_name || 'Pizzeria Da Corrado'
  const faviconUrl = settings.favicon_url || ''

  return {
    metadataBase: new URL('https://pizzeria1140.at'),
    title: { default: title, template: `%s | Pizzeria Da Corrado 1140 Wien` },
    description,
    keywords: ['Pizzeria Wien', 'Pizza 1140', 'Da Corrado', 'Ristorante Wien', 'Lieferservice 1140', 'Tischreservierung Wien', 'Italienisches Restaurant Wien'],
    authors: [{ name: siteName, url: 'https://pizzeria1140.at' }],
    creator: siteName,
    publisher: siteName,
    alternates: { canonical: 'https://pizzeria1140.at' },
    icons: faviconUrl ? {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    } : undefined,
    openGraph: {
      title,
      description,
      url: 'https://pizzeria1140.at',
      siteName,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: title }],
      locale: 'de_AT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedOgImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    verification: {
      google: settings.google_site_verification || '',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const restaurantSchema = getRestaurantSchema(settings)
  const organizationSchema = getOrganizationSchema(settings)
  const gaId = settings.google_analytics || ''
  const hasSocial = !!(settings.social_facebook || settings.social_instagram)

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </head>
      <body className={inter.className}>
        {children}
        <DeliveryWidget logoUrl={settings.logo_url} />
        <CookieBanner hasAnalytics={!!gaId} hasSocial={hasSocial} />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
