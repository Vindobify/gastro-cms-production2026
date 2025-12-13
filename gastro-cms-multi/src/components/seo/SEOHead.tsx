import Head from 'next/head';
import { absoluteUrl } from '@/lib/url-server';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  structuredData
}: SEOHeadProps) {
  const canonicalUrl = canonical ? absoluteUrl(canonical) : undefined;
  const fullOgImage = ogImage ? absoluteUrl(ogImage) : undefined;

  return (
    <Head>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      <meta property="og:type" content={ogType} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
