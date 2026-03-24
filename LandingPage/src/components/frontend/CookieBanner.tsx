'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, Shield, BarChart2, Share2, ChevronDown, ChevronUp } from 'lucide-react'

interface CookieConsent {
  essential: true
  analytics: boolean
  social: boolean
  timestamp: number
}

const CONSENT_KEY = 'cookie_consent'

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setCookieConsent(consent: Omit<CookieConsent, 'essential' | 'timestamp'>) {
  const full: CookieConsent = { essential: true, ...consent, timestamp: Date.now() }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(full))
  window.dispatchEvent(new Event('cookie-consent-updated'))
}

export default function CookieBanner({ hasAnalytics, hasSocial }: { hasAnalytics?: boolean; hasSocial?: boolean }) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [social, setSocial] = useState(false)

  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const acceptAll = () => {
    setCookieConsent({ analytics: true, social: true })
    setVisible(false)
  }

  const acceptSelected = () => {
    setCookieConsent({ analytics, social })
    setVisible(false)
  }

  const rejectAll = () => {
    setCookieConsent({ analytics: false, social: false })
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <Cookie size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base">Diese Website verwendet Cookies</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Wir verwenden Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten. Technisch notwendige Cookies sind immer aktiv.
              {' '}<Link href="/datenschutz" className="text-red-600 hover:underline font-medium">Datenschutzerklärung</Link>
            </p>
          </div>
          <button onClick={rejectAll} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Ablehnen">
            <X size={18} />
          </button>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="px-5 pb-3 space-y-3 border-t border-gray-100 pt-3">
            {/* Essential */}
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Notwendige Cookies</p>
                  <p className="text-xs text-gray-500">Sitzung, Sicherheit, Grundfunktionen</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Immer aktiv</span>
            </div>

            {/* Analytics */}
            {hasAnalytics && (
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Analyse (Google Analytics)</p>
                    <p className="text-xs text-gray-500">Besucherstatistiken, anonymisiert</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            )}

            {/* Social */}
            {hasSocial && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Social Media</p>
                    <p className="text-xs text-gray-500">Facebook, Instagram Inhalte</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={social} onChange={e => setSocial(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Einstellungen {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="flex-1" />
          <button
            onClick={rejectAll}
            className="text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Nur notwendige
          </button>
          {expanded && (
            <button
              onClick={acceptSelected}
              className="text-sm border border-red-200 hover:bg-red-50 text-red-700 px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Auswahl speichern
            </button>
          )}
          <button
            onClick={acceptAll}
            className="text-sm text-white px-5 py-2 rounded-xl font-bold transition-colors"
            style={{ background: '#D60000' }}
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
