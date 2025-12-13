'use client'

import { useEffect } from 'react'
import { useConsent } from './ConsentProvider'
import { loadGA4Script, updateConsent } from '@/lib/gtag'

export default function ConsentScripts() {
  const { consent, hasConsent } = useConsent()

  // Consent-Änderungen überwachen
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const { consent: newConsent } = event.detail
      
      if (newConsent) {
        const analytics = newConsent.categories.analytics
        const marketing = newConsent.categories.marketing
        
        // Consent-Update für GA4
        updateConsent(analytics, marketing)
        
        // GA4-Skript nur laden wenn Analytics erlaubt
        if (analytics) {
          loadGA4Script()
        }
      }
    }

    // Event-Listener für Consent-Änderungen
    window.addEventListener('cc:changed', handleConsentChange as EventListener)
    
    return () => {
      window.removeEventListener('cc:changed', handleConsentChange as EventListener)
    }
  }, [])

  // Initiale GA4-Ladung bei bereits vorhandenem Consent
  useEffect(() => {
    if (consent && hasConsent('analytics')) {
      loadGA4Script()
      updateConsent(true, hasConsent('marketing'))
    }
  }, [consent, hasConsent])

  return null // Diese Komponente rendert nichts
}
