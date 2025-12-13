import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/node_modules/',
        '/*.json$',
        '/*.log$',
        '/*.env$',
        '/*.config$'
      ],
    },
    sitemap: 'https://gastro-cms.at/sitemap.xml',
    host: 'https://gastro-cms.at'
  }
}