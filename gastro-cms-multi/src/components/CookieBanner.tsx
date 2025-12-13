'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useConsent } from './ConsentProvider'

interface CookieBannerProps {
  onClose?: () => void
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onClose }) => {
  const { updateConsent, showBanner: contextShowBanner, setShowBanner } = useConsent()
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  })
  const [showDetails, setShowDetails] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const bannerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Client-Side Detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Focus-Trap für Accessibility
  useEffect(() => {
    if (!contextShowBanner) return

    const focusableElements = bannerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (!focusableElements.length) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [contextShowBanner])

  // Escape-Taste zum Schließen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBanner(false)
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [setShowBanner, onClose])

  // Focus auf ersten fokussierbaren Element setzen
  useEffect(() => {
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus()
    }
  }, [])

  const handlePreferenceChange = (category: keyof typeof preferences, value: boolean) => {
    if (category === 'essential') return // Essential kann nicht deaktiviert werden

    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleClose = useCallback(() => {
    setShowBanner(false)
    onClose?.()
  }, [setShowBanner, onClose])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    updateConsent(allAccepted)
    handleClose()
  }

  const handleRejectAll = () => {
    const allRejected = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(allRejected)
    updateConsent(allRejected)
    handleClose()
  }

  const handleSave = () => {
    updateConsent(preferences)
    handleClose()
  }

  if (!isClient || !contextShowBanner) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div
        ref={bannerRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 id="cookie-banner-title" className="text-xl font-semibold text-gray-900">
              Cookie-Einstellungen & Datenschutz
            </h2>
            <button
              ref={firstFocusableRef}
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              aria-label="Cookie-Banner schließen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div id="cookie-banner-description" className="mb-6">
            <p className="text-gray-600 mb-4">
              <strong>DSGVO-konforme Cookie-Verwaltung:</strong> Wir verwenden Cookies, um Ihnen die beste Erfahrung auf unserer Website zu bieten. 
              Sie können Ihre Einstellungen jederzeit anpassen und Ihre Einwilligung widerrufen.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Rechtliche Grundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für optionale Cookies. 
              Weitere Informationen finden Sie in unserer{' '}
              <a 
                href="/datenschutz" 
                className="text-brand-600 hover:text-brand-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Datenschutzerklärung
              </a>
              {' '}und unseren{' '}
              <a 
                href="/agb" 
                className="text-brand-600 hover:text-brand-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                AGB
              </a>
              .
            </p>
          </div>

          {!showDetails ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                >
                  Alle akzeptieren
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Alle ablehnen
                </button>
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="w-full text-brand-600 hover:text-brand-800 underline text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              >
                Einstellungen anpassen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Essential Cookies - immer aktiv */}
                <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Notwendige Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich. 
                      Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Immer aktiv</span>
                    <div className="w-10 h-6 bg-brand-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics Cookies (Google Analytics 4)</h3>
                    <p className="text-sm text-gray-600">
                      Helfen uns zu verstehen, wie Besucher mit der Website interagieren. 
                      Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). 
                      IP-Adressen werden anonymisiert.
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-brand-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Werden verwendet, um personalisierte Werbung anzuzeigen. 
                      Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). 
                      Derzeit nicht aktiv.
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-brand-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Zurück
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CookieBanner
