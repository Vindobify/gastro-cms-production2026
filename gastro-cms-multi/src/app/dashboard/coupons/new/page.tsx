'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
}

export default function NewCouponPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
    applicationType: 'ALL', // ALL, CATEGORY, PRODUCT
    categoryId: '',
    productId: ''
  });

  useEffect(() => {
    // Load categories and products
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Filter products by selected category
    if (formData.categoryId) {
      const filtered = products.filter(p => p.categoryId === parseInt(formData.categoryId));
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [formData.categoryId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          discountValue: parseFloat(formData.discountValue),
          minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null,
          maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          categoryId: formData.applicationType === 'CATEGORY' && formData.categoryId ? parseInt(formData.categoryId) : null,
          productId: formData.applicationType === 'PRODUCT' && formData.productId ? parseInt(formData.productId) : null,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        }),
      });

      if (response.ok) {
        addToast('Gutschein erfolgreich erstellt', 'success');
        router.push('/dashboard/coupons');
      } else {
        const error = await response.json();
        addToast(error.message || 'Fehler beim Erstellen des Gutscheins', 'error');
      }
    } catch (error) {
      addToast('Fehler beim Erstellen des Gutscheins', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Neuen Gutschein erstellen</h1>
          <p className="text-gray-600">Erstelle einen neuen Gutschein für deine Kunden</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Gutscheincode *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. PIZZA20"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Pizza 20% Rabatt"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Beschreibung des Gutscheins..."
            />
          </div>

          {/* Anwendungsbereich */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Anwendungsbereich</h3>
            
            <div>
              <label htmlFor="applicationType" className="block text-sm font-medium text-gray-700">
                Gutschein gilt für *
              </label>
              <select
                id="applicationType"
                name="applicationType"
                required
                value={formData.applicationType}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Alle Produkte</option>
                <option value="CATEGORY">Bestimmte Kategorie</option>
                <option value="PRODUCT">Bestimmtes Produkt</option>
              </select>
            </div>

            {formData.applicationType === 'CATEGORY' && (
              <div className="mt-4">
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Kategorie auswählen *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.applicationType === 'PRODUCT' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    Kategorie (optional)
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Alle Kategorien</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                    Produkt auswählen *
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    required
                    value={formData.productId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Produkt wählen...</option>
                    {filteredProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
                Rabatt-Typ *
              </label>
              <select
                id="discountType"
                name="discountType"
                required
                value={formData.discountType}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PERCENTAGE">Prozentual (%)</option>
                <option value="FIXED_AMOUNT">Fester Betrag (€)</option>
                <option value="FREE_DELIVERY">Kostenlose Lieferung</option>
              </select>
            </div>

            <div>
              <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
                Rabatt-Wert *
              </label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                required
                step="0.01"
                min="0"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '5.00'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumOrderAmount" className="block text-sm font-medium text-gray-700">
                Mindestbestellwert (€)
              </label>
              <input
                type="number"
                id="minimumOrderAmount"
                name="minimumOrderAmount"
                step="0.01"
                min="0"
                value={formData.minimumOrderAmount}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="15.00"
              />
            </div>

            <div>
              <label htmlFor="maximumDiscount" className="block text-sm font-medium text-gray-700">
                Max. Rabatt (€)
              </label>
              <input
                type="number"
                id="maximumDiscount"
                name="maximumDiscount"
                step="0.01"
                min="0"
                value={formData.maximumDiscount}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="10.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Gültig ab *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Gültig bis *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
              Verwendungslimit
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              min="1"
              value={formData.usageLimit}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
            <p className="mt-1 text-sm text-gray-500">Leer lassen für unbegrenzte Verwendung</p>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Gutschein ist aktiv
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/coupons')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Erstelle...' : 'Gutschein erstellen'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
