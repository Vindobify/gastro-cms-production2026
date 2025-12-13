'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Hier könnten wir die Session verifizieren
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
            🎉 Zahlung erfolgreich!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Vielen Dank für deine Bestellung von Gastro CMS 3.0!
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-900 mb-3">
              Was passiert als nächstes?
            </h2>
            <ul className="text-left text-green-800 space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Du erhältst eine Bestätigungs-E-Mail mit allen Details</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Unser Team meldet sich innerhalb von 24 Stunden bei dir</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Wir richten dein Gastro CMS 3.0 System ein</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Du erhältst Zugang zu deinem persönlichen Dashboard</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📧 Kontakt
            </h3>
            <p className="text-blue-800">
              Bei Fragen kannst du uns jederzeit erreichen:<br />
              <strong>E-Mail:</strong> office@gastro-cms.at<br />
              <strong>Telefon:</strong> +43 660 546 78 06
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/de"
              className="inline-block bg-gradient-brand text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Zur Startseite
            </Link>
            <Link
              href="/de/kontakt"
              className="inline-block bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-gray-900 mb-2">Schneller Start</h3>
            <p className="text-gray-600 text-sm">
              Dein System wird innerhalb von 48 Stunden eingerichtet
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-bold text-gray-900 mb-2">Schulung inklusive</h3>
            <p className="text-gray-600 text-sm">
              Wir schulen dich und dein Team im Umgang mit dem System
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">💪</div>
            <h3 className="font-bold text-gray-900 mb-2">Support</h3>
            <p className="text-gray-600 text-sm">
              Persönlicher Support bei allen Fragen
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function BestellungErfolg() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

