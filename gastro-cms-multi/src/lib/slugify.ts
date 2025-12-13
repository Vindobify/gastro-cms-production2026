/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace German umlauts
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Replace spaces and special characters with hyphens
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates a unique slug for a category name
 * @param name - Category name
 * @param existingSlugs - Array of existing slugs to avoid duplicates
 * @returns Unique slug
 */
export function generateCategorySlug(name: string, existingSlugs: string[] = []): string {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure uniqueness
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
