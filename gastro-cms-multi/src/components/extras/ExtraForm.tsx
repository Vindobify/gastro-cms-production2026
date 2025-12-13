'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExtraItem {
  name: string;
  price: number;
  isFree: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface ExtrasFormData {
  name: string;
  description: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections?: number;
  minSelections: number;
  categories: number[];
  products: number[];
  extras: ExtraItem[];
}

export default function ExtraForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExtrasFormData>({
    name: '',
    description: '',
    selectionType: 'CHECKBOX',
    isRequired: false,
    maxSelections: undefined,
    minSelections: 1,
    categories: [],
    products: [],
    extras: [{ name: '', price: 0, isFree: false }] // Start mit einem leeren Extra
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Error fetching categories:', response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching products:', response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validiere, dass mindestens ein Extra vorhanden ist
      if (formData.extras.length === 0) {
        alert('Bitte füge mindestens ein Extra hinzu.');
        return;
      }

      // Validiere, dass mindestens eine Kategorie oder ein Produkt ausgewählt ist
      if (formData.categories.length === 0 && formData.products.length === 0) {
        alert('Bitte wähle mindestens eine Kategorie oder ein Produkt aus.');
        return;
      }

      // Validiere, dass alle Extras korrekt ausgefüllt sind
      for (let i = 0; i < formData.extras.length; i++) {
        const extra = formData.extras[i];
        if (!extra.name.trim()) {
          alert(`Bitte gib einen Namen für Extra ${i + 1} ein.`);
          return;
        }
        if (!extra.isFree && (extra.price <= 0 || isNaN(extra.price))) {
          alert(`Bitte gib einen gültigen Preis für "${extra.name}" ein.`);
          return;
        }
      }

      // Validiere Auswahltyp-spezifische Regeln
      if (formData.selectionType === 'RADIO') {
        if (formData.maxSelections && formData.maxSelections > 1) {
          alert('Bei Radio-Buttons kann maxSelections maximal 1 sein.');
          return;
        }
        if (formData.minSelections > 1) {
          alert('Bei Radio-Buttons kann minSelections maximal 1 sein.');
          return;
        }
      }

      const response = await fetch('/api/extras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/extras');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating extras:', error);
      alert('Fehler beim Erstellen der Extras');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof ExtrasFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleCategoryChange(categoryId: number, checked: boolean) {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(id => id !== categoryId)
      }));
    }
  }

  function handleProductChange(productId: number, checked: boolean) {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, productId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter(id => id !== productId)
      }));
    }
  }

  function addExtra() {
    setFormData(prev => ({
      ...prev,
      extras: [...prev.extras, { name: '', price: 0, isFree: false }]
    }));
  }

  function removeExtra(index: number) {
    if (formData.extras.length > 1) {
      setFormData(prev => ({
        ...prev,
        extras: prev.extras.filter((_, i) => i !== index)
      }));
    }
  }

  function updateExtra(index: number, field: keyof ExtraItem, value: any) {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.map((extra, i) => 
        i === index ? { ...extra, [field]: value } : extra
      )
    }));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grundinformationen */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Grundinformationen
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extra-Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    formData.name.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="z.B. Pizza Extras, Burger Extras"
                />
                {formData.name.trim() === '' && (
                  <p className="mt-1 text-sm text-red-600">Extra-Name ist erforderlich</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optionale Beschreibung der Extra-Gruppe..."
                />
              </div>
            </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auswahltyp *
                </label>
                <select
                  value={formData.selectionType}
                  onChange={(e) => handleInputChange('selectionType', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CHECKBOX">Mehrfachauswahl (Checkboxen)</option>
                  <option value="RADIO">Einzelauswahl (Radio Buttons)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.selectionType === 'CHECKBOX' 
                    ? 'Kunden können mehrere Extras auswählen'
                    : 'Kunden können nur ein Extra auswählen'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pflichtfeld
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Diese Extra-Gruppe ist ein Pflichtfeld
                  </span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Bei Pflichtfeldern muss der Kunde mindestens eine Auswahl treffen
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimale Auswahl
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.selectionType === 'RADIO' ? 1 : undefined}
                  value={formData.minSelections}
                  onChange={(e) => handleInputChange('minSelections', parseInt(e.target.value) || 1)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Mindestanzahl der auszuwählenden Extras
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximale Auswahl
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.selectionType === 'RADIO' ? 1 : undefined}
                  value={formData.maxSelections || ''}
                  onChange={(e) => handleInputChange('maxSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unbegrenzt"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximalanzahl der auswählbaren Extras (leer = unbegrenzt)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zuordnung */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Zuordnung *
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Kategorien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorien
                </label>
                <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 ${
                  formData.categories.length === 0 && formData.products.length === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.id)}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Keine Kategorien verfügbar</p>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Wähle Kategorien aus, für die diese Extras verfügbar sein sollen.
                </p>
              </div>

              {/* Produkte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Einzelne Produkte
                </label>
                <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 ${
                  formData.categories.length === 0 && formData.products.length === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <label key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.products.includes(product.id)}
                          onChange={(e) => handleProductChange(product.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{product.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Keine Produkte verfügbar</p>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Wähle einzelne Produkte aus, für die diese Extras verfügbar sein sollen.
                </p>
              </div>
            </div>
            
            {formData.categories.length === 0 && formData.products.length === 0 && (
              <p className="mt-3 text-sm text-red-600">
                * Mindestens eine Kategorie oder ein Produkt muss ausgewählt werden.
              </p>
            )}
          </div>
        </div>

        {/* Extras */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Extras *
              </h3>
              <button
                type="button"
                onClick={addExtra}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Extra hinzufügen
              </button>
            </div>
            
                          <div className="space-y-4">
                {formData.extras.map((extra, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={extra.name}
                        onChange={(e) => updateExtra(index, 'name', e.target.value)}
                        className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          extra.name.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="z.B. Extra Käse, Salami"
                      />
                      {extra.name.trim() === '' && (
                        <p className="mt-1 text-sm text-red-600">Name ist erforderlich</p>
                      )}
                    </div>
                    
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preis (€) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={extra.price}
                        onChange={(e) => updateExtra(index, 'price', parseFloat(e.target.value) || 0)}
                        disabled={extra.isFree}
                        className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          !extra.isFree && (extra.price <= 0 || isNaN(extra.price)) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={extra.isFree ? "0.00" : "1.50"}
                      />
                      {!extra.isFree && (extra.price <= 0 || isNaN(extra.price)) && (
                        <p className="mt-1 text-sm text-red-600">Gültiger Preis erforderlich</p>
                      )}
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kostenlos
                      </label>
                      <div className="mt-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={extra.isFree}
                            onChange={(e) => {
                              updateExtra(index, 'isFree', e.target.checked);
                              if (e.target.checked) {
                                updateExtra(index, 'price', 0);
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Gratis
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeExtra(index)}
                      disabled={formData.extras.length === 1}
                      className="mt-6 p-2 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Extra entfernen"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
            </div>
            
            <p className="mt-3 text-sm text-gray-500">
              Füge beliebig viele Extras hinzu. Jedes Extra benötigt einen Namen und einen Preis.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/extras')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird erstellt...' : 'Extras erstellen'}
          </button>
        </div>
      </form>
    </div>
  );
}
