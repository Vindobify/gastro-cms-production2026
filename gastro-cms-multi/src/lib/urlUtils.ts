import { headers } from 'next/headers';

/**
 * Builds the base URL from request headers (X-Forwarded-* from Traefik/Dokploy)
 * Works correctly behind reverse proxies
 */
export async function buildBaseUrl(): Promise<string> {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

/**
 * Builds absolute URL for API responses when needed
 * @param path - relative path starting with /
 */
export async function buildAbsoluteUrl(path: string): Promise<string> {
  const baseUrl = await buildBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Ensures path starts with / for relative URLs
 */
export function ensureRelativePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('/')) return path;
  return `/${path}`;
}
