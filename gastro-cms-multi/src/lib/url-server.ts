/**
 * Simple absolute URL generator using environment variable
 * For server-side use where headers are not available
 * @param path - Relative path (with or without leading slash)
 * @returns Absolute URL
 */
export function absoluteUrl(path: string = '/'): string {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${appUrl}${cleanPath}`;
}
