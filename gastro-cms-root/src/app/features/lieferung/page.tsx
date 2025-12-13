import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Lieferung & Takeaway - Online Bestellung für Restaurants',
  description: 'Eigenes Lieferportal für Ihr Restaurant. Online Bestellung, Lieferung und Takeaway verwalten. Keine Provision an Dritte!',
  keywords: [
    'lieferung restaurant',
    'takeaway system',
    'online bestellung',
    'eigenes lieferportal',
    'restaurant lieferung',
    'bestellsystem restaurant',
    'gastro cms'
  ],
  openGraph: {
    title: 'Lieferung & Takeaway - Online Bestellung für Restaurants',
    description: 'Eigenes Lieferportal für Ihr Restaurant. Online Bestellung, Lieferung und Takeaway verwalten.',
    type: 'website',
    url: 'https://gastro-cms.at/features/lieferung',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features/lieferung',
  },
}

export default function LieferungPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Lieferung & Takeaway
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Eigenes Lieferportal - 100% Kontrolle über Ihre Bestellungen
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Keine Provision an Dritte</h2>
                  <p className="text-lg text-orange-100 mb-6">
                    Mit Ihrem eigenen Lieferportal behalten Sie 100% der Bestellungen und zahlen nur 10% an Gastro CMS.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-3">✓</span>
                      <span>Eigenes Lieferportal</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-3">✓</span>
                      <span>Online Bestellung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-3">✓</span>
                      <span>Takeaway & Lieferung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-3">✓</span>
                      <span>Live-Tracking</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-3">✓</span>
                      <span>Automatische Benachrichtigungen</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Ihre Vorteile</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-orange-400 mr-3 mt-1">💰</span>
                      <div>
                        <h4 className="font-bold">Mehr Gewinn</h4>
                        <p className="text-sm text-orange-100">Nur 10% statt bis zu 30% Provision</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-400 mr-3 mt-1">👥</span>
                      <div>
                        <h4 className="font-bold">Kundendaten</h4>
                        <p className="text-sm text-orange-100">Vollständige Kontrolle über Ihre Kunden</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-400 mr-3 mt-1">📱</span>
                      <div>
                        <h4 className="font-bold">Mobile Apps</h4>
                        <p className="text-sm text-orange-100">Für Kunden und Lieferanten</p>
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
            Features Ihrer Lieferung & Takeaway
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Live-Tracking</h3>
              <p className="text-gray-600">
                Ihre Kunden können den Status ihrer Bestellung in Echtzeit verfolgen - von der Bestellung bis zur Lieferung.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Mobile Apps</h3>
              <p className="text-gray-600">
                Separate Apps für Kunden und Lieferanten. Push-Benachrichtigungen für neue Bestellungen und Updates.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Lieferzeiten</h3>
              <p className="text-gray-600">
                Flexible Lieferzeiten einstellen. Automatische Berechnung basierend auf Entfernung und aktueller Auslastung.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Zahlungsoptionen</h3>
              <p className="text-gray-600">
                PayPal, Stripe, Barzahlung, Kartenzahlung. Automatische Splitzahlung für Provision.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Analytics</h3>
              <p className="text-gray-600">
                Detaillierte Statistiken über Bestellungen, beliebte Gerichte und Lieferzeiten.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Benachrichtigungen</h3>
              <p className="text-gray-600">
                Automatische E-Mails und SMS für Bestellbestätigungen, Status-Updates und Lieferbenachrichtigungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Starten Sie mit Ihrem eigenen Lieferportal
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Behalten Sie die Kontrolle über Ihre Bestellungen und sparen Sie tausende Euro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bestellung"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Jetzt bestellen
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
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
