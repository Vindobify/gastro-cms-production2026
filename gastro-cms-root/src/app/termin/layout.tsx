import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termin vereinbaren - Gastro CMS Beratung',
  description: 'Vereinbaren Sie einen Termin für eine persönliche Beratung zu Gastro CMS. Online oder im Lokal in Wien, Wien Umgebung und Niederösterreich.',
  keywords: [
    'termin vereinbaren',
    'gastro cms beratung',
    'persönliche beratung',
    'wien',
    'niederösterreich',
    'online termin',
    'lokal termin'
  ],
  openGraph: {
    title: 'Termin vereinbaren - Gastro CMS Beratung',
    description: 'Vereinbaren Sie einen Termin für eine persönliche Beratung zu Gastro CMS.',
    type: 'website',
    url: 'https://gastro-cms.at/termin',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/termin',
  },
}

export default function TerminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
