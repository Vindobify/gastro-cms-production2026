export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

// Direkte Imports für bessere Kompatibilität
import deMessages from '../messages/de.json';
import enMessages from '../messages/en.json';

export const messages = {
  de: () => Promise.resolve(deMessages),
  en: () => Promise.resolve(enMessages),
};

export function getLocale(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return defaultLocale;
}

export function removeLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.includes(segments[0] as Locale)) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

export function addLocale(pathname: string, locale: Locale): string {
  const cleanPath = removeLocale(pathname);
  if (cleanPath === '/') {
    return `/${locale}`;
  }
  return `/${locale}${cleanPath}`;
}

