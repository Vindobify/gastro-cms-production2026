'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExtraItem {
  id: number;
  name: string;
  price: number;
  isFree: boolean;
}

interface ExtraGroup {
  id: number;
  name: string;
  description: string | null;
  selectionType: string;
  isRequired: boolean;
  maxSelections: number | null;
  minSelections: number;
  extraItems: ExtraItem[];
  categories?: Array<{ id: number; name: string; }>;
  products?: Array<{ id: number; name: string; }>;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface ExtraFormData {
  name: string;
  description: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections: string;
  minSelections: string;
  categories: number[];
  products: number[];
  extraItems: Array<{
    id?: number;
    name: string;
    price: string;
    isFree: boolean;
  }>;
}

interface ExtraEditFormProps {
  extraId: number;
}

export default function ExtraEditForm({ extraId }: ExtraEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ExtraFormData>({
    name: '',
    description: '',
    selectionType: 'CHECKBOX',
    isRequired: false,
    maxSelections: '',
    minSelections: '1',
    categories: [],
    products: [],
    extraItems: []
  });

  useEffect(() => {
    fetchExtra();
    fetchCategories();
    fetchProducts();
  }, [extraId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchExtra = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/extras/${extraId}`);
      if (response.ok) {
        const extra: ExtraGroup = await response.json();
        setFormData({
          name: extra.name,
          description: extra.description || '',
          selectionType: extra.selectionType,
          isRequired: extra.isRequired,
          maxSelections: extra.maxSelections?.toString() || '',
          minSelections: extra.minSelections.toString(),
          categories: (extra.categories || []).map((cat: any) => cat.id),
          products: (extra.products || []).map((prod: any) => prod.id),
          extraItems: (extra.extraItems || []).map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price.toString()).toFixed(2),
            isFree: item.isFree
          }))
        });
      } else {
        alert('Extra-Gruppe nicht gefunden');
        router.push('/dashboard/extras');
      }
    } catch (error) {
      console.error('Error fetching extra:', error);
      alert('Fehler beim Laden der Extra-Gruppe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/extras/${extraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          selectionType: formData.selectionType,
          isRequired: formData.isRequired,
          maxSelections: formData.maxSelections ? parseInt(formData.maxSelections) : null,
          minSelections: parseInt(formData.minSelections),
          categories: formData.categories,
          products: formData.products,
          extraItems: formData.extraItems.map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            isFree: item.isFree
          }))
        }),
      });

      if (response.ok) {
        router.push('/dashboard/extras');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating extra:', error);
      alert('Fehler beim Aktualisieren der Extra-Gruppe');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addExtraItem = () => {
    setFormData(prev => ({
      ...prev,
      extraItems: [...prev.extraItems, {
        name: '',
        price: '0.00',
        isFree: false
      }]
    }));
  };

  const removeExtraItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extraItems: prev.extraItems.filter((_, i) => i !== index)
    }));
  };

  const updateExtraItem = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      extraItems: prev.extraItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
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
  };

  const handleProductChange = (productId: number, checked: boolean) => {
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
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
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
        <div className="mb-6">
          <Link
            href="/dashboard/extras"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Zurück zu Extras
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name der Extra-Gruppe *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Beilagen, Toppings, Größen..."
              />
            </div>

            {/* Beschreibung */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Beschreibung
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optionale Beschreibung der Extra-Gruppe..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Auswahltyp */}
            <div>
              <label htmlFor="selectionType" className="block text-sm font-medium text-gray-700">
                Auswahltyp
              </label>
              <select
                name="selectionType"
                id="selectionType"
                value={formData.selectionType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CHECKBOX">Mehrfachauswahl (Checkboxen)</option>
                <option value="RADIO">Einzelauswahl (Radio Buttons)</option>
              </select>
            </div>

            {/* Pflichtfeld */}
            <div>
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  name="isRequired"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                  Pflichtfeld
                </label>
              </div>
            </div>

            {/* Minimale Auswahl */}
            <div>
              <label htmlFor="minSelections" className="block text-sm font-medium text-gray-700">
                Minimale Auswahl *
              </label>
              <input
                type="number"
                name="minSelections"
                id="minSelections"
                required
                min="1"
                value={formData.minSelections}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Maximale Auswahl */}
            <div>
              <label htmlFor="maxSelections" className="block text-sm font-medium text-gray-700">
                Maximale Auswahl
              </label>
              <input
                type="number"
                name="maxSelections"
                id="maxSelections"
                min="1"
                value={formData.maxSelections}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leer = unbegrenzt"
              />
            </div>
          </div>

          {/* Category Assignment */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorien zuweisen
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Assignment */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produkte zuweisen
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.products.includes(product.id)}
                    onChange={(e) => handleProductChange(product.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{product.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Extra-Items */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Extra-Items</h3>
              <button
                type="button"
                onClick={addExtraItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Extra hinzufügen
              </button>
            </div>

            <div className="space-y-4">
              {formData.extraItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name des Extras"
                      value={item.name}
                      onChange={(e) => updateExtraItem(index, 'name', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateExtraItem(index, 'price', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={item.isFree}
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.isFree}
                      onChange={(e) => updateExtraItem(index, 'isFree', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Kostenlos</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExtraItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/extras"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving || formData.extraItems.length === 0 || (formData.categories.length === 0 && formData.products.length === 0)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
