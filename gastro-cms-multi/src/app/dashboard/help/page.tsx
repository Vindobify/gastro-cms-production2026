'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  CubeIcon, 
  TagIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon, 
  GiftIcon, 
  Squares2X2Icon, 
  UsersIcon, 
  TruckIcon, 
  MagnifyingGlassIcon, 
  PhotoIcon, 
  PresentationChartLineIcon, 
  QrCodeIcon, 
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const { isAdmin } = useAuth();

  const sections = [
    {
      title: 'Übersicht',
      icon: HomeIcon,
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          description: 'Hauptübersicht mit Statistiken und wichtigen Kennzahlen',
          features: [
            'Umsatzstatistiken (Brutto, Netto, Steuern)',
            'Bestellungsübersicht',
            'Top-Produkte',
            'Letzte Bestellungen',
            'Wachstumsindikatoren'
          ],
          operations: [
            {
              action: 'Anzeigen',
              description: 'Das Dashboard zeigt automatisch die wichtigsten Kennzahlen an. Keine manuellen Aktionen erforderlich.',
              icon: EyeIcon
            }
          ]
        },
        {
          name: 'Bestellungen',
          href: '/dashboard/orders',
          description: 'Verwaltung aller Bestellungen und deren Status',
          features: [
            'Alle Bestellungen anzeigen',
            'Bestellstatus verwalten',
            'Lieferzeiten setzen',
            'Bestellungen filtern und suchen',
            'Bestelldetails bearbeiten',
            'Lieferanten zuweisen'
          ],
          operations: [
            {
              action: 'Anzeigen',
              description: 'Klicken Sie auf "Bestellungen" im Menü. Alle Bestellungen werden in einer Tabelle angezeigt.',
              icon: EyeIcon
            },
            {
              action: 'Status ändern',
              description: 'Klicken Sie auf den Status-Button einer Bestellung und wählen Sie den neuen Status aus.',
              icon: PencilIcon
            },
            {
              action: 'Lieferzeit setzen',
              description: 'Klicken Sie auf "Schnelle Lieferzeit setzen" oder bearbeiten Sie die Lieferzeit im Bestelldetails.',
              icon: PencilIcon
            },
            {
              action: 'Lieferant zuweisen',
              description: 'Klicken Sie auf "Lieferant zuweisen" und wählen Sie einen verfügbaren Lieferanten aus.',
              icon: PencilIcon
            }
          ]
        },
        {
          name: 'Umsätze',
          href: '/dashboard/revenue',
          description: 'Detaillierte Umsatzübersicht und Steuerabgabe',
          features: [
            'Tages-, Wochen- und Monatsumsätze',
            'Steuerabgabe berechnen',
            'Umsatzberichte exportieren',
            'PDF-Reports generieren',
            'Umsatzentwicklung verfolgen'
          ],
          operations: [
            {
              action: 'Anzeigen',
              description: 'Wählen Sie den gewünschten Zeitraum aus dem Dropdown-Menü aus.',
              icon: EyeIcon
            },
            {
              action: 'PDF exportieren',
              description: 'Klicken Sie auf "PDF exportieren" um einen detaillierten Umsatzbericht herunterzuladen.',
              icon: PencilIcon
            }
          ]
        }
      ]
    },
    {
      title: 'Produktverwaltung',
      icon: CubeIcon,
      items: [
        {
          name: 'Produkte',
          href: '/dashboard/products',
          description: 'Verwaltung des Produktsortiments',
          features: [
            'Produkte erstellen, bearbeiten und löschen',
            'Produktbilder hochladen',
            'Preise und Beschreibungen verwalten',
            'Allergene hinzufügen',
            'Produktstatus aktivieren/deaktivieren',
            'Kategorien zuweisen'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neues Produkt" → Füllen Sie alle Felder aus → Klicken Sie auf "Speichern"',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol bei einem Produkt → Ändern Sie die gewünschten Felder → Klicken Sie auf "Aktualisieren"',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol bei einem Produkt → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'Kategorien',
          href: '/dashboard/categories',
          description: 'Organisation der Produkte in Kategorien',
          features: [
            'Kategorien erstellen und verwalten',
            'Kategorie-Icons hochladen',
            'Sortierreihenfolge festlegen',
            'Kategorien aktivieren/deaktivieren',
            'Produkte zu Kategorien zuweisen'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neue Kategorie" → Geben Sie Namen und Beschreibung ein → Laden Sie optional ein Icon hoch → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung (nur wenn keine Produkte zugeordnet sind)',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'Extras',
          href: '/dashboard/extras',
          description: 'Zusatzoptionen für Produkte (z.B. Größen, Toppings)',
          features: [
            'Extras erstellen und verwalten',
            'Preise für Extras festlegen',
            'Extras zu Produkten zuweisen',
            'Extras aktivieren/deaktivieren',
            'Gruppierung von Extras'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neues Extra" → Geben Sie Namen und Preis ein → Wählen Sie die Produktgruppe → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        }
      ]
    },
    {
      title: 'Marketing',
      icon: GiftIcon,
      items: [
        {
          name: 'Slideshow',
          href: '/dashboard/marketing/slideshow',
          description: 'Bildergalerie für die Startseite',
          features: [
            'Bilder hochladen und verwalten',
            'Slideshow-Reihenfolge festlegen',
            'Bilder aktivieren/deaktivieren',
            'Automatische Slideshow',
            'Responsive Darstellung'
          ],
          operations: [
            {
              action: 'Bild hinzufügen',
              description: 'Klicken Sie auf "Bild hochladen" → Wählen Sie eine Datei aus → Geben Sie optional einen Titel ein → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Reihenfolge ändern',
              description: 'Ziehen Sie die Bilder per Drag & Drop in die gewünschte Reihenfolge',
              icon: PencilIcon
            },
            {
              action: 'Bild entfernen',
              description: 'Klicken Sie auf das Löschen-Symbol bei einem Bild → Bestätigen Sie die Entfernung',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'QR Code Generator',
          href: '/dashboard/marketing/qr-generator',
          description: 'QR-Codes für verschiedene Zwecke generieren',
          features: [
            'QR-Codes für Speisekarte',
            'QR-Codes für Bestellungen',
            'QR-Codes für Gutscheine',
            'Anpassbare Größen und Farben',
            'Download als PNG/SVG'
          ],
          operations: [
            {
              action: 'QR-Code erstellen',
              description: 'Wählen Sie den QR-Code-Typ → Geben Sie die URL ein → Wählen Sie Größe und Farbe → Klicken Sie auf "Generieren"',
              icon: PlusIcon
            },
            {
              action: 'Download',
              description: 'Klicken Sie auf "Download" um den QR-Code als Bild herunterzuladen',
              icon: PencilIcon
            }
          ]
        },
        {
          name: 'Gutscheine',
          href: '/dashboard/coupons',
          description: 'Rabattgutscheine und Aktionen verwalten',
          features: [
            'Gutscheine erstellen und verwalten',
            'Prozentuale oder feste Rabatte',
            'Gültigkeitsdaten festlegen',
            'Mindestbestellwert definieren',
            'Gutscheincodes generieren'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neuer Gutschein" → Füllen Sie alle Felder aus → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        }
      ]
    },
    {
      title: 'Kundenverwaltung',
      icon: UserGroupIcon,
      items: [
        {
          name: 'Kunden',
          href: '/dashboard/customers',
          description: 'Verwaltung der Kundenstammdaten',
          features: [
            'Kundenstammdaten verwalten',
            'Kundenadressen verwalten',
            'Bestellhistorie einsehen',
            'Kundenkontakt verwalten',
            'Kundenstatus verwalten'
          ],
          operations: [
            {
              action: 'Anzeigen',
              description: 'Alle Kunden werden in einer Tabelle angezeigt. Sie können nach Namen oder E-Mail suchen.',
              icon: EyeIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'Lieferanten',
          href: '/dashboard/delivery-drivers',
          description: 'Verwaltung der Lieferanten und Fahrer',
          features: [
            'Lieferanten erstellen und verwalten',
            'Arbeitszeiten verwalten',
            'Verfügbarkeit steuern',
            'GPS-Tracking aktivieren',
            'Leistungsstatistiken einsehen'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neuer Lieferant" → Füllen Sie alle Felder aus → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'Benutzer',
          href: '/dashboard/users',
          description: 'Verwaltung der Systembenutzer (nur für Administratoren)',
          features: [
            'Benutzer erstellen und verwalten',
            'Rollen und Berechtigungen verwalten',
            'Benutzerprofile bearbeiten',
            'Benutzer aktivieren/deaktivieren',
            'Passwörter zurücksetzen'
          ],
          operations: [
            {
              action: 'Erstellen',
              description: 'Klicken Sie auf "Neuer Benutzer" → Füllen Sie alle Felder aus → Wählen Sie die Rolle → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Bearbeiten',
              description: 'Klicken Sie auf das Bearbeiten-Symbol → Ändern Sie die gewünschten Felder → Speichern',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        }
      ]
    },
    {
      title: 'System & Tools',
      icon: CogIcon,
      items: [
        {
          name: 'SEO',
          href: '/dashboard/seo',
          description: 'Suchmaschinenoptimierung und Meta-Daten',
          features: [
            'Meta-Titel und -Beschreibungen',
            'Open Graph Tags',
            'Sitemap verwalten',
            'Robots.txt konfigurieren',
            'SEO-Analysen'
          ],
          operations: [
            {
              action: 'Konfigurieren',
              description: 'Füllen Sie die SEO-Felder aus → Speichern Sie die Einstellungen',
              icon: PencilIcon
            }
          ]
        },
        {
          name: 'Mediathek',
          href: '/dashboard/media',
          description: 'Zentrale Verwaltung aller Medien-Dateien',
          features: [
            'Bilder und Dateien hochladen',
            'Dateien organisieren',
            'Bildgrößen anpassen',
            'Dateien löschen',
            'Ordnerstruktur verwalten'
          ],
          operations: [
            {
              action: 'Hochladen',
              description: 'Klicken Sie auf "Datei hochladen" → Wählen Sie eine Datei aus → Speichern',
              icon: PlusIcon
            },
            {
              action: 'Organisieren',
              description: 'Ziehen Sie Dateien in Ordner oder erstellen Sie neue Ordner',
              icon: PencilIcon
            },
            {
              action: 'Löschen',
              description: 'Klicken Sie auf das Löschen-Symbol bei einer Datei → Bestätigen Sie die Löschung',
              icon: TrashIcon
            }
          ]
        },
        {
          name: 'Updates',
          href: '/dashboard/updates',
          description: 'System-Updates und Wartung',
          features: [
            'Verfügbare Updates anzeigen',
            'Updates installieren',
            'System-Status überprüfen',
            'Backup erstellen',
            'Wartungsmodus aktivieren'
          ],
          operations: [
            {
              action: 'Update prüfen',
              description: 'Klicken Sie auf "Nach Updates suchen" um verfügbare Updates zu finden',
              icon: EyeIcon
            },
            {
              action: 'Update installieren',
              description: 'Klicken Sie auf "Update installieren" → Bestätigen Sie die Installation',
              icon: PencilIcon
            }
          ]
        },
        {
          name: 'Einstellungen',
          href: '/dashboard/settings',
          description: 'Allgemeine Systemeinstellungen',
          features: [
            'Restaurant-Informationen',
            'Kontaktdaten',
            'Öffnungszeiten',
            'Zahlungsmethoden',
            'Liefergebiete'
          ],
          operations: [
            {
              action: 'Konfigurieren',
              description: 'Füllen Sie alle relevanten Felder aus → Speichern Sie die Einstellungen',
              icon: PencilIcon
            }
          ]
        }
      ]
    }
  ];

  return (
    <DashboardLayout title="Hilfe & Dokumentation" subtitle="Umfassende Anleitung für das Admin Dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                📚 Admin Dashboard Dokumentation
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Willkommen zur umfassenden Dokumentation des Gastro CMS Admin Dashboards. 
                Hier finden Sie detaillierte Anleitungen für alle Funktionen und Menüpunkte.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tipp</h3>
                <p className="text-blue-800">
                  Diese Dokumentation wird regelmäßig aktualisiert. Bei Fragen oder Problemen 
                  wenden Sie sich an den Systemadministrator.
                </p>
              </div>
            </div>

            {/* Inhaltsverzeichnis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Inhaltsverzeichnis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <section.icon className="w-6 h-6 text-gray-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <a 
                            href={`#${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Detaillierte Sektionen */}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-12">
                <div className="flex items-center mb-6">
                  <section.icon className="w-8 h-8 text-gray-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>

                <div className="space-y-8">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      id={item.name.toLowerCase().replace(/\s+/g, '-')}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{item.description}</p>
                        </div>
                        <a 
                          href={item.href}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Öffnen
                        </a>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">✨ Funktionen</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Operations */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">🔧 Bedienung</h4>
                        <div className="space-y-4">
                          {item.operations.map((operation, operationIndex) => (
                            <div key={operationIndex} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                              <operation.icon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">{operation.action}</h5>
                                <p className="text-sm text-gray-600">{operation.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Zusätzliche Informationen */}
            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ℹ️ Zusätzliche Informationen</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔐 Berechtigungen</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Administrator:</strong> Vollzugriff auf alle Funktionen</li>
                    <li>• <strong>Restaurant Manager:</strong> Zugriff auf Produkt- und Bestellverwaltung</li>
                    <li>• <strong>Lieferant:</strong> Zugriff nur auf Lieferanten-Dashboard</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🆘 Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Bei technischen Problemen: Systemadministrator kontaktieren</li>
                    <li>• Für neue Funktionen: Feature-Request einreichen</li>
                    <li>• Dokumentation wird regelmäßig aktualisiert</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Gastro CMS v3.0 - Admin Dashboard Dokumentation</p>
              <p className="mt-1">Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
