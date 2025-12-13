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


export default function AGBPage() {
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
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Stand:</strong> 17. September 2025 | <strong>Version:</strong> 1.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
                <p className="text-gray-700 mb-4">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen {restaurantName} (nachfolgend "Anbieter") und den Nutzern unseres Online-Bestellsystems (nachfolgend "Kunde").
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Anbieter:</strong><br/>
                  {restaurantName}<br/>
                  {settings?.address && (
                    <span dangerouslySetInnerHTML={{ __html: settings.address }} />
                  )}
                  {settings?.postalCode && settings?.city && `${settings.postalCode} ${settings.city}<br/>`}
                  Österreich
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 2 Leistungsgegenstand</h2>
                <p className="text-gray-700 mb-4">
                  Der Anbieter stellt ein webbasiertes Restaurant-Management-System (Gastro CMS) zur Verfügung, das folgende Funktionen umfasst:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Speisekarten-Management</li>
                  <li>Bestellverwaltung</li>
                  <li>Kundenverwaltung</li>
                  <li>Lieferanten-Management</li>
                  <li>Umsatz-Analyse</li>
                  <li>Online-Bestellsystem</li>
                  <li>Mobile App für Lieferanten</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 3 Vertragsschluss</h2>
                <p className="text-gray-700 mb-4">
                  Der Vertrag kommt durch die Registrierung des Kunden im Gastro CMS System zustande. Mit der Registrierung erkennt der Kunde diese AGB an.
                </p>
                <p className="text-gray-700 mb-4">
                  Der Anbieter behält sich vor, die Registrierung ohne Angabe von Gründen abzulehnen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 4 Nutzungsrechte</h2>
                <p className="text-gray-700 mb-4">
                  Der Kunde erhält ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung des Gastro CMS Systems für die Dauer des Vertragsverhältnisses.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Nicht gestattet ist:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Weitergabe der Zugangsdaten an Dritte</li>
                  <li>Reverse Engineering des Systems</li>
                  <li>Kommerzielle Nutzung außerhalb des vereinbarten Rahmens</li>
                  <li>Eingriffe in die Systemarchitektur</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 5 Verfügbarkeit und Wartung</h2>
                <p className="text-gray-700 mb-4">
                  Der Anbieter gewährleistet eine Verfügbarkeit des Systems von 99% im Jahresmittel. Ausgenommen sind geplante Wartungsarbeiten und höhere Gewalt.
                </p>
                <p className="text-gray-700 mb-4">
                  Wartungsarbeiten werden nach Möglichkeit außerhalb der Geschäftszeiten durchgeführt und mindestens 24 Stunden im Voraus angekündigt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 6 Datenschutz und Datensicherheit</h2>
                <p className="text-gray-700 mb-4">
                  Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutz-Grundverordnung (DSGVO) und unserer Datenschutzerklärung.
                </p>
                <p className="text-gray-700 mb-4">
                  Der Anbieter verpflichtet sich, angemessene technische und organisatorische Maßnahmen zum Schutz der Daten zu treffen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 7 Haftung</h2>
                <p className="text-gray-700 mb-4">
                  Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Haftungsausschluss für:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Verluste durch höhere Gewalt</li>
                  <li>Schäden durch unsachgemäße Nutzung</li>
                  <li>Ausfallzeiten durch Wartungsarbeiten</li>
                  <li>Datenverluste durch fehlende Backups des Kunden</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 8 Kündigung</h2>
                <p className="text-gray-700 mb-4">
                  Der Vertrag kann von beiden Parteien mit einer Frist von 30 Tagen zum Monatsende gekündigt werden.
                </p>
                <p className="text-gray-700 mb-4">
                  Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 9 Schlussbestimmungen</h2>
                <p className="text-gray-700 mb-4">
                  Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                </p>
                <p className="text-gray-700 mb-4">
                  Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts.
                </p>
                <p className="text-gray-700 mb-4">
                  Gerichtsstand ist Wien, Österreich.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">§ 10 Kontakt</h2>
                <p className="text-gray-700 mb-4">
                  Bei Fragen zu diesen AGB wenden Sie sich bitte an:
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