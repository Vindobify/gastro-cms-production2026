import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieManagementForm from '@/components/CookieManagementForm'

export const metadata: Metadata = {
  title: 'Cookie-Management | Gastro CMS Österreich',
  description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
  keywords: [
    'cookie management',
    'cookie einstellungen',
    'cookies löschen',
    'dsgvo cookies',
    'gastro cms cookies'
  ],
  openGraph: {
    title: 'Cookie-Management | Gastro CMS Österreich',
    description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
    type: 'website',
    url: 'https://gastro-cms.at/cookies',
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie-Management | Gastro CMS Österreich',
    description: 'Cookie-Einstellungen verwalten und Cookies löschen - DSGVO-konforme Cookie-Verwaltung',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/cookies',
    languages: {
      'de-AT': 'https://gastro-cms.at/cookies',
    },
  },
}

export default function CookiesPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50" role="main">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cookie-Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Verwalten Sie Ihre Cookie-Einstellungen und löschen Sie alle Cookies
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Was sind Cookies?
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Definition
                  </h3>
                  <p className="text-gray-600">
                    Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. 
                    Sie helfen dabei, Ihre Präferenzen zu speichern und die Website-Funktionalität zu verbessern.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Arten von Cookies
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notwendige Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden. 
                        Sie werden normalerweise nur als Reaktion auf Aktionen gesetzt, die Sie durchführen.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, 
                        indem sie Informationen anonym sammeln und melden.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Diese Cookies werden verwendet, um Besuchern relevante Anzeigen und Marketingkampagnen bereitzustellen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ihre Rechte
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Sie können jederzeit Ihre Einwilligung widerrufen</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Sie können Cookies in Ihrem Browser löschen</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Sie können die Cookie-Einstellungen anpassen</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Sie haben das Recht auf Auskunft über verwendete Cookies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Browser-Einstellungen
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Sie können Cookies auch direkt in Ihrem Browser verwalten:
                </p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Chrome: Einstellungen → Datenschutz und Sicherheit</li>
                  <li>• Firefox: Einstellungen → Datenschutz & Sicherheit</li>
                  <li>• Safari: Einstellungen → Datenschutz</li>
                  <li>• Edge: Einstellungen → Cookies und Websiteberechtigungen</li>
                </ul>
              </div>

              <div className="mt-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  Wichtige Hinweise
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Notwendige Cookies können nicht deaktiviert werden</li>
                  <li>• Das Löschen aller Cookies meldet Sie ab</li>
                  <li>• Einstellungen werden 180 Tage gespeichert</li>
                  <li>• Sie können jederzeit Änderungen vornehmen</li>
                </ul>
              </div>
            </div>
          </div>

          <CookieManagementForm />
        </div>
      </div>

      <Footer />
    </main>
  )
}