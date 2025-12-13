'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  ConsentData, 
  ConsentCategories, 
  ConsentPreferences,
  getConsentCookie, 
  saveConsent, 
  dispatchConsentChange,
  DEFAULT_CONSENT 
} from '@/lib/consent'

interface ConsentContextType {
  consent: ConsentData | null
  hasConsent: (category: keyof ConsentCategories) => boolean
  updateConsent: (preferences: ConsentPreferences) => void
  showBanner: boolean
  setShowBanner: (show: boolean) => void
  isLoading: boolean
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

interface ConsentProviderProps {
  children: ReactNode
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentData | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Client-Side Detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Consent beim Mount laden
  useEffect(() => {
    if (!isClient) return

    try {
      const savedConsent = getConsentCookie()
      
      if (savedConsent && savedConsent.categories) {
        setConsent(savedConsent)
        setShowBanner(false) // Banner nicht zeigen wenn bereits Consent vorhanden
        console.log('Banner versteckt - Consent bereits vorhanden:', savedConsent)
      } else {
        setConsent(DEFAULT_CONSENT)
        setShowBanner(true) // Banner zeigen bei erstem Besuch oder nach Cookie-Löschung
        console.log('Banner angezeigt - Kein Consent vorhanden oder Cookies gelöscht')
      }
    } catch (error) {
      console.warn('Fehler beim Laden des Consent-Status:', error)
      setConsent(DEFAULT_CONSENT)
      setShowBanner(true)
    }
    
    setIsLoading(false)
  }, [isClient])

  // Consent-Status prüfen
  const hasConsent = (category: keyof ConsentCategories): boolean => {
    return consent?.categories[category] ?? false
  }

  // Consent aktualisieren
  const updateConsent = (preferences: ConsentPreferences) => {
    try {
      const newConsent = saveConsent(preferences)
      setConsent(newConsent)
      setShowBanner(false)
      
      // Event für andere Komponenten dispatchen
      dispatchConsentChange(newConsent)
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Consent:', error)
    }
  }

  // Event Listener für Re-Open
  useEffect(() => {
    if (!isClient) return

    const handleReopen = () => {
      console.log('Cookie Banner Re-Open Event empfangen')
      setShowBanner(true)
    }

    window.addEventListener('cc:reopen', handleReopen)
    return () => window.removeEventListener('cc:reopen', handleReopen)
  }, [isClient])

  const contextValue: ConsentContextType = {
    consent,
    hasConsent,
    updateConsent,
    showBanner,
    setShowBanner,
    isLoading,
  }

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
    </ConsentContext.Provider>
  )
}

// Hook für einfache Verwendung
export function useConsent(): ConsentContextType {
  const context = useContext(ConsentContext)
  
  if (context === undefined) {
    throw new Error('useConsent muss innerhalb eines ConsentProvider verwendet werden')
  }
  
  return context
}

// Re-Open Button Komponente
export function ConsentReOpenButton() {
  const { setShowBanner } = useConsent()

  return (
    <button
      onClick={() => setShowBanner(true)}
      className="fixed bottom-4 right-4 z-40 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      aria-label="Cookie-Einstellungen öffnen"
      title="Cookie-Einstellungen anpassen"
    >
      🍪 Cookie-Einstellungen
    </button>
  )
}
