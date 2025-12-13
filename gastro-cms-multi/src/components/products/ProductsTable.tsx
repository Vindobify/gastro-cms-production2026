'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { STANDARD_ALLERGENS } from '@/app/api/allergens/route';

interface Product {
  id: number;
  articleNumber: string | null;
  name: string;
  description: string | null;
  price: number | null;
  taxRate: number;
  category: {
    id: number;
    name: string;
  } | null;
  allergens: string | null; // JSON-String von Allergen-Codes
  createdAt: string;
  updatedAt: string;
}

// Hilfsfunktion für die Preisformatierung
function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
}

// Hilfsfunktion für Allergen-Anzeige
function renderAllergens(allergens: string | null) {
  if (!allergens) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Keine Allergene
      </span>
    );
  }

  let allergenArray: string[];
  try {
    allergenArray = JSON.parse(allergens);
  } catch {
    allergenArray = [];
  }

  if (allergenArray.length === 0) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Keine Allergene
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {allergenArray
        .filter((allergenCode) => allergenCode !== 'NONE')
        .map((allergenCode) => {
          const allergenInfo = STANDARD_ALLERGENS.find(a => a.code === allergenCode);
          return allergenInfo ? (
            <span
              key={allergenCode}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${allergenInfo.color}`}
              title={allergenInfo.name}
            >
              {allergenCode}
            </span>
          ) : (
            <span key={allergenCode} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {allergenCode}
            </span>
          );
        })}
    </div>
  );
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Möchtest du dieses Produkt wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== id));
      } else {
        alert('Fehler beim Löschen des Produkts');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Fehler beim Löschen des Produkts');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.articleNumber && product.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <input
            type="text"
            placeholder="Produkte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artikelnummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preis / MwSt.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergene
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.articleNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category?.name || 'Keine Kategorie'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>€{formatPrice(product.price)}</div>
                      <div className="text-xs text-gray-500">
                        {product.taxRate === 0.10 ? '10% MwSt.' : product.taxRate === 0.20 ? '20% MwSt.' : product.taxRate === 0.00 ? 'Steuerfrei' : `${(product.taxRate * 100).toFixed(0)}% MwSt.`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderAllergens(product.allergens)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/products/${product.id}/extras`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Extras verwalten"
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Keine Produkte gefunden.' : 'Keine Produkte vorhanden.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
