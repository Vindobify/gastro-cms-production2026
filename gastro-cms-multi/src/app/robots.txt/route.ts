import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/url-server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${absoluteUrl('/sitemap.xml')}

# Disallow admin areas
Disallow: /dashboard
Disallow: /api/
Disallow: /delivery-driver-dashboard

# Allow public frontend
Allow: /frontend/
Allow: /speisekarte
Allow: /kategorie/
Allow: /produkt/
Allow: /bestellen
Allow: /checkout
Allow: /gutscheine
Allow: /kontakt
Allow: /impressum
Allow: /datenschutz
Allow: /agb

# Crawl delay
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    }
  });
}
