import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Kassensystem Integration - Automatische Synchronisation',
  description: 'Integration mit allen gängigen Kassensystemen. Automatische Synchronisation von Bestellungen, Produkten und Kassenabschlüssen.',
  keywords: [
    'kassensystem integration',
    'kasse synchronisation',
    'restaurant kasse',
    'automatische integration',
    'kassensystem anbindung',
    'gastro kasse',
    'gastro cms'
  ],
  openGraph: {
    title: 'Kassensystem Integration - Automatische Synchronisation',
    description: 'Integration mit allen gängigen Kassensystemen für automatische Synchronisation.',
    type: 'website',
    url: 'https://gastro-cms.at/features/kassensystem',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features/kassensystem',
  },
}

export default function KassensystemPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kassensystem Integration
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Automatische Synchronisation mit Ihrem bestehenden Kassensystem
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Nahtlose Integration</h2>
                  <p className="text-lg text-green-100 mb-6">
                    Verbinden Sie Gastro CMS mit Ihrem bestehenden Kassensystem. Automatische Synchronisation von Bestellungen und Produkten.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Automatische Synchronisation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Produktverwaltung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Bestellungen übertragen</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Kassenabschluss</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Echtzeit-Updates</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">API-Schnittstelle geplant</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">📋</span>
                      <span>Eigene API-Schnittstelle</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">🔌</span>
                      <span>Standardisierte Integration</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">⚡</span>
                      <span>Echtzeit-Synchronisation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">📊</span>
                      <span>Automatische Datenübertragung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">⚠️</span>
                      <span>Nur geplant, nicht fix!</span>
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
            Integration Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automatische Synchronisation</h3>
              <p className="text-gray-600">
                Produkte, Preise und Verfügbarkeit werden automatisch zwischen Kassensystem und Gastro CMS synchronisiert.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Bestellungen übertragen</h3>
              <p className="text-gray-600">
                Online-Bestellungen werden automatisch in Ihr Kassensystem übertragen. Keine doppelte Eingabe nötig.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Kassenabschluss</h3>
              <p className="text-gray-600">
                Automatische Übertragung von Kassenabschlüssen und Umsatzdaten für vollständige Transparenz.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Echtzeit-Updates</h3>
              <p className="text-gray-600">
                Änderungen in der Kasse werden sofort im Online-Shop sichtbar. Immer aktuelle Preise.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Einfache Einrichtung</h3>
              <p className="text-gray-600">
                Integration erfolgt über standardisierte Schnittstellen. Meist innerhalb weniger Tage eingerichtet.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Sichere Verbindung</h3>
              <p className="text-gray-600">
                Verschlüsselte Verbindung zwischen den Systemen. Ihre Daten sind sicher geschützt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            So funktioniert die Integration
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Verbindung herstellen</h3>
              <p className="text-gray-600">
                Wir verbinden Gastro CMS mit Ihrem Kassensystem über standardisierte APIs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Produkte synchronisieren</h3>
              <p className="text-gray-600">
                Produkte, Preise und Kategorien werden automatisch zwischen den Systemen synchronisiert.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Bestellungen übertragen</h3>
              <p className="text-gray-600">
                Online-Bestellungen werden automatisch in Ihre Kasse übertragen. Alles läuft nahtlos zusammen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Integrieren Sie Ihr Kassensystem
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Nahtlose Integration mit Ihrem bestehenden System. Automatische Synchronisation, keine doppelte Arbeit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bestellung"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Jetzt bestellen
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-green-600 transition-colors"
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
