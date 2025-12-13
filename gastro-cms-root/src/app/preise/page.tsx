import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Gastro CMS Preise - Nur €180/Jahr + 10% Provision',
  description: 'Transparente Gastro CMS Preise: Jährlich €180 + nur 10% Provision. Sparen Sie tausende Euro vs. anderen Anbietern. Kostenlos testen!',
  keywords: [
    'gastro cms preise',
    'gastro cms kosten',
    '10 prozent provision',
    'niedrige provision restaurant',
    'restaurant software preise',
    'günstige restaurant software',
    'restaurant software jährlich'
  ],
  openGraph: {
    title: 'Gastro CMS Preise - Nur €180/Jahr + 10% Provision',
    description: 'Transparente Gastro CMS Preise: Jährlich €180 + nur 10% Provision. Sparen Sie tausende Euro vs. anderen Anbietern.',
    type: 'website',
    url: 'https://gastro-cms.at/preise',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/preise',
  },
}

export default function PreisePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Gastro CMS Preise
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Transparente Preise - Keine versteckten Kosten
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Jährlich nur €180</h2>
                  <p className="text-lg text-blue-100 mb-6">
                    + 10% Provision pro Bestellung
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Eigene Domain inklusive</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Online-Bestellung & Takeaway</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Dashboard & Verwaltung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Mobile Apps</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Österreichischer Support</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Transparente Kosten</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Jährliche Gebühr:</span>
                      <span className="text-green-300">€180</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provision pro Bestellung:</span>
                      <span className="text-green-300">10%</span>
                    </div>
                    <div className="border-t border-white/30 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Keine versteckten Kosten</span>
                        <span className="text-green-300">✓</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Keine Mindestvertragslaufzeit</span>
                        <span className="text-green-300">✓</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-100 mt-4">
                    * Alle Preise inklusive MwSt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vergleichstabelle */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Vergleich: Gastro CMS vs. anderen Anbietern
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Gastro CMS</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Andere Anbieter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Provision</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-bold">10%</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600 font-bold">30%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Jährliche Gebühr</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-bold">€180</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">Wissen wir nicht!</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Eigene Domain</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓ Inklusive</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">✗ Nein</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Mobile Apps</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓ Inklusive</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">✗ Nein</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Kundendaten</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓ Vollständig</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">✗ Begrenzt</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Support</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓ Österreichisch</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">International</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Mindestvertrag</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓ Keine</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">✗ Ja</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Preisrechner */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Berechnen Sie Ihre Ersparnis
          </h2>
          
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">Berechnen Sie Ihre Ersparnis</h3>
                <p className="text-gray-600 mb-8">
                  <strong>Beispiel bei €10.000 monatlichem Umsatz:</strong> Bei anderen Anbietern zahlen Sie bis zu €3.000 Provision (30%), 
                  bei Gastro CMS nur €1.000 (10%). Das sind €2.000 Ersparnis pro Monat oder €24.000 pro Jahr. 
                  Dazu nur €180 Jahresgebühr für die komplette Software.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Andere Anbieter (30%):</span>
                      <span className="text-red-600 font-bold">€3.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastro CMS (10%):</span>
                      <span className="text-blue-600 font-bold">€1.000</span>
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Ihre Ersparnis/Monat:</span>
                        <span className="text-green-600">€2.000</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Ihre Ersparnis/Jahr:</span>
                        <span className="text-green-600">€24.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
            <div className="mt-8 text-center">
              <a
                href="#contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Jetzt Termin vereinbaren
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Häufige Fragen zu den Preisen
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">Gibt es versteckte Kosten?</h3>
              <p className="text-gray-600">
                Nein, bei Gastro CMS gibt es keine versteckten Kosten. Sie zahlen nur die jährliche Gebühr von €180 und 10% Provision pro Bestellung. Alle Features wie Online-Bestellung, Lieferung & Takeaway, mobile Apps und Support sind inklusive.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">Wie funktioniert die 10% Provision?</h3>
              <p className="text-gray-600">
                Von jeder Bestellung über Ihr Gastro CMS System erhalten Sie 90% des Bestellwerts, Gastro CMS erhält 10%. Die Abrechnung erfolgt monatlich automatisch. Keine zusätzlichen Gebühren oder versteckten Kosten.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">Kann ich meine bestehende Domain nutzen?</h3>
              <p className="text-gray-600">
                Ja, Sie können Ihre bestehende Domain verwenden oder wir registrieren Ihnen eine neue Domain für Ihr Gastro CMS 3.0. Die Domain und Hosting-Gebühren sind in der jährlichen Gebühr von €180 enthalten.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">Gibt es eine Mindestvertragslaufzeit?</h3>
              <p className="text-gray-600">
                Nein, bei Gastro CMS gibt es keine Mindestvertragslaufzeit. Du kannst jederzeit kündigen, ohne zusätzliche Kosten oder Strafen. Wir setzen auf Überzeugung statt auf Vertragsbindung.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
