import { generateLocalBusinessSchema, generateProductSchema, generateMenuSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface StructuredDataProps {
  type: 'restaurant' | 'product' | 'menu' | 'breadcrumb';
  data: any;
  settings: any;
}

export default function StructuredData({ type, data, settings }: StructuredDataProps) {
  let schema;

  switch (type) {
    case 'restaurant':
      schema = generateLocalBusinessSchema(settings);
      break;
    case 'product':
      schema = generateProductSchema(data, settings);
      break;
    case 'menu':
      schema = generateMenuSchema(data, settings);
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(data);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
