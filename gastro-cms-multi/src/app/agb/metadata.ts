import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen',
  description: 'Geschäftsbedingungen und Nutzungsvereinbarung für unser Restaurant-Management-System',
  keywords: [
    'agb',
    'allgemeine geschäftsbedingungen',
    'nutzungsbedingungen',
    'lieferbedingungen',
    'zahlungsbedingungen',
    'widerrufsrecht',
    'haftungsausschluss',
    'datenschutzbestimmungen'
  ],
  openGraph: {
    title: 'Allgemeine Geschäftsbedingungen',
    description: 'Geschäftsbedingungen und Nutzungsvereinbarung für unser Restaurant-Management-System',
    type: 'website',
    url: '/agb',
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allgemeine Geschäftsbedingungen',
    description: 'Geschäftsbedingungen und Nutzungsvereinbarung für unser Restaurant-Management-System',
  },
  alternates: {
    canonical: '/agb',
  },
}
