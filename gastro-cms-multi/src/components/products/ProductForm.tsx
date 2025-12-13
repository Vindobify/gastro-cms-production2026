'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { STANDARD_ALLERGENS } from '@/lib/constants';
import ProductExtrasManager from './ProductExtrasManager';

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  taxRate: string;
  categoryId: string;
  allergens: string[];
}

export default function ProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    taxRate: '0.20',
    categoryId: '',
    allergens: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          taxRate: parseFloat(formData.taxRate),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        }),
      });

      if (response.ok) {
        const product = await response.json();
        setCreatedProductId(product.id);
        // Zeige Erfolgsmeldung und Extra-Verwaltung
      } else {
        alert('Fehler beim Erstellen des Produkts');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Fehler beim Erstellen des Produkts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Produktname *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            autoComplete="off"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Preis €
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              autoComplete="off"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
              MwSt.-Satz
            </label>
            <select
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0.10">10% (Speisen)</option>
              <option value="0.20">20% (Getränke)</option>
              <option value="0.00">0% (Steuerfrei)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Kategorie
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Kategorie auswählen</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading || formData.allergens.length === 0}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird erstellt...' : 'Produkt erstellen'}
          </button>
        </div>
      </form>

      {/* Extras Management - nur anzeigen wenn Produkt erstellt wurde */}
      {createdProductId && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">✅ Produkt erfolgreich erstellt!</h3>
            <p className="text-sm text-gray-500">
              Du kannst jetzt Extras zu diesem Produkt zuweisen
            </p>
          </div>
          <ProductExtrasManager productId={createdProductId} />
          <div className="mt-4">
            <button
              onClick={() => router.push('/products')}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Zur Produktübersicht
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
