import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Reservierungssystem - Online Tischreservierung für Restaurants',
  description: 'Online Reservierungssystem für Ihr Restaurant. Tischreservierung, Warteliste, automatische Erinnerungen und mehr.',
  keywords: [
    'reservierungssystem',
    'tischreservierung',
    'online reservierung',
    'restaurant reservierung',
    'warteliste',
    'reservierung app',
    'gastro cms'
  ],
  openGraph: {
    title: 'Reservierungssystem - Online Tischreservierung für Restaurants',
    description: 'Online Reservierungssystem für Ihr Restaurant mit Tischreservierung und Warteliste.',
    type: 'website',
    url: 'https://gastro-cms.at/features/reservierung',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features/reservierung',
  },
}

export default function ReservierungPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-600 to-pink-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Reservierungssystem
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              Online Tischreservierung für Ihr Restaurant
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">24/7 Reservierungen</h2>
                  <p className="text-lg text-pink-100 mb-6">
                    Ihre Gäste können rund um die Uhr Tische reservieren. Automatische Bestätigung und Erinnerungen.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-3">✓</span>
                      <span>Online Reservierung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-3">✓</span>
                      <span>Warteliste</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-3">✓</span>
                      <span>Automatische Erinnerungen</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-3">✓</span>
                      <span>Tischverwaltung</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Vorteile</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-pink-400 mr-3 mt-1">📅</span>
                      <div>
                        <h4 className="font-bold">Weniger Telefonate</h4>
                        <p className="text-sm text-pink-100">Gäste reservieren selbst online</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-pink-400 mr-3 mt-1">⏰</span>
                      <div>
                        <h4 className="font-bold">Bessere Planung</h4>
                        <p className="text-sm text-pink-100">Wissen Sie im Voraus, wer kommt</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-pink-400 mr-3 mt-1">📱</span>
                      <div>
                        <h4 className="font-bold">Mobile Optimiert</h4>
                        <p className="text-sm text-pink-100">Funktioniert perfekt auf dem Handy</p>
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
            Reservierungssystem Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Online Reservierung</h3>
              <p className="text-gray-600">
                Gäste können 24/7 Tische reservieren. Verfügbare Zeiten werden automatisch angezeigt.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Warteliste</h3>
              <p className="text-gray-600">
                Wenn alle Tische belegt sind, können Gäste auf die Warteliste. Automatische Benachrichtigung bei Verfügbarkeit.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automatische Erinnerungen</h3>
              <p className="text-gray-600">
                E-Mail und SMS Erinnerungen vor der Reservierung. Weniger No-Shows, bessere Planung.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🪑</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Tischverwaltung</h3>
              <p className="text-gray-600">
                Verwalten Sie Tische, Sitzplätze und Verfügbarkeiten. Flexible Konfiguration für verschiedene Bereiche.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Analytics</h3>
              <p className="text-gray-600">
                Detaillierte Statistiken über Reservierungen, beliebte Zeiten und No-Show-Raten.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Mobile Optimiert</h3>
              <p className="text-gray-600">
                Perfekt optimiert für mobile Geräte. Schnelle und einfache Reservierung von unterwegs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            So funktioniert das Reservierungssystem
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Gast wählt Termin</h3>
              <p className="text-gray-600">
                Gast wählt Datum, Uhrzeit und Personenzahl. Verfügbare Tische werden automatisch angezeigt.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Reservierung bestätigen</h3>
              <p className="text-gray-600">
                Gast gibt Kontaktdaten ein und bestätigt die Reservierung. Automatische Bestätigungs-E-Mail.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Erinnerung senden</h3>
              <p className="text-gray-600">
                Automatische Erinnerung vor der Reservierung. Sie sehen alle Reservierungen in Ihrem Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Starten Sie mit Ihrem Reservierungssystem
          </h2>
          <p className="text-xl mb-8 text-pink-100">
            Weniger Telefonate, bessere Planung, zufriedenere Gäste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bestellung"
              className="inline-flex items-center px-8 py-4 bg-white text-pink-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Jetzt bestellen
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-pink-600 transition-colors"
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
