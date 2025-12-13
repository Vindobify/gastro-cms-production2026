import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'PWA Apps - Mobile Apps für Kunden und Lieferanten',
  description: 'Progressive Web Apps für Kunden und Lieferanten. Push-Benachrichtigungen, Offline-Funktionalität und native App-Erlebnis.',
  keywords: [
    'pwa app',
    'mobile app restaurant',
    'progressive web app',
    'push benachrichtigungen',
    'offline app',
    'lieferanten app',
    'gastro cms'
  ],
  openGraph: {
    title: 'PWA Apps - Mobile Apps für Kunden und Lieferanten',
    description: 'Progressive Web Apps für Kunden und Lieferanten mit Push-Benachrichtigungen.',
    type: 'website',
    url: 'https://gastro-cms.at/features/pwa',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features/pwa',
  },
}

export default function PWAPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              PWA Apps
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Mobile Apps für Kunden und Lieferanten - Ohne App Store
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Native App-Erlebnis</h2>
                  <p className="text-lg text-indigo-100 mb-6">
                    Progressive Web Apps bieten das native App-Erlebnis ohne App Store. Installierbar direkt aus dem Browser.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Push-Benachrichtigungen</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Offline-Funktionalität</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>App-Installation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Echtzeit-Updates</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Cross-Platform</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Zwei Apps inklusive</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">👥</span>
                      <div>
                        <h4 className="font-bold">Kunden-App</h4>
                        <p className="text-sm text-indigo-100">Bestellen, verfolgen, bezahlen</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">🚚</span>
                      <div>
                        <h4 className="font-bold">Lieferanten-App</h4>
                        <p className="text-sm text-indigo-100">Bestellungen verwalten, liefern</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">📱</span>
                      <div>
                        <h4 className="font-bold">Automatische Updates</h4>
                        <p className="text-sm text-indigo-100">Immer die neueste Version</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 text-gray-900">
            PWA Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Push-Benachrichtigungen</h3>
              <p className="text-gray-600">
                Kunden erhalten Benachrichtigungen über Bestellstatus. Lieferanten werden über neue Bestellungen informiert.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">App-Installation</h3>
              <p className="text-gray-600">
                Apps können direkt aus dem Browser installiert werden. Kein App Store nötig, funktioniert auf allen Geräten.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Offline-Funktionalität</h3>
              <p className="text-gray-600">
                Apps funktionieren auch ohne Internetverbindung. Bestellungen werden synchronisiert, sobald Verbindung besteht.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Echtzeit-Updates</h3>
              <p className="text-gray-600">
                Apps werden automatisch aktualisiert. Immer die neueste Version ohne manuelle Updates.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Cross-Platform</h3>
              <p className="text-gray-600">
                Funktioniert auf iOS, Android, Windows, macOS. Eine App für alle Plattformen.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Schnelle Performance</h3>
              <p className="text-gray-600">
                Native App-Performance durch Service Worker. Schnelle Ladezeiten und flüssige Bedienung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kunden vs Lieferanten App */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Zwei Apps für verschiedene Nutzer
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Kunden-App</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Produkte durchsuchen</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Bestellungen aufgeben</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Live-Tracking</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Bezahlen</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Bestellhistorie</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Push-Benachrichtigungen</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🚚</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Lieferanten-App</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Neue Bestellungen anzeigen</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Bestellstatus verwalten</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Lieferroute optimieren</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Kunden kontaktieren</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Einnahmen verfolgen</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">✓</span>
                  <span className="text-gray-900">Push-Benachrichtigungen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Starten Sie mit Ihren PWA Apps
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Native App-Erlebnis ohne App Store. Für Kunden und Lieferanten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bestellung"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Jetzt bestellen
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Termin vereinbaren
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
