import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Roadmap & Updates - Gastro CMS Entwicklungsplan',
  description: 'Roadmap für Gastro CMS Updates. Nächstes großes Update am 1. Oktober 2025 mit Kassensystem-Integration und API-System.',
  keywords: [
    'roadmap',
    'updates',
    'entwicklungsplan',
    'gastro cms roadmap',
    'kassensystem integration',
    'api system',
    'buchhaltung'
  ],
  openGraph: {
    title: 'Roadmap & Updates - Gastro CMS Entwicklungsplan',
    description: 'Roadmap für Gastro CMS Updates. Nächstes großes Update am 1. Oktober 2025.',
    type: 'website',
    url: 'https://gastro-cms.at/roadmap',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/roadmap',
  },
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🚀 Roadmap & Updates
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Die Zukunft von Gastro CMS - Was kommt als nächstes?
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Gastro CMS 3.0 ist verfügbar!</h2>
                  <p className="text-lg text-indigo-100 mb-6">
                    <strong>Gastro CMS 3.0</strong> ist bereits verfügbar mit allen aktuellen Features. 
                    Weitere Updates folgen kontinuierlich.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Alle aktuellen Features verfügbar</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>10% Provision statt 30%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Eigene Domain inklusive</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>PWA Apps für alle Geräte</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-400 mr-3">✓</span>
                      <span>Vollständige Kontrolle</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Jetzt verfügbar!</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">🚀</span>
                      <div>
                        <h4 className="font-bold">Gastro CMS 3.0</h4>
                        <p className="text-sm text-indigo-100">Bereits verfügbar</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">📅</span>
                      <div>
                        <h4 className="font-bold">Nächste Updates</h4>
                        <p className="text-sm text-indigo-100">Kontinuierlich</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">🆓</span>
                      <div>
                        <h4 className="font-bold">Kostenlos</h4>
                        <p className="text-sm text-indigo-100">Für alle Kunden</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-400 mr-3 mt-1">⚡</span>
                      <div>
                        <h4 className="font-bold">Sofort starten</h4>
                        <p className="text-sm text-indigo-100">Keine Wartezeit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Entwicklungsroadmap
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            
            {/* Timeline Items */}
            <div className="space-y-16">
              {/* Q1 2024 - Completed */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">Abgeschlossen</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Q1 2024 - Grundfunktionen</h3>
                    <p className="text-gray-600 mb-4">Die Basis von Gastro CMS wurde entwickelt und getestet.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Online-Bestellung & Lieferung</li>
                      <li>• Kundenverwaltung & Dashboard</li>
                      <li>• PayPal & Stripe Integration</li>
                      <li>• PWA Apps für Kunden und Lieferanten</li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="text-2xl font-bold text-gray-400">Q1 2024</div>
                </div>
              </div>

              {/* Q2 2024 - Completed */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="text-2xl font-bold text-gray-400">Q2 2024</div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">Abgeschlossen</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Q2 2024 - Erweiterte Features</h3>
                    <p className="text-gray-600 mb-4">Weitere wichtige Funktionen wurden hinzugefügt.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Reservierungssystem</li>
                      <li>• Erweiterte Analytics</li>
                      <li>• Mobile Optimierung</li>
                      <li>• Performance-Verbesserungen</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Q3 2024 - Current */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">Aktuell</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Q3 2024 - SEO & Marketing</h3>
                    <p className="text-gray-600 mb-4">Fokus auf Sichtbarkeit und Benutzerfreundlichkeit.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vollständige SEO-Optimierung</li>
                      <li>• Responsive Design Verbesserungen</li>
                      <li>• Performance-Optimierung</li>
                      <li>• Benutzerfreundlichkeit</li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="text-2xl font-bold text-gray-400">Q3 2024</div>
                </div>
              </div>

              {/* Q4 2024 - Planning */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="text-2xl font-bold text-gray-400">Q4 2024</div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">In Planung</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Q4 2024 - Vorbereitung</h3>
                    <p className="text-gray-600 mb-4">Vorbereitung für das große Update 2025.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• API-Architektur vorbereiten</li>
                      <li>• Kassensystem-Integration testen</li>
                      <li>• Beta-Testing mit ausgewählten Kunden</li>
                      <li>• Performance-Tests</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Q1 2025 - Major Update */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center mb-2">
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">Großes Update</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Q1 2025 - API-System</h3>
                    <p className="text-indigo-100 mb-4">Vollständiges API-System für Buchhaltung und Integration.</p>
                    <ul className="text-sm text-indigo-100 space-y-1">
                      <li>• RESTful API für alle Funktionen</li>
                      <li>• Webhook-System</li>
                      <li>• Drittanbieter-Integrationen</li>
                      <li>• Erweiterte Dokumentation</li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="text-2xl font-bold text-gray-400">Q1 2025</div>
                </div>
              </div>

              {/* Q2 2025 - Kassensystem */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="text-2xl font-bold text-gray-400">Q2 2025</div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <div className="flex items-center mb-2">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">In Entwicklung</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Q2 2025 - Kassensystem-Integration</h3>
                    <p className="text-gray-600 mb-4">Vollständige Integration mit allen gängigen Kassensystemen.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Standardisierte API-Schnittstelle</li>
                      <li>• Automatische Synchronisation</li>
                      <li>• Echtzeit-Datenübertragung</li>
                      <li>• Universelle Kompatibilität</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Q3 2025 - Release */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center mb-2">
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">🚀 Veröffentlicht!</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Q3 2025 - Gastro CMS 3.0</h3>
                    <p className="text-green-100 mb-4">Gastro CMS 3.0 ist nun veröffentlicht! Das größte Update in der Geschichte von Gastro CMS.</p>
                    <ul className="text-sm text-green-100 space-y-1">
                      <li>• Alle neuen Features verfügbar</li>
                      <li>• Vollständige API-Integration</li>
                      <li>• Erweiterte Sicherheit</li>
                      <li>• Optimierte Performance</li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="text-2xl font-bold text-gray-400">Q3 2025</div>
                </div>
              </div>

              {/* Q4 2025 - Major Release */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="text-2xl font-bold text-gray-400">1. Oktober 2025</div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center mb-2">
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">🚀 Großes Update</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Update 1.10.2025 - Die Zukunft</h3>
                    <p className="text-indigo-100 mb-4">Das größte Update in der Geschichte von Gastro CMS.</p>
                    <ul className="text-sm text-indigo-100 space-y-1">
                      <li>• Vollständige Kassensystem-Integration</li>
                      <li>• API-System für Buchhaltung</li>
                      <li>• Multi-Restaurant Management</li>
                      <li>• KI-gestützte Empfehlungen</li>
                      <li>• Erweiterte Analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Was kommt im Update 1.10.2025?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-bold mb-3">Kassensystem-Integration</h3>
              <p className="text-gray-600 mb-4">
                Vollständige Integration mit allen gängigen Kassensystemen. Automatische Synchronisation von Produkten, Preisen und Bestellungen.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Standardisierte API-Schnittstelle</li>
                <li>• Automatische Synchronisation</li>
                <li>• Echtzeit-Datenübertragung</li>
                <li>• Einfache Integration</li>
                <li>• Universelle Kompatibilität</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-xl font-bold mb-3">API-System</h3>
              <p className="text-gray-600 mb-4">
                Vollständiges RESTful API-System für Buchhaltung und Drittanbieter-Integrationen. Webhooks und umfassende Dokumentation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RESTful API</li>
                <li>• Webhook-System</li>
                <li>• Buchhaltungs-Integration</li>
                <li>• Drittanbieter-APIs</li>
                <li>• Umfassende Dokumentation</li>
              </ul>
            </div>
            
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">KI-gestützte Empfehlungen</h3>
              <p className="text-gray-600 mb-4">
                Künstliche Intelligenz analysiert Ihre Daten und gibt Empfehlungen für Preise, Menü-Optimierung und Marketing.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Preisoptimierung</li>
                <li>• Menü-Empfehlungen</li>
                <li>• Marketing-Vorschläge</li>
                <li>• Umsatzprognosen</li>
                <li>• Kundenverhalten-Analyse</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Erweiterte Analytics</h3>
              <p className="text-gray-600 mb-4">
                Detaillierte Berichte und Analysen für bessere Geschäftsentscheidungen. Echtzeit-Dashboards und Prognosen.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Echtzeit-Dashboards</li>
                <li>• Detaillierte Berichte</li>
                <li>• Umsatzprognosen</li>
                <li>• Kundenanalyse</li>
                <li>• Export-Funktionen</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Erweiterte Sicherheit</h3>
              <p className="text-gray-600 mb-4">
                Höchste Sicherheitsstandards mit 2FA, Verschlüsselung und Compliance für alle gängigen Standards.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zwei-Faktor-Authentifizierung</li>
                <li>• End-to-End-Verschlüsselung</li>
                <li>• DSGVO-Compliance</li>
                <li>• PCI-DSS Konformität</li>
                <li>• Regelmäßige Sicherheitsupdates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Seien Sie dabei beim großen Update!
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Werden Sie Teil der Gastro CMS Community und erhalten Sie das Update 1.10.2025 kostenlos.
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
