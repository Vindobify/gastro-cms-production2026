import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AGB - Allgemeine Geschäftsbedingungen | Gastro CMS',
  description: 'Allgemeine Geschäftsbedingungen für Gastro CMS. Transparente Bedingungen für unsere Restaurant-Software.',
  keywords: [
    'agb',
    'allgemeine geschäftsbedingungen',
    'gastro cms agb',
    'nutzungsbedingungen',
    'vertragsbedingungen'
  ],
  openGraph: {
    title: 'AGB - Allgemeine Geschäftsbedingungen | Gastro CMS',
    description: 'Allgemeine Geschäftsbedingungen für Gastro CMS.',
    type: 'website',
    url: 'https://gastro-cms.at/agb',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/agb',
  },
}

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen</h1>
            
            <div className="prose prose-lg max-w-none">
              {/* Coming Soon Banner */}
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-blue-800">Folgt demnächst</h3>
                    <p className="text-blue-700">
                      Unsere Allgemeinen Geschäftsbedingungen befinden sich derzeit in der Erstellung und werden in Kürze verfügbar sein.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AGB in Vorbereitung</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Wir arbeiten an unseren Allgemeinen Geschäftsbedingungen, um Ihnen transparente und faire Nutzungsbedingungen für unsere Gastro CMS Software zu bieten.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt für Fragen</h3>
                  <p className="text-gray-700 mb-4">
                    Bei Fragen zu unseren Geschäftsbedingungen oder der Nutzung unserer Software können Sie uns gerne kontaktieren:
                  </p>
                  <div className="text-left">
                    <p className="text-gray-700">
                      <strong>NextPuls Digital</strong><br />
                      Markt 141<br />
                      2572 Kaumberg<br />
                      Österreich<br />
                      E-Mail: office@gastro-cms.at<br />
                      Telefon: +43 660 546 78 06
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
