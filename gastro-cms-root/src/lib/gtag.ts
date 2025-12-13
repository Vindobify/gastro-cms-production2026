/**
 * Google Analytics 4 gtag Wrapper mit Consent Mode v2
 * DSGVO-konforme Implementation für Gastro CMS
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GA4 Measurement ID - Platzhalter für Umgebungsvariable
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '{G-XXXXXXXXXX}';

/**
 * gtag-Funktion initialisieren
 */
export function initializeGtag(): void {
  if (typeof window === 'undefined') return;

  // dataLayer initialisieren falls nicht vorhanden
  window.dataLayer = window.dataLayer || [];
  
  // gtag-Funktion definieren
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // gtag-Shim für Consent Mode
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

/**
 * Consent-Update für GA4
 */
export function updateConsent(analytics: boolean, marketing: boolean = false): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
}

/**
 * GA4-Konfiguration laden
 */
export function loadGA4Script(): void {
  if (typeof window === 'undefined') return;

  // Prüfen ob bereits geladen
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  
  script.onload = () => {
    if (window.gtag) {
      window.gtag('js', new Date());
      window.gtag('config', GA4_MEASUREMENT_ID, {
        send_page_view: false, // Wird manuell über GA4Pageview gesendet
        anonymize_ip: true, // IP-Anonymisierung aktiviert
      });
    }
  };

  document.head.appendChild(script);
}

/**
 * Page View Event senden
 */
export function sendPageView(pagePath: string, pageTitle: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Custom Event senden
 */
export function sendEvent(eventName: string, parameters: Record<string, any> = {}): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, parameters);
}

/**
 * Consent-Status für Debugging
 */
export function getConsentStatus(): { analytics: boolean; marketing: boolean } {
  if (typeof window === 'undefined') return { analytics: false, marketing: false };

  // Prüfe dataLayer für aktuellen Consent-Status
  const consentData = window.dataLayer?.find((item: any) => 
    item[0] === 'consent' && item[1] === 'update'
  );

  if (consentData && consentData[2]) {
    return {
      analytics: consentData[2].analytics_storage === 'granted',
      marketing: consentData[2].ad_storage === 'granted',
    };
  }

  return { analytics: false, marketing: false };
}
