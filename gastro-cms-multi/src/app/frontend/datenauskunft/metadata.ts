import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenauskunft',
  description: 'Antrag auf Datenauskunft gemäß DSGVO - Ihre Rechte bezüglich personenbezogener Daten',
  keywords: [
    'datenauskunft',
    'dsgvo',
    'datenschutz',
    'personenbezogene daten',
    'auskunftsrecht',
    'datenportabilität',
    'löschung',
    'berichtigung'
  ],
  openGraph: {
    title: 'Datenauskunft',
    description: 'Antrag auf Datenauskunft gemäß DSGVO - Ihre Rechte bezüglich personenbezogener Daten',
    type: 'website',
    url: '/frontend/datenauskunft',
  },
  alternates: {
    canonical: '/frontend/datenauskunft',
  },
}
