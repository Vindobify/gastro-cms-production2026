'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ExtraItem {
  id: number;
  name: string;
  price: number;
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
}

export default function ExtrasTable() {
  const router = useRouter();
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExtras();
  }, []);

  async function fetchExtras() {
    try {
      setLoading(true);
      const response = await fetch('/api/extras');
      if (response.ok) {
        const data = await response.json();
        setExtras(data);
      } else {
        console.error('Error fetching extras:', response.statusText);
        setExtras([]);
      }
    } catch (error) {
      console.error('Error fetching extras:', error);
      setExtras([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExtra(extraId: number) {
    if (!confirm('Möchtest du diese Extras wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/extras/${extraId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Aktualisiere die lokale Liste
        setExtras(prev => prev.filter(extra => extra.id !== extraId));
      } else {
        alert('Fehler beim Löschen der Extras');
      }
    } catch (error) {
      console.error('Error deleting extra:', error);
      alert('Fehler beim Löschen der Extras');
    }
  }

  function handleEditExtra(extraId: number) {
    router.push(`/extras/edit/${extraId}`);
  }

  function handleViewExtra(extraId: number) {
    router.push(`/extras/${extraId}`);
  }

  const getSelectionTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKBOX': return 'Mehrfachauswahl';
      case 'RADIO': return 'Einzelauswahl';
      default: return 'Mehrfachauswahl';
    }
  };

  const getRequiredLabel = (required: boolean) => {
    return required ? 'Pflicht' : 'Optional';
  };

  const filteredExtras = extras.filter(extra =>
    extra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Extras durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Extras table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Extra-Gruppe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ & Pflicht
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zugewiesen an
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anzahl Extras
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExtras.map((extra) => (
                <tr key={extra.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{extra.name}</div>
                    {extra.description && (
                      <div className="text-sm text-gray-500">{extra.description}</div>
                    )}
                    <div className="text-sm text-gray-500">
                      {extra.extras.length} Extras verfügbar
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
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
                      {extra.maxSelections && (
                        <div className="text-xs text-gray-500 mt-1">
                          Max. {extra.maxSelections} Auswahl{extra.maxSelections > 1 ? 'en' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {extra.categories && extra.categories.length > 0 && (
                        <div className="mb-1">
                          <span className="text-xs font-medium text-gray-500">Kategorien:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extra.categories.map((cat) => (
                              <span key={cat.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extra.products && extra.products.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Produkte:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extra.products.map((prod) => (
                              <span key={prod.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {prod.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{extra.extras.length}</div>
                    <div className="text-sm text-gray-500">
                      {extra.extras.slice(0, 2).map(item => item.name).join(', ')}
                      {extra.extras.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewExtra(extra.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Anzeigen"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditExtra(extra.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExtra(extra.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Löschen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExtras.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Keine Extras gefunden.</p>
            <p className="text-sm text-gray-400 mt-2">Erstelle deine ersten Extras mit dem "Extras erstellen" Button.</p>
          </div>
        )}
      </div>
    </div>
  );
}
