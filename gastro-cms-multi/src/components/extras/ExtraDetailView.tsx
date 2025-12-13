'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ExtraItem {
  name: string;
  price: number;
  isFree?: boolean;
}

interface ProductExtra {
  id: number;
  name: string;
  description?: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections?: number;
  minSelections: number;
  categories: Array<{ id: number; name: string }>;
  products: Array<{ id: number; name: string }>;
  extras: ExtraItem[];
  createdAt: string;
  updatedAt?: string;
}

interface ExtraDetailViewProps {
  extraId: number;
}

export default function ExtraDetailView({ extraId }: ExtraDetailViewProps) {
  const router = useRouter();
  const [extra, setExtra] = useState<ProductExtra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (extraId) {
      fetchExtra();
    }
  }, [extraId]);

  async function fetchExtra() {
    try {
      setLoading(true);
      const response = await fetch(`/api/extras/${extraId}`);
      
      if (response.ok) {
        const data = await response.json();
        setExtra(data);
      } else {
        alert('Extras nicht gefunden');
        router.push('/dashboard/extras');
      }
    } catch (error) {
      console.error('Error fetching extra:', error);
      alert('Fehler beim Laden der Extras');
      router.push('/dashboard/extras');
    } finally {
      setLoading(false);
    }
  }

  const getSelectionTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKBOX': return 'Mehrfachauswahl (Checkboxen)';
      case 'RADIO': return 'Einzelauswahl (Radio Buttons)';
      default: return 'Mehrfachauswahl (Checkboxen)';
    }
  };

  const getRequiredLabel = (required: boolean) => {
    return required ? 'Pflichtfeld' : 'Optional';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!extra) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Extras nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard/extras')}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{extra.name}</h1>
          </div>
          {extra.description && (
            <p className="mt-2 text-sm text-gray-600">{extra.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Erstellt am {new Date(extra.createdAt).toLocaleDateString('de-DE')}
            {extra.updatedAt && ` • Zuletzt aktualisiert am ${new Date(extra.updatedAt).toLocaleDateString('de-DE')}`}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => router.push(`/extras/edit/${extra.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Bearbeiten
          </button>
        </div>
      </div>

      {/* Auswahltyp und Regeln */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Auswahltyp und Regeln
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Auswahltyp</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (extra.selectionType || 'CHECKBOX') === 'RADIO' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {getSelectionTypeLabel(extra.selectionType || 'CHECKBOX')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  extra.isRequired 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getRequiredLabel(extra.isRequired || false)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {extra.selectionType === 'CHECKBOX' 
                  ? 'Kunden können mehrere Extras auswählen'
                  : 'Kunden können nur ein Extra auswählen'
                }
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Auswahlregeln</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minimale Auswahl:</span>
                  <span className="text-sm font-medium text-gray-900">{extra.minSelections || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maximale Auswahl:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {extra.maxSelections ? extra.maxSelections : 'Unbegrenzt'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zuordnung */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Zuordnung
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Kategorien */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Kategorien</h4>
              {extra.categories && extra.categories.length > 0 ? (
                <div className="space-y-2">
                  {extra.categories.map((category) => (
                    <span key={category.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Keine Kategorien zugeordnet</p>
              )}
            </div>

            {/* Produkte */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Einzelne Produkte</h4>
              {extra.products && extra.products.length > 0 ? (
                <div className="space-y-2">
                  {extra.products.map((product) => (
                    <span key={product.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2 mb-2">
                      {product.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Keine einzelnen Produkte zugeordnet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Verfügbare Extras ({extra.extras.length})
          </h3>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {extra.extras.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.isFree === true ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Kostenlos
                        </span>
                      ) : (
                        `${item.price.toFixed(2)} €`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Zusammenfassung
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Diese Extra-Gruppe ist als <strong>{getSelectionTypeLabel(extra.selectionType || 'CHECKBOX')}</strong> konfiguriert und ist <strong>{getRequiredLabel(extra.isRequired || false)}</strong>.
                Kunden müssen mindestens <strong>{extra.minSelections || 1} Extra(s)</strong> auswählen
                {extra.maxSelections && ` und können maximal ${extra.maxSelections} Extra(s)`} auswählen.
              </p>
              <p className="mt-2">
                Die Extras sind für <strong>{extra.categories ? extra.categories.length : 0} Kategorie(n)</strong> und <strong>{extra.products ? extra.products.length : 0} Produkt(e)</strong> verfügbar.
                Kunden können aus <strong>{extra.extras ? extra.extras.length : 0} verschiedenen Optionen</strong> wählen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
