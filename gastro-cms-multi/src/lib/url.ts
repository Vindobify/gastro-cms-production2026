// Client-safe URL utilities (no server dependencies)

/**
 * Normalize media URLs to relative paths
 * Removes any absolute URL parts and ensures relative path starts with /
 * @param url - URL to normalize (can be absolute or relative)
 * @returns Relative path starting with /
 */
export function normalizeMediaUrl(url: string): string {
  if (!url) return '';
  
  // If already relative and starts with /, return as is
  if (url.startsWith('/')) {
    return url;
  }
  
  // Remove any protocol and host parts
  const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
  
  // Ensure starts with /
  return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
}

/**
 * Get media URL for frontend display
 * Always returns relative path for domain-agnostic operation
 * @param storedPath - Path stored in database
 * @returns Relative URL for frontend use
 */
export function getMediaUrl(storedPath: string): string {
  if (!storedPath) return '';
  return normalizeMediaUrl(storedPath);
}

/**
 * Generate slug from string (for SEO-friendly URLs)
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äöüß]/g, (match) => {
      const replacements: { [key: string]: string } = {
        'ä': 'ae',
        'ö': 'oe', 
        'ü': 'ue',
        'ß': 'ss'
      };
      return replacements[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create product URL with slug and ID
 * @param name - Product name
 * @param id - Product ID
 * @returns SEO-friendly product URL path
 */
export function createProductUrl(name: string, id: number): string {
  const slug = generateSlug(name);
  return `/produkt/${slug}-${id}`;
}

/**
 * Create category URL with slug
 * @param name - Category name
 * @returns SEO-friendly category URL path
 */
export function createCategoryUrl(name: string): string {
  const slug = generateSlug(name);
  return `/kategorie/${slug}`;
}

/**
 * Extract ID from product URL
 * @param url - Product URL like "/produkt/margherita-123"
 * @returns Product ID or null if not found
 */
export function extractProductId(url: string): number | null {
  const match = url.match(/\/produkt\/.*-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract slug from category URL
 * @param url - Category URL like "/kategorie/pizza"
 * @returns Category slug or null if not found
 */
export function extractCategorySlug(url: string): string | null {
  const match = url.match(/\/kategorie\/(.+)$/);
  return match ? match[1] : null;
}
