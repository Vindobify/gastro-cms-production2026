'use client'

import React, { useState, useEffect } from 'react'
import { useConsent } from './ConsentProvider'

export default function CookieManagementForm() {
  const { consent, updateConsent, hasConsent } = useConsent()
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (consent) {
      setPreferences({
        essential: true, // Essential ist immer aktiv
        analytics: consent.categories.analytics,
        marketing: consent.categories.marketing,
      })
    }
  }, [consent])

  const handlePreferenceChange = (category: keyof typeof preferences, value: boolean) => {
    if (category === 'essential') return // Essential kann nicht deaktiviert werden

    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleSave = () => {
    updateConsent(preferences)
    alert('Cookie-Einstellungen wurden gespeichert!')
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    updateConsent(allAccepted)
    alert('Alle Cookies wurden akzeptiert!')
  }

  const handleRejectAll = () => {
    const allRejected = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(allRejected)
    updateConsent(allRejected)
    alert('Alle optionalen Cookies wurden abgelehnt!')
  }

  const handleDeleteAllCookies = () => {
    if (confirm('Möchten Sie wirklich alle Cookies löschen? Dies wird Sie von der Website abmelden.')) {
      // Alle Cookies löschen
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      
      // Consent-Cookie explizit löschen
      document.cookie = "cc_prefs=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax;Secure"
      
      // Local Storage auch leeren (falls verwendet)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      alert('Alle Cookies wurden gelöscht! Der Cookie-Banner wird beim Neuladen der Seite wieder angezeigt.')
      window.location.reload()
    }
  }

  const handleForceShowBanner = () => {
    // Banner manuell öffnen
    const event = new CustomEvent('cc:reopen')
    window.dispatchEvent(event)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Cookie-Management
        </h2>
        
        <p className="text-gray-600 mb-8">
          Hier können Sie Ihre Cookie-Einstellungen verwalten und alle Cookies löschen. 
          Ihre aktuellen Einstellungen werden unten angezeigt.
        </p>

        {/* Aktuelle Einstellungen */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Einstellungen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${hasConsent('essential') ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Notwendige Cookies</span>
                <span className={`px-2 py-1 text-xs rounded-full ${hasConsent('essential') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {hasConsent('essential') ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${hasConsent('analytics') ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Analytics Cookies</span>
                <span className={`px-2 py-1 text-xs rounded-full ${hasConsent('analytics') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {hasConsent('analytics') ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${hasConsent('marketing') ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Marketing Cookies</span>
                <span className={`px-2 py-1 text-xs rounded-full ${hasConsent('marketing') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {hasConsent('marketing') ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie-Einstellungen */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie-Einstellungen anpassen</h3>
          
          <div className="space-y-6">
            {/* Essential Cookies - immer aktiv */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notwendige Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Diese Cookies sind für die Grundfunktionen der Website erforderlich.
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Immer aktiv</span>
                  <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Analytics Cookies (Google Analytics 4)</h4>
                  <p className="text-sm text-gray-600">
                    Helfen uns zu verstehen, wie Besucher mit der Website interagieren.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Werden verwendet, um personalisierte Werbung anzuzeigen.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Aktions-Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Alle akzeptieren
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Alle ablehnen
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Speichern
            </button>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={handleDeleteAllCookies}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Alle Cookies löschen
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              ⚠️ Achtung: Dies wird Sie von der Website abmelden und alle Einstellungen zurücksetzen.
            </p>
            
            <div className="mt-4">
              <button
                onClick={handleForceShowBanner}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cookie-Banner manuell öffnen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
