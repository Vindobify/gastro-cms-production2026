import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DatenauskunftForm from '@/components/DatenauskunftForm'

export const metadata: Metadata = {
  title: 'Datenauskunft & Datenschutz | Gastro CMS Österreich',
  description: 'DSGVO-konforme Datenauskunft und Datenlöschung für Gastro CMS - Ihre Rechte als Betroffener',
  keywords: [
    'datenauskunft',
    'dsgvo',
    'datenlöschung',
    'betroffenenrechte',
    'gastro cms datenschutz',
    'datenabfrage'
  ],
  openGraph: {
    title: 'Datenauskunft & Datenschutz | Gastro CMS Österreich',
    description: 'DSGVO-konforme Datenauskunft und Datenlöschung für Gastro CMS',
    type: 'website',
    url: 'https://gastro-cms.at/datenauskunft',
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Datenauskunft & Datenschutz | Gastro CMS Österreich',
    description: 'DSGVO-konforme Datenauskunft und Datenlöschung für Gastro CMS',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/datenauskunft',
    languages: {
      'de-AT': 'https://gastro-cms.at/datenauskunft',
    },
  },
}

export default function DatenauskunftPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50" role="main">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              DSGVO-Datenauskunft
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ihre Rechte als Betroffener - Auskunft, Berichtigung, Löschung und mehr
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ihre DSGVO-Rechte
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">1</span>
                    Auskunftsrecht (Art. 15 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie haben das Recht zu erfahren, ob und welche personenbezogenen Daten von Ihnen verarbeitet werden, 
                    zu welchem Zweck, wie lange sie gespeichert werden und an wen sie weitergegeben werden.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">2</span>
                    Berichtigungsrecht (Art. 16 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie können die Berichtigung unrichtiger oder die Vervollständigung unvollständiger 
                    personenbezogener Daten verlangen.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">3</span>
                    Löschungsrecht (Art. 17 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie können die Löschung Ihrer personenbezogenen Daten verlangen, wenn bestimmte 
                    Voraussetzungen erfüllt sind (z.B. wenn die Daten nicht mehr benötigt werden).
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">4</span>
                    Einschränkungsrecht (Art. 18 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie können die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten verlangen, 
                    wenn bestimmte Voraussetzungen erfüllt sind.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">5</span>
                    Widerspruchsrecht (Art. 21 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie können der Verarbeitung Ihrer personenbezogenen Daten aus Gründen Ihres 
                    besonderen Situation widersprechen.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">6</span>
                    Datenübertragbarkeit (Art. 20 DSGVO)
                  </h3>
                  <p className="text-gray-600">
                    Sie haben das Recht, die Sie betreffenden personenbezogenen Daten in einem 
                    strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Wichtige Informationen
                </h3>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Antwortfrist: 30 Tage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Kostenlos für Sie</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Identifikation erforderlich</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Antwort per E-Mail</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  Kontakt
                </h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p><strong>E-Mail:</strong> office@gastro-cms.at</p>
                  <p><strong>Telefon:</strong> +43 660 546 78 06</p>
                  <p><strong>Adresse:</strong><br />Markt 141<br />2572 Kaumberg, Österreich</p>
                </div>
              </div>
            </div>
          </div>

          <DatenauskunftForm />
        </div>
      </div>

      <Footer />
    </main>
  )
}