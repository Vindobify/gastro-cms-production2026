import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pizzeria Da Corrado',
    short_name: 'Da Corrado',
    description: 'Authentische italienische Küche in 1140 Wien.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#d60000',
    lang: 'de-AT',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
