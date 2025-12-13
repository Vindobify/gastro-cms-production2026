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


export default function DatenauskunftPage() {
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
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Datenauskunft</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Stand:</strong> 17. September 2025 | <strong>Version:</strong> 1.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Ihre Rechte gemäß DSGVO</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben das Recht zu erfahren, welche personenbezogenen Daten wir über Sie verarbeiten. 
                  Nutzen Sie dieses Formular, um eine Datenauskunft zu beantragen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Antrag auf Datenauskunft</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Vollständiger Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="Max Mustermann"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-Mail-Adresse *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="max.mustermann@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefonnummer (optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="+43 123 456 789"
                      />
                    </div>

                    <div>
                      <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                        Art der Anfrage *
                      </label>
                      <select
                        id="requestType"
                        name="requestType"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="auskunft">Datenauskunft</option>
                        <option value="berichtigung">Datenberichtigung</option>
                        <option value="loeschung">Datenlöschung</option>
                        <option value="einschraenkung">Einschränkung der Verarbeitung</option>
                        <option value="uebertragbarkeit">Datenübertragbarkeit</option>
                        <option value="widerspruch">Widerspruch</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Zusätzliche Informationen (optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="Beschreiben Sie hier Ihre Anfrage genauer..."
                      />
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="privacy"
                        name="privacy"
                        required
                        className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                      />
                      <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
                        Ich bestätige, dass die angegebenen Daten korrekt sind und ich berechtigt bin, 
                        diese Anfrage zu stellen. *
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                    >
                      Antrag senden
                    </button>
                  </form>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Bearbeitungszeit</h2>
                <p className="text-gray-700 mb-4">
                  Wir bearbeiten Ihren Antrag innerhalb von 30 Tagen nach Eingang. 
                  Bei komplexen Anfragen kann sich die Bearbeitungszeit auf bis zu 60 Tage verlängern.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Kontakt</h2>
                <p className="text-gray-700 mb-4">
                  Bei Fragen zu Ihrer Datenauskunft wenden Sie sich bitte an:
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
