import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'PayPal & Stripe Integration - Automatische Splitzahlung',
  description: 'PayPal und Stripe Integration mit automatischer Splitzahlung. Marketplace und Connect für einfache Provision-Abrechnung.',
  keywords: [
    'paypal integration',
    'stripe integration',
    'splitzahlung',
    'marketplace payment',
    'automatische provision',
    'restaurant payment',
    'gastro cms'
  ],
  openGraph: {
    title: 'PayPal & Stripe Integration - Automatische Splitzahlung',
    description: 'PayPal und Stripe Integration mit automatischer Splitzahlung für einfache Provision-Abrechnung.',
    type: 'website',
    url: 'https://gastro-cms.at/features/payment',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features/payment',
  },
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              PayPal & Stripe Integration
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Automatische Splitzahlung - Provision wird automatisch abgerechnet
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Automatische Abrechnung</h2>
                  <p className="text-lg text-purple-100 mb-6">
                    Die 10% Provision wird automatisch von jeder Bestellung abgezogen. Sie erhalten 90% direkt auf Ihr Konto.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-3">✓</span>
                      <span>PayPal Marketplace</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-3">✓</span>
                      <span>Stripe Connect</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-3">✓</span>
                      <span>Automatische Splitzahlung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-3">✓</span>
                      <span>Monatliche Abrechnung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-3">✓</span>
                      <span>Transparente Kosten</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">So funktioniert es</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-purple-400 mr-3 mt-1">1️⃣</span>
                      <div>
                        <h4 className="font-bold">Kunde zahlt</h4>
                        <p className="text-sm text-purple-100">Bestellung wird über PayPal/Stripe bezahlt</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-purple-400 mr-3 mt-1">2️⃣</span>
                      <div>
                        <h4 className="font-bold">Automatische Aufteilung</h4>
                        <p className="text-sm text-purple-100">90% an Sie, 10% an Gastro CMS</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-purple-400 mr-3 mt-1">3️⃣</span>
                      <div>
                        <h4 className="font-bold">Direkte Überweisung</h4>
                        <p className="text-sm text-purple-100">Geld kommt direkt auf Ihr Konto</p>
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
            Zahlungsoptionen & Integration
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">PayPal Integration</h3>
              <p className="text-gray-600">
                PayPal Marketplace für automatische Splitzahlung. Ihre Kunden können mit PayPal bezahlen.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Stripe Connect</h3>
              <p className="text-gray-600">
                Stripe Connect für professionelle Zahlungsabwicklung mit automatischer Provision-Abrechnung.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automatische Aufteilung</h3>
              <p className="text-gray-600">
                Die 10% Provision wird automatisch von jeder Bestellung abgezogen. Sie erhalten 90% direkt.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Transparente Abrechnung</h3>
              <p className="text-gray-600">
                Monatliche Abrechnung mit detaillierter Aufstellung aller Zahlungen und Provisionen.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Sichere Zahlungen</h3>
              <p className="text-gray-600">
                PCI-DSS konforme Zahlungsabwicklung. Ihre Kundendaten sind sicher geschützt.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">International</h3>
              <p className="text-gray-600">
                Unterstützung für verschiedene Währungen und internationale Zahlungsmethoden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Automatische Provision-Abrechnung
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Kunde bestellt</h3>
              <p className="text-gray-600">
                Kunde wählt Zahlungsmethode (PayPal, Karte, etc.) und bezahlt die Bestellung.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automatische Aufteilung</h3>
              <p className="text-gray-600">
                System teilt automatisch auf: 90% an Sie, 10% an Gastro CMS. Keine manuelle Abrechnung nötig.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Direkte Überweisung</h3>
              <p className="text-gray-600">
                Ihr Anteil wird direkt auf Ihr Konto überwiesen. Monatliche Abrechnung für Transparenz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Starten Sie mit automatischer Zahlungsabwicklung
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Einfache Integration, automatische Abrechnung, transparente Kosten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bestellung"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Jetzt bestellen
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-purple-600 transition-colors"
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
