'use client'

import React from 'react'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'

// Client-side function to get restaurant settings
function useRestaurantSettings() {
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}


export default function DatenschutzPage() {
  const { settings, loading } = useRestaurantSettings();
  const restaurantName = settings?.restaurantName || 'Restaurant';

  if (loading) {
    return (
      <main className="min-h-screen bg-surface">
        <Header />
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Stand:</strong> 17. September 2025 | <strong>Version:</strong> 1.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">1. Verantwortlicher</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>{restaurantName}</strong><br/>
                  {settings?.address && (
                    <span dangerouslySetInnerHTML={{ __html: settings.address }} />
                  )}
                  {settings?.postalCode && settings?.city && `${settings.postalCode} ${settings.city}<br/>`}
                  Österreich</p>
                  {settings?.email && (
                    <p className="mt-2">
                      <strong>E-Mail:</strong> {settings.email}<br/>
                      {settings?.phone && <><strong>Telefon:</strong> {settings.phone}<br/></>}
                    </p>
                  )}
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">2. Allgemeines zur Datenverarbeitung</h2>
                <p className="text-gray-700 mb-4">
                  Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten durch unser Gastro CMS System.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Rechtsgrundlage:</strong> Diese Datenschutzerklärung basiert auf der Datenschutz-Grundverordnung (DSGVO) und dem österreichischen Datenschutzgesetz (DSG).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">3. Erhebung und Verarbeitung personenbezogener Daten</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Automatisch erhobene Daten</h3>
                <p className="text-gray-700 mb-4">
                  Bei jedem Besuch unserer Website werden automatisch folgende Daten erhoben und gespeichert:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>IP-Adresse (anonymisiert)</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Übertragene Datenmenge</li>
                  <li>Meldung über erfolgreichen Abruf</li>
                  <li>Browsertyp und -version</li>
                  <li>Betriebssystem</li>
                  <li>Referrer-URL (die zuvor besuchte Seite)</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)<br/>
                  <strong>Zweck:</strong> Sicherstellung der Funktionsfähigkeit und Sicherheit der Website
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Bestellungen und Kundenverwaltung</h3>
                <p className="text-gray-700 mb-4">
                  Bei der Nutzung unseres Gastro CMS Systems verarbeiten wir folgende personenbezogene Daten:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Name und Kontaktdaten (E-Mail, Telefon, Adresse)</li>
                  <li>Bestelldaten und Lieferadressen</li>
                  <li>Zahlungsinformationen (verschlüsselt)</li>
                  <li>Präferenzen und Einstellungen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)<br/>
                  <strong>Zweck:</strong> Abwicklung von Bestellungen und Kundenbetreuung
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">4. Cookies und Tracking</h2>
                <p className="text-gray-700 mb-4">
                  Unsere Website verwendet Cookies, um die Funktionalität zu verbessern und die Nutzung zu analysieren.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Cookie-Kategorien</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-brand-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Notwendige Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Helfen uns zu verstehen, wie Besucher mit der Website interagieren. IP-Adressen werden anonymisiert.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Werden für personalisierte Werbung verwendet. Derzeit nicht aktiv.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Google Analytics 4</h3>
                <p className="text-gray-700 mb-4">
                  Wir verwenden Google Analytics 4 mit aktivierter IP-Anonymisierung. Die Datenverarbeitung erfolgt nur mit Ihrer Einwilligung.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Anbieter:</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland<br/>
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)<br/>
                  <strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen widerrufen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">5. Ihre Rechte</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
                  <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
                  <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
                  <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                  <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                  <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
                  <li><strong>Recht auf Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: office@nextpuls.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">6. Datensicherheit</h2>
                <p className="text-gray-700 mb-4">
                  Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten vor unbefugtem Zugriff, Verlust, Missbrauch oder Veränderung zu schützen.
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                  <li>Regelmäßige Sicherheitsupdates</li>
                  <li>Zugriffsbeschränkungen und Authentifizierung</li>
                  <li>Regelmäßige Backups</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">7. Speicherdauer</h2>
                <p className="text-gray-700 mb-4">
                  Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Bestelldaten:</strong> 7 Jahre (Aufbewahrungspflicht nach UGB)</li>
                  <li><strong>Kundendaten:</strong> Bis zur Löschung des Kontos</li>
                  <li><strong>Log-Daten:</strong> 30 Tage</li>
                  <li><strong>Cookie-Daten:</strong> Je nach Cookie-Typ (siehe Cookie-Einstellungen)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">8. Beschwerderecht</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben das Recht, sich bei der österreichischen Datenschutzbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Österreichische Datenschutzbehörde</strong><br/>
                  Barichgasse 40-42<br/>
                  1030 Wien<br/>
                  Österreich</p>
                  <p className="mt-2">
                    <strong>E-Mail:</strong> dsb@dsb.gv.at<br/>
                    <strong>Website:</strong> www.dsb.gv.at
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">9. Änderungen dieser Datenschutzerklärung</h2>
                <p className="text-gray-700 mb-4">
                  Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. Die aktuelle Version finden Sie stets auf dieser Seite.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">10. Kontakt</h2>
                <p className="text-gray-700 mb-4">
                  Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
                </p>
                <div className="bg-brand-50 p-4 rounded-lg">
                  <p><strong>{restaurantName}</strong><br/>
                  {settings?.address && (
                    <span dangerouslySetInnerHTML={{ __html: settings.address }} />
                  )}
                  {settings?.postalCode && settings?.city && `${settings.postalCode} ${settings.city}<br/>`}
                  Österreich</p>
                  {settings?.email && (
                    <p className="mt-2">
                      <strong>E-Mail:</strong> {settings.email}<br/>
                      {settings?.phone && <><strong>Telefon:</strong> {settings.phone}<br/></>}
                    </p>
                  )}
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