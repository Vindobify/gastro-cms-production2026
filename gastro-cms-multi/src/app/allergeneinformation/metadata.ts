import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Allergeneinformation',
  description: 'Vollständige Übersicht aller Allergene in unseren Gerichten - EU-konforme Kennzeichnung nach Verordnung 1169/2011',
  keywords: [
    'allergene',
    'allergeneinformation',
    'allergene kennzeichnung',
    'eu verordnung 1169',
    'gluten',
    'laktose',
    'nüsse',
    'allergene übersicht',
    'unverträglichkeiten',
    'kreuzkontamination'
  ],
  openGraph: {
    title: 'Allergeneinformation',
    description: 'Vollständige Übersicht aller Allergene in unseren Gerichten - EU-konforme Kennzeichnung',
    type: 'website',
    url: '/allergeneinformation',
  },
  alternates: {
    canonical: '/allergeneinformation',
  },
}
