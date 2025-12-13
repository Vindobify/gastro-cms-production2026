import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'
import CookieManagementForm from '@/components/CookieManagementForm'

export const metadata: Metadata = {
  title: 'Cookie-Management',
  description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
  keywords: [
    'cookie management',
    'cookie einstellungen',
    'cookies löschen',
    'dsgvo cookies'
  ],
  openGraph: {
    title: 'Cookie-Management',
    description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
    type: 'website',
    url: '/frontend/cookies',
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie-Management',
    description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
  },
  alternates: {
    canonical: '/frontend/cookies',
    languages: {
      'de-AT': '/frontend/cookies',
    },
  },
}

export default function CookiesPage() {
  return (
    <main id="main-content" className="min-h-screen bg-surface" role="main">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Cookie-Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Verwalten Sie Ihre Cookie-Einstellungen und löschen Sie alle Cookies
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cookie-Management Form */}
            <div className="lg:col-span-2">
              <CookieManagementForm />
            </div>

            {/* Informationen */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                  Was sind Cookies?
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, 
                  wenn Sie unsere Website besuchen. Sie helfen uns, die Website zu verbessern 
                  und Ihnen eine bessere Erfahrung zu bieten.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                  Ihre Rechte
                </h2>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Cookies jederzeit ablehnen</li>
                  <li>• Einstellungen ändern</li>
                  <li>• Alle Cookies löschen</li>
                  <li>• Auskunft über verwendete Cookies</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                  Rechtliche Grundlage
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Die Verwendung von Cookies erfolgt gemäß Art. 6 Abs. 1 lit. a DSGVO 
                  (Einwilligung) für optionale Cookies und Art. 6 Abs. 1 lit. f DSGVO 
                  (berechtigtes Interesse) für notwendige Cookies.
                </p>
              </div>

              <div className="bg-brand-50 rounded-lg p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                  Weitere Informationen
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Detaillierte Informationen finden Sie in unserer Datenschutzerklärung.
                </p>
                <a 
                  href="/frontend/datenschutz"
                  className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  Datenschutzerklärung lesen
                </a>
              </div>
            </div>
          </div>

          {/* Cookie-Kategorien Übersicht */}
          <div className="mt-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-8">
              Cookie-Kategorien im Detail
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-brand-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Notwendige Cookies
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Session-Management</div>
                  <div>• Sicherheitsfunktionen</div>
                  <div>• Warenkorb-Funktionalität</div>
                  <div>• Benutzerauthentifizierung</div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Analytics Cookies
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Helfen uns zu verstehen, wie Besucher mit der Website interagieren. IP-Adressen werden anonymisiert.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Google Analytics 4</div>
                  <div>• Seitenaufrufe</div>
                  <div>• Verweildauer</div>
                  <div>• Nutzerverhalten</div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-purple-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Marketing Cookies
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Werden für personalisierte Werbung verwendet. Derzeit nicht aktiv.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Werbe-Targeting</div>
                  <div>• Remarketing</div>
                  <div>• Conversion-Tracking</div>
                  <div>• Social Media Integration</div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO
                </div>
              </div>
            </div>
          </div>

          {/* Technische Details */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Technische Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Cookie-Speicherung
                </h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Speicherort: Browser des Nutzers</li>
                  <li>• Maximale Speicherdauer: 180 Tage</li>
                  <li>• Verschlüsselung: HTTPS-gesichert</li>
                  <li>• SameSite: Lax (Sicherheit)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Datenschutz-Features
                </h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• IP-Anonymisierung aktiviert</li>
                  <li>• Keine Cross-Domain-Tracking</li>
                  <li>• Granulare Consent-Kontrolle</li>
                  <li>• DSGVO-konforme Implementierung</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
