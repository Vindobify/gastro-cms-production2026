'use client'

import React, { useState, useEffect } from 'react'
import { useConsent } from './ConsentProvider'
import { 
  ConsentPreferences, 
  getConsentCookie, 
  saveConsent,
  setConsentCookie,
  DEFAULT_CONSENT 
} from '@/lib/consent'

export default function CookieManagementForm() {
  const { consent, updateConsent, setShowBanner } = useConsent()
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Aktuelle Einstellungen laden
  useEffect(() => {
    const currentConsent = getConsentCookie()
    if (currentConsent) {
      setPreferences(currentConsent.categories)
    }
    setIsLoading(false)
  }, [consent])

  const handlePreferenceChange = (category: keyof ConsentPreferences, value: boolean) => {
    if (category === 'essential') return // Essential kann nicht deaktiviert werden

    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleSave = () => {
    try {
      updateConsent(preferences)
      setMessage({ type: 'success', text: 'Cookie-Einstellungen wurden erfolgreich gespeichert!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen.' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    updateConsent(allAccepted)
    setMessage({ type: 'success', text: 'Alle Cookies wurden akzeptiert!' })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleRejectAll = () => {
    const allRejected = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(allRejected)
    updateConsent(allRejected)
    setMessage({ type: 'success', text: 'Alle optionalen Cookies wurden abgelehnt!' })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteAll = () => {
    try {
      // Alle Cookies löschen
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })
      
      // Consent zurücksetzen
      setConsentCookie(DEFAULT_CONSENT)
      setPreferences(DEFAULT_CONSENT.categories)
      
      setMessage({ type: 'success', text: 'Alle Cookies wurden gelöscht!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Löschen der Cookies.' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleReopenBanner = () => {
    setShowBanner(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie-Einstellungen verwalten</h2>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Essential Cookies */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Notwendige Cookies</h3>
              <p className="text-sm text-gray-600 mb-2">
                Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
              </p>
              <p className="text-xs text-gray-500">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
              </p>
            </div>
            <div className="flex items-center ml-4">
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
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies (Google Analytics 4)</h3>
              <p className="text-sm text-gray-600 mb-2">
                Helfen uns zu verstehen, wie Besucher mit der Website interagieren. IP-Adressen werden anonymisiert.
              </p>
              <p className="text-xs text-gray-500">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
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
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
              <p className="text-sm text-gray-600 mb-2">
                Werden verwendet, um personalisierte Werbung anzuzeigen. Derzeit nicht aktiv.
              </p>
              <p className="text-xs text-gray-500">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
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

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            >
              Einstellungen speichern
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Alle akzeptieren
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Alle ablehnen
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Alle Cookies löschen
            </button>
          </div>
          
          <button
            onClick={handleReopenBanner}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cookie-Banner erneut anzeigen
          </button>
        </div>
      </div>
    </div>
  )
}
