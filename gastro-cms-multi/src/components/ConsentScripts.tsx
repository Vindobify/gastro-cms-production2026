'use client'

import { useEffect } from 'react'
import { useConsent } from './ConsentProvider'
import { loadGA4Script, updateConsent, initializeGtag } from '@/lib/gtag'

export default function ConsentScripts() {
  const { consent, hasConsent } = useConsent()

  // gtag initialisieren
  useEffect(() => {
    initializeGtag()
  }, [])

  // Consent-Änderungen überwachen
  useEffect(() => {
    const handleConsentChange = (event: any) => {
      const { consent: newConsent } = event.detail
      
      if (newConsent) {
        const analytics = newConsent.categories.analytics
        const marketing = newConsent.categories.marketing
        
        // Consent-Update für GA4
        updateConsent(analytics, marketing)
        
        // GA4-Skript nur laden wenn Analytics erlaubt
        if (analytics) {
          loadGA4Script().catch(console.error)
        }
      }
    }

    // Event-Listener für Consent-Änderungen
    window.addEventListener('cc:changed', handleConsentChange)
    
    return () => {
      window.removeEventListener('cc:changed', handleConsentChange)
    }
  }, [])

  // Initiale GA4-Ladung bei bereits vorhandenem Consent
  useEffect(() => {
    if (consent && hasConsent('analytics')) {
      loadGA4Script().catch(console.error)
      updateConsent(true, hasConsent('marketing'))
    }
  }, [consent, hasConsent])

  return null // Diese Komponente rendert nichts
}
