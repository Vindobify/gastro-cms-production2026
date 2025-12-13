/**
 * DSGVO-konforme Consent-Verwaltung für Gastro CMS
 * Implementiert Consent Mode v2 mit granularen Kategorien
 */

export interface ConsentCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentData {
  v: string; // Version
  t: string; // Timestamp ISO
  categories: ConsentCategories;
}

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Cookie-Konfiguration
export const CONSENT_COOKIE_NAME = 'cc_prefs';
export const CONSENT_VERSION = '1.0';
export const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 Tage in Sekunden

// Default-Konsens (alle optionalen Kategorien verweigert)
export const DEFAULT_CONSENT: ConsentData = {
  v: CONSENT_VERSION,
  t: new Date().toISOString(),
  categories: {
    essential: true, // Immer aktiv
    analytics: false,
    marketing: false,
  },
};

// Consent Mode v2 Defaults
export const CONSENT_MODE_DEFAULTS = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
} as const;

/**
 * Cookie setzen mit DSGVO-konformen Attributen
 */
export function setConsentCookie(data: ConsentData): void {
  if (typeof window === 'undefined') return;

  try {
    const cookieValue = encodeURIComponent(JSON.stringify(data));
    const cookieString = [
      `${CONSENT_COOKIE_NAME}=${cookieValue}`,
      `Max-Age=${COOKIE_MAX_AGE}`,
      'Path=/',
      'SameSite=Lax',
      window.location.protocol === 'https:' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    document.cookie = cookieString;
    console.log('Consent-Cookie gesetzt:', data);
    console.log('Cookie-String:', cookieString);
  } catch (error) {
    console.error('Fehler beim Setzen des Consent-Cookies:', error);
  }
}

/**
 * Consent-Cookie lesen
 */
export function getConsentCookie(): ConsentData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    const consentCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${CONSENT_COOKIE_NAME}=`)
    );

    if (!consentCookie) {
      console.log('Kein Consent-Cookie gefunden');
      return null;
    }

    const cookieValue = consentCookie.split('=')[1];
    if (!cookieValue) {
      console.log('Cookie-Wert ist leer');
      return null;
    }

    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded) as ConsentData;
    
    // Validierung der Cookie-Struktur
    if (parsed.v && parsed.t && parsed.categories) {
      console.log('Consent-Cookie erfolgreich gelesen:', parsed);
      return parsed;
    } else {
      console.log('Cookie-Struktur ungültig:', parsed);
    }
  } catch (error) {
    console.warn('Fehler beim Parsen des Consent-Cookies:', error);
  }

  return null;
}

/**
 * Consent-Status prüfen
 */
export function hasConsent(category: keyof ConsentCategories): boolean {
  const consent = getConsentCookie();
  return consent?.categories[category] ?? false;
}

/**
 * Neuen Consent speichern
 */
export function saveConsent(categories: ConsentPreferences): ConsentData {
  const newConsent: ConsentData = {
    v: CONSENT_VERSION,
    t: new Date().toISOString(),
    categories: {
      essential: true, // Immer true
      analytics: categories.analytics,
      marketing: categories.marketing,
    },
  };

  setConsentCookie(newConsent);
  return newConsent;
}

/**
 * Consent-Event dispatchen
 */
export function dispatchConsentChange(consent: ConsentData): void {
  if (typeof window === 'undefined') return;

  try {
    const event = new CustomEvent('cc:changed', {
      detail: { consent },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.warn('Fehler beim Dispatchen des Consent-Events:', error);
  }
}

/**
 * Server-seitiges Cookie-Lesen (für SSR)
 */
export function parseConsentFromCookie(cookieHeader: string | null): ConsentData | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  const consentCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${CONSENT_COOKIE_NAME}=`)
  );

  if (!consentCookie) return null;

  try {
    const cookieValue = consentCookie.split('=')[1];
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded) as ConsentData;
    
    if (parsed.v && parsed.t && parsed.categories) {
      return parsed;
    }
  } catch (error) {
    console.warn('Fehler beim Server-seitigen Parsen des Consent-Cookies:', error);
  }

  return null;
}
