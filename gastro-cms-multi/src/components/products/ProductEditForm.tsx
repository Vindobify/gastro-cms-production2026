'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { STANDARD_ALLERGENS } from '@/lib/constants';
import ProductExtrasManager from './ProductExtrasManager';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  taxRate: number;
  categoryId: number | null;
  allergens: string | null;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  taxRate: string;
  categoryId: string;
  allergens: string[];
  isActive: boolean;
}

interface ProductEditFormProps {
  productId: number;
}

export default function ProductEditForm({ productId }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    taxRate: '0.20',
    categoryId: '',
    allergens: [],
    isActive: true
  });

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const product: Product = await response.json();

        // Parse Allergene
        let allergens: string[] = [];
        if (product.allergens) {
          try {
            allergens = JSON.parse(product.allergens);
          } catch {
            allergens = [];
          }
        }

        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price?.toString() || '',
          taxRate: product.taxRate?.toString() || '0.20',
          categoryId: product.categoryId?.toString() || '',
          allergens: allergens,
          isActive: product.isActive
        });
      } else {
        alert('Produkt nicht gefunden');
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Fehler beim Laden des Produkts');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          taxRate: parseFloat(formData.taxRate),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          allergens: formData.allergens
        }),
      });

      if (response.ok) {
        router.push('/products');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Fehler beim Aktualisieren des Produkts');
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

  const toggleAllergen = (allergenCode: string) => {
    setFormData(prev => {
      if (allergenCode === 'NONE') {
        // Wenn "Keine Allergene" ausgewählt wird, alle anderen entfernen
        return {
          ...prev,
          allergens: prev.allergens.includes('NONE') ? [] : ['NONE']
        };
      } else {
        // Wenn ein echtes Allergen ausgewählt wird, "Keine Allergene" entfernen
        let newAllergens = prev.allergens.filter(code => code !== 'NONE');

        if (newAllergens.includes(allergenCode)) {
          newAllergens = newAllergens.filter(code => code !== allergenCode);
        } else {
          newAllergens = [...newAllergens, allergenCode];
        }

        return {
          ...prev,
          allergens: newAllergens
        };
      }
    });
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
            href="/products"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Zurück zu Produkten
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Produktname *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Margherita Pizza, Wiener Schnitzel..."
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
                placeholder="Detaillierte Beschreibung des Produkts..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Preis */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preis (€)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* MwSt. Satz */}
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                MwSt.-Satz
              </label>
              <select
                name="taxRate"
                id="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0.10">10% (Speisen)</option>
                <option value="0.20">20% (Getränke)</option>
                <option value="0.00">0% (Steuerfrei)</option>
              </select>
            </div>

            {/* Kategorie */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Kategorie
              </label>
              <select
                name="categoryId"
                id="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Keine Kategorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Aktiv Status */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Produkt ist aktiv verfügbar
                </label>
              </div>
            </div>
          </div>

          {/* Allergene */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Allergene * <span className="text-red-500">(Pflichtfeld)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {STANDARD_ALLERGENS.map((allergen) => (
                <label key={allergen.code} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allergens.includes(allergen.code)}
                    onChange={() => toggleAllergen(allergen.code)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${allergen.color} mr-2`}>
                      {allergen.code}
                    </span>
                    {allergen.name}
                  </span>
                </label>
              ))}
            </div>
            {formData.allergens.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                Bitte wähle mindestens "Keine Allergene" aus, falls das Produkt keine Allergene enthält.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/products"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving || formData.allergens.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>

        {/* Extras Management */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Extras verwalten</h3>
            <p className="text-sm text-gray-500">
              Ordne diesem Produkt verfügbare Extras zu oder entferne sie
            </p>
          </div>
          <ProductExtrasManager productId={productId} />
        </div>
      </div>
    </div>
  );
}
