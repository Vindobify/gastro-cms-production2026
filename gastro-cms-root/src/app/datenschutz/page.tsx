import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Gastro CMS Österreich',
  description: 'DSGVO-konforme Datenschutzerklärung für Gastro CMS - Transparente Verarbeitung Ihrer Daten gemäß österreichischem Datenschutzrecht',
  keywords: [
    'datenschutz',
    'datenschutzerklärung',
    'dsgvo',
    'gastro cms datenschutz',
    'personenbezogene daten',
    'cookie-richtlinie',
    'österreich datenschutz',
    'dsg konform'
  ],
  openGraph: {
    title: 'Datenschutzerklärung | Gastro CMS Österreich',
    description: 'DSGVO-konforme Datenschutzerklärung für Gastro CMS - Transparente Verarbeitung Ihrer Daten',
    type: 'website',
    url: 'https://gastro-cms.at/datenschutz',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/datenschutz',
  },
}

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Stand:</strong> 17. September 2025 | <strong>Version:</strong> 1.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Verantwortlicher</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>NextPuls Digital</strong><br/>
                  Mario Gaupmann<br/>
                  Markt 141<br/>
                  2572 Kaumberg, Österreich</p>
                  <p className="mt-2">
                    <strong>E-Mail:</strong> office@gastro-cms.at<br/>
                    <strong>Telefon:</strong> +43 660 546 78 06
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
                <p className="mb-4">
                  Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung informiert Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten durch NextPuls Digital im Rahmen der Nutzung unserer Gastro CMS Software.
                </p>
                <p className="mb-4">
                  <strong>Rechtsgrundlage:</strong> Die Verarbeitung Ihrer Daten erfolgt auf Grundlage der Datenschutz-Grundverordnung (DSGVO) und des österreichischen Datenschutzgesetzes (DSG).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Erhebung und Verarbeitung personenbezogener Daten</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Kontaktformular und Anfragen</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p><strong>Verarbeitete Daten:</strong> Name, E-Mail-Adresse, Telefonnummer, Restaurant-Name, Nachricht</p>
                  <p><strong>Zweck:</strong> Bearbeitung Ihrer Anfragen, Bereitstellung von Informationen über unsere Dienstleistungen</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)</p>
                  <p><strong>Speicherdauer:</strong> 3 Jahre nach letztem Kontakt</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Bestellformular</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p><strong>Verarbeitete Daten:</strong> Restaurant-Name, Inhaber-Name, E-Mail, Telefon, Adresse, Domain-Präferenzen</p>
                  <p><strong>Zweck:</strong> Vertragserfüllung, Bereitstellung der Gastro CMS Software</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
                  <p><strong>Speicherdauer:</strong> 7 Jahre nach Vertragsende (Aufbewahrungspflichten)</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Terminvereinbarung</h3>
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <p><strong>Verarbeitete Daten:</strong> Name, E-Mail, Telefon, Restaurant-Name, Terminwunsch, Adresse (bei persönlichen Terminen)</p>
                  <p><strong>Zweck:</strong> Terminplanung und -durchführung</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)</p>
                  <p><strong>Speicherdauer:</strong> 1 Jahr nach Termin</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies und Tracking</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Notwendige Cookies</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p><strong>Zweck:</strong> Gewährleistung der Grundfunktionalität der Website</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>
                  <p><strong>Speicherdauer:</strong> Session oder bis zu 1 Jahr</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Analytics Cookies (Google Analytics 4)</h3>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <p><strong>Anbieter:</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland</p>
                  <p><strong>Zweck:</strong> Analyse der Website-Nutzung, Verbesserung der Benutzerfreundlichkeit</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
                  <p><strong>Speicherdauer:</strong> 14 Monate</p>
                  <p><strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit über unser Cookie-Banner widerrufen.</p>
                  <p><strong>Datenschutz:</strong> IP-Adressen werden anonymisiert, Daten werden in der EU verarbeitet.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Ihre Rechte</h2>
                <p className="mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-6 mb-4">
                    <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO): Sie können Auskunft über die verarbeiteten Daten verlangen</li>
                    <li><strong>Berichtigungsrecht</strong> (Art. 16 DSGVO): Sie können die Berichtigung unrichtiger Daten verlangen</li>
                    <li><strong>Löschungsrecht</strong> (Art. 17 DSGVO): Sie können die Löschung Ihrer Daten verlangen</li>
                    <li><strong>Einschränkungsrecht</strong> (Art. 18 DSGVO): Sie können die Einschränkung der Verarbeitung verlangen</li>
                    <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO): Sie können der Verarbeitung widersprechen</li>
                    <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO): Sie können die Übertragung Ihrer Daten verlangen</li>
                  </ul>
                  <p className="mb-4">
                    <strong>Kontakt für Ausübung Ihrer Rechte:</strong> office@gastro-cms.at
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Datensicherheit</h2>
                <p className="mb-4">
                  Wir verwenden geeignete technische und organisatorische Maßnahmen zum Schutz Ihrer Daten:
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-6 mb-4">
                    <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                    <li>Regelmäßige Sicherheitsupdates und -patches</li>
                    <li>Zugriffsbeschränkungen und Authentifizierung</li>
                    <li>Regelmäßige Backups mit Verschlüsselung</li>
                    <li>Schulung unserer Mitarbeiter in Datenschutzfragen</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Datenweitergabe an Dritte</h2>
                <p className="mb-4">
                  Ihre Daten werden grundsätzlich nicht an Dritte weitergegeben. Ausnahmen:
                </p>
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-6 mb-4">
                    <li><strong>Google Analytics:</strong> Nur bei Ihrer Einwilligung, anonymisierte Daten</li>
                    <li><strong>Hosting-Provider:</strong> Technische Bereitstellung der Website</li>
                    <li><strong>Behörden:</strong> Bei gesetzlichen Verpflichtungen</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Beschwerderecht</h2>
                <p className="mb-4">
                  Sie haben das Recht, sich bei der österreichischen Datenschutzbehörde zu beschweren:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Österreichische Datenschutzbehörde</strong><br/>
                  Barichgasse 40-42<br/>
                  1030 Wien<br/>
                  E-Mail: dsb@dsb.gv.at<br/>
                  Telefon: +43 1 52 152-0</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Änderungen dieser Datenschutzerklärung</h2>
                <p className="mb-4">
                  Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. 
                  Wesentliche Änderungen werden wir Ihnen rechtzeitig mitteilen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Kontakt</h2>
                <p className="mb-4">
                  Bei Fragen zum Datenschutz wenden Sie sich bitte an:
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p><strong>E-Mail:</strong> office@gastro-cms.at<br/>
                  <strong>Telefon:</strong> +43 660 546 78 06<br/>
                  <strong>Adresse:</strong> NextPuls Digital, Markt 141, 2572 Kaumberg, Österreich</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
