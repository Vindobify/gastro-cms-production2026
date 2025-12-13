'use client'

import { useEffect } from 'react'
import { useConsent } from './ConsentProvider'

const FACEBOOK_PIXEL_ID = '4160310264190824'

// Hilfsfunktion zum Laden des Facebook Pixel Skripts
function loadFacebookPixel() {
  if (typeof window === 'undefined' || (window as any).fbq) {
    return
  }

  // Facebook Pixel Code einfügen
  ;(function(f: any, b: any, e: string, v: string, n: any, t: any, s: any) {
    if (f.fbq) return
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

  // Pixel initialisieren
  ;(window as any).fbq('init', FACEBOOK_PIXEL_ID)
  ;(window as any).fbq('track', 'PageView')
}

// Hilfsfunktion zum Tracken eines PageViews (falls Pixel bereits geladen)
function trackPageView() {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'PageView')
  }
}

export default function FacebookPixel() {
  const { consent, hasConsent } = useConsent()

  // Facebook Pixel initialisieren und laden
  useEffect(() => {
    // Nur laden wenn Marketing-Consent erteilt wurde
    if (!consent || !hasConsent('marketing')) {
      return
    }

    // Prüfen ob fbq bereits existiert
    if (!(window as any).fbq) {
      loadFacebookPixel()
    } else {
      // Falls fbq bereits existiert, nur PageView tracken
      trackPageView()
    }
  }, [consent, hasConsent])

  // Consent-Änderungen überwachen
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const { consent: newConsent } = event.detail
      
      if (newConsent && newConsent.categories.marketing) {
        // Marketing-Consent erteilt - Pixel laden
        if (!(window as any).fbq) {
          loadFacebookPixel()
        }
      }
    }

    window.addEventListener('cc:changed', handleConsentChange as EventListener)
    
    return () => {
      window.removeEventListener('cc:changed', handleConsentChange as EventListener)
    }
  }, [])

  return null // Diese Komponente rendert nichts
}

