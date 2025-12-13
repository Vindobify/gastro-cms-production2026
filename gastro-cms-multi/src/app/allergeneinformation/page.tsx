'use client'

import React from 'react'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'
import { STANDARD_ALLERGENS } from '@/lib/constants'

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

// Detaillierte Allergen-Informationen basierend auf WKO-Richtlinien
function getAllergenDetails(code: string): string {
  const allergenDetails: { [key: string]: string } = {
    'A': 'Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut, Emmer, Einkorn, Grünkern, Triticale, Bulgur, Couscous, Grieß, Mehl, Stärke, Brot, Gebäck, Nudeln, Paniermehl, Malz, Bier, Whisky, Sojasauce (wenn mit Weizen hergestellt)',
    'B': 'Krabben, Hummer, Langusten, Garnelen, Krebse, Scampi, Shrimps, Krebsfleisch, Krebssuppe, Krebssauce, Krebsextrakt',
    'C': 'Eier, Eigelb, Eiklar, Eipulver, Eierlikör, Mayonnaise, Aioli, Remoulade, Backwaren mit Eiern, Nudeln mit Eiern, Eiernudeln, Spätzle, Kaiserschmarrn, Tiramisu, Mousse, Soufflé',
    'D': 'Fisch, Fischfilet, Fischstäbchen, Fischsuppe, Fischsauce, Anchovis, Sardellen, Thunfisch, Lachs, Hering, Makrele, Kabeljau, Seelachs, Forelle, Zander, Hecht, Karpfen, Aal, Muscheln, Austern, Hummer, Krabben, Garnelen, Scampi, Tintenfisch, Oktopus, Schnecken',
    'E': 'Erdnüsse, Erdnussöl, Erdnussbutter, Erdnussflips, Erdnusskerne, Erdnussmehl, Erdnusspaste, Erdnusscreme, Satay-Sauce, Erdnusssoße, Müsli mit Erdnüssen, Schokolade mit Erdnüssen',
    'F': 'Sojabohnen, Sojamehl, Sojaöl, Sojasauce, Sojamilch, Tofu, Tempeh, Miso, Natto, Sojalecithin, Sojaprotein, Sojaeiweiß, Sojabohnenkeime, Edamame, Sojajoghurt, Sojaeis, Sojabutter',
    'G': 'Milch, Milchpulver, Milchzucker (Laktose), Milcheiweiß, Milchfett, Butter, Buttermilch, Sahne, Rahm, Schlagobers, Sauerrahm, Crème fraîche, Joghurt, Quark, Käse, Molke, Molkenpulver, Kefir, Buttermilch, Kondensmilch, Schokolade mit Milch, Eiscreme, Pudding, Milchreis',
    'H': 'Mandeln, Haselnüsse, Walnüsse, Cashewnüsse, Pistazien, Paranüsse, Macadamianüsse, Pekannüsse, Pinienkerne, Marzipan, Nougat, Nussöl, Nussbutter, Nusscreme, Nussmehl, Nusskuchen, Nussbrot, Nussmüsli, Nussriegel, Nussschokolade, Nusseis, Nusslikör',
    'L': 'Sellerie, Sellerieblätter, Selleriesamen, Selleriesalz, Selleriepulver, Selleriesaft, Selleriesuppe, Selleriesalat, Selleriecreme, Selleriesauce, Gewürzmischungen mit Sellerie, Brühe mit Sellerie, Suppenwürfel mit Sellerie',
    'M': 'Senf, Senfkörner, Senfpulver, Senfsauce, Senföl, Senfcreme, Senfmayonnaise, Senfdressing, Senfsoße, Gewürzmischungen mit Senf, Brühe mit Senf, Suppenwürfel mit Senf, Wurst mit Senf',
    'N': 'Sesam, Sesamöl, Sesamsamen, Sesampaste, Tahini, Hummus, Sesambrot, Sesamkekse, Sesamriegel, Sesamöl, Gewürzmischungen mit Sesam, Brühe mit Sesam, Suppenwürfel mit Sesam',
    'O': 'Schwefeldioxid, Sulfite, E220-E228, Wein, Sekt, Champagner, getrocknete Früchte, Rosinen, Aprikosen, Feigen, Pflaumen, Apfelringe, Kartoffelchips, Kartoffelstärke, Essig, Bier, Fruchtsäfte, Fruchtsirup, Marmelade, Konfitüre, Gelee, Fruchtgummi, Lakritz',
    'P': 'Lupinen, Lupinenmehl, Lupinensamen, Lupinenprotein, Lupinenöl, Lupinenkaffee, Lupinenmilch, Lupinenjoghurt, Lupinenbrot, Lupinenkekse, Lupinenriegel, Gewürzmischungen mit Lupinen',
    'R': 'Schnecken, Muscheln, Austern, Miesmuscheln, Jakobsmuscheln, Venusmuscheln, Herzmuscheln, Tintenfisch, Oktopus, Sepia, Calamari, Kraken, Schneckenbutter, Schneckensauce, Muschelsauce, Austernsauce'
  };

  return allergenDetails[code] || 'Informationen zu diesem Allergen sind nicht verfügbar.';
}

export default function AllergeneinformationPage() {
  const { settings, loading } = useRestaurantSettings();

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-surface" role="main">
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
    <main id="main-content" className="min-h-screen bg-surface" role="main">
      <Header />

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">
              Allergeneinformation
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Hier finden Sie eine Übersicht aller Allergene, die in unseren Gerichten verwendet werden können.
                Die Kennzeichnung erfolgt nach der EU-Verordnung 1169/2011.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {STANDARD_ALLERGENS
                  .filter(allergen => allergen.code !== 'NONE')
                  .map((allergen) => {
                    const allergenDetails = getAllergenDetails(allergen.code);
                    return (
                      <div
                        key={allergen.code}
                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${allergen.color} flex-shrink-0`}
                        >
                          {allergen.code}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {allergen.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {allergen.description}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">
                              Enthalten in:
                            </h4>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {allergenDetails}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">
                  ℹ️ Wichtige Hinweise
                </h2>
                <ul className="text-blue-800 space-y-2">
                  <li>• Alle Allergene sind in der Speisekarte bei den jeweiligen Gerichten gekennzeichnet</li>
                  <li>• Die Kennzeichnung erfolgt nach EU-Verordnung 1169/2011 und österreichischem Lebensmittelrecht</li>
                  <li>• Bei Fragen zu Allergenen wenden Sie sich bitte an unser Personal</li>
                  <li>• Wir können nicht garantieren, dass unsere Gerichte vollständig allergen-frei sind</li>
                  <li>• Bei schweren Allergien empfehlen wir, vor der Bestellung nachzufragen</li>
                  <li>• Allergene können auch in Gewürzmischungen, Saucen und verarbeiteten Zutaten enthalten sein</li>
                  <li>• Bei Unklarheiten fragen Sie bitte nach den verwendeten Zutaten und Gewürzen</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-yellow-900 mb-3">
                  ⚠️ Kreuzkontamination
                </h2>
                <p className="text-yellow-800 mb-4">
                  Bitte beachten Sie, dass in unserer Küche verschiedene Allergene verarbeitet werden.
                  Trotz sorgfältiger Trennung kann es zu Kreuzkontaminationen kommen.
                  Bei schweren Allergien oder Unverträglichkeiten empfehlen wir, vor der Bestellung
                  mit unserem Personal zu sprechen.
                </p>
                <ul className="text-yellow-800 space-y-2 text-sm">
                  <li>• Verwendung derselben Küchengeräte und Arbeitsflächen</li>
                  <li>• Gemeinsame Fritteusen und Backöfen</li>
                  <li>• Verwendung derselben Gewürzmischungen und Saucen</li>
                  <li>• Kontakt über Hände, Handtücher und Geschirrtücher</li>
                  <li>• Lagerung in derselben Kühlung oder Gefriertruhe</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-3">
                  📞 Kontakt & Beratung
                </h2>
                <p className="text-green-800 mb-4">
                  Unser geschultes Personal steht Ihnen gerne für Fragen zu Allergenen zur Verfügung.
                  Wir beraten Sie gerne bei der Auswahl geeigneter Gerichte.
                </p>

                {/* Telefonnummer mit klickbarem Link */}
                {settings?.phone && (
                  <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2">📞 Direkter Kontakt:</h4>
                    <p className="text-green-800 mb-2">
                      Rufen Sie uns direkt an für eine persönliche Beratung zu Allergenen:
                    </p>
                    <a
                      href={`tel:${settings.phone}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      aria-label={`Restaurant anrufen: ${settings.phone}`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {settings.phone}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Bei der Bestellung:</h4>
                    <ul className="text-green-800 space-y-1">
                      <li>• Fragen Sie nach allergenfreien Alternativen</li>
                      <li>• Informieren Sie uns über Ihre Allergien</li>
                      <li>• Lassen Sie sich über Zutaten beraten</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Vor Ort:</h4>
                    <ul className="text-green-800 space-y-1">
                      <li>• Sprechen Sie mit unserem Servicepersonal</li>
                      <li>• Fragen Sie nach der Küchenzubereitung</li>
                      <li>• Lassen Sie sich die Zutatenliste zeigen</li>
                    </ul>
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
