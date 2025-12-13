'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckIcon, 
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount: number | '';
  maximumDiscount: number | '';
  startDate: string;
  endDate: string;
  usageLimit: number | '';
  perCustomerLimit: number;
  isActive: boolean;
  isPublic: boolean;
  canCombine: boolean;
  restrictions: Array<{
    type: string;
    value: string;
    operator: string;
  }>;
}

interface Product {
  id: number;
  name: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface CouponEditFormProps {
  couponId: number;
}

export default function CouponEditForm({ couponId }: CouponEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minimumOrderAmount: '',
    maximumDiscount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
    perCustomerLimit: 1,
    isActive: true,
    isPublic: true,
    canCombine: false,
    restrictions: []
  });

  useEffect(() => {
    fetchCoupon();
    fetchProducts();
    fetchCategories();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/coupons/${couponId}`);
      if (response.ok) {
        const coupon = await response.json();
        
        // Konvertiere die Daten in das richtige Format
        setFormData({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue.toString()),
          minimumOrderAmount: coupon.minimumOrderAmount ? parseFloat(coupon.minimumOrderAmount.toString()) : '',
          maximumDiscount: coupon.maximumDiscount ? parseFloat(coupon.maximumDiscount.toString()) : '',
          startDate: new Date(coupon.startDate).toISOString().split('T')[0],
          endDate: new Date(coupon.endDate).toISOString().split('T')[0],
          usageLimit: coupon.usageLimit || '',
          perCustomerLimit: coupon.perCustomerLimit,
          isActive: coupon.isActive,
          isPublic: coupon.isPublic,
          canCombine: coupon.canCombine,
          restrictions: coupon.restrictions?.map((r: any) => ({
            type: r.restrictionType,
            value: r.restrictionValue,
            operator: r.restrictionOperator
          })) || []
        });
      } else {
        alert('Gutschein konnte nicht geladen werden');
        router.push('/dashboard/coupons');
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      alert('Fehler beim Laden des Gutscheins');
      router.push('/dashboard/coupons');
    } finally {
      setInitialLoading(false);
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

  const handleInputChange = (field: keyof CouponFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRestriction = () => {
    setFormData(prev => ({
      ...prev,
      restrictions: [
        ...prev.restrictions,
        { type: 'PRODUCT', value: '', operator: 'INCLUDE' }
      ]
    }));
  };

  const removeRestriction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index)
    }));
  };

  const updateRestriction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.map((restriction, i) => 
        i === index ? { ...restriction, [field]: value } : restriction
      )
    }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/coupons');
      } else {
        const errorData = await response.json();
        alert(`Fehler: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Fehler beim Aktualisieren des Gutscheins');
    } finally {
      setLoading(false);
    }
  };

  const getRestrictionValueOptions = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return products.map(product => ({
          value: product.id.toString(),
          label: product.name
        }));
      case 'CATEGORY':
        return categories.map(category => ({
          value: category.id.toString(),
          label: category.name
        }));
      case 'WEEKDAY':
        return [
          { value: '0', label: 'Sonntag' },
          { value: '1', label: 'Montag' },
          { value: '2', label: 'Dienstag' },
          { value: '3', label: 'Mittwoch' },
          { value: '4', label: 'Donnerstag' },
          { value: '5', label: 'Freitag' },
          { value: '6', label: 'Samstag' }
        ];
      case 'DELIVERY_TIME':
        return [
          { value: JSON.stringify({ start: '10:00', end: '14:00' }), label: 'Vormittag (10:00-14:00)' },
          { value: JSON.stringify({ start: '14:00', end: '18:00' }), label: 'Nachmittag (14:00-18:00)' },
          { value: JSON.stringify({ start: '18:00', end: '22:00' }), label: 'Abend (18:00-22:00)' }
        ];
      default:
        return [];
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Grundinformationen</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gutscheincode *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. FRÜHLING20"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Generieren
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Frühlingsrabatt 20%"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optionale Beschreibung des Gutscheins"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rabatt-Einstellungen</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rabatttyp *
            </label>
            <select
              required
              value={formData.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PERCENTAGE">Prozentrabatt (%)</option>
              <option value="FIXED_AMOUNT">Festbetragsrabatt (€)</option>
              <option value="PRODUCT_SPECIFIC">Produktspezifischer Rabatt (%)</option>
              <option value="FREE_DELIVERY">Kostenlose Lieferung</option>
            </select>
          </div>

          {formData.discountType !== 'FREE_DELIVERY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rabattwert *
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '10.00'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mindestbestellwert (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumOrderAmount}
              onChange={(e) => handleInputChange('minimumOrderAmount', e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. 25.00"
            />
          </div>

          {formData.discountType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximaler Rabatt (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maximumDiscount}
                onChange={(e) => handleInputChange('maximumDiscount', e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. 25.00"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gültigkeit & Verwendung</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Startdatum *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enddatum *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gesamtverwendungen
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => handleInputChange('usageLimit', e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unbegrenzt (leer lassen)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verwendungen pro Kunde *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.perCustomerLimit}
              onChange={(e) => handleInputChange('perCustomerLimit', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Einschränkungen</h3>
        
        <div className="space-y-4">
          {formData.restrictions.map((restriction, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <select
                value={restriction.type}
                onChange={(e) => updateRestriction(index, 'type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PRODUCT">Produkt</option>
                <option value="CATEGORY">Kategorie</option>
                <option value="WEEKDAY">Wochentag</option>
                <option value="DELIVERY_TIME">Lieferzeit</option>
              </select>

              <select
                value={restriction.operator}
                onChange={(e) => updateRestriction(index, 'operator', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INCLUDE">Einschließen</option>
                <option value="EXCLUDE">Ausschließen</option>
              </select>

              <select
                value={restriction.value}
                onChange={(e) => updateRestriction(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Bitte wählen...</option>
                {getRestrictionValueOptions(restriction.type).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeRestriction(index)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addRestriction}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Einschränkung hinzufügen
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Optionen</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Gutschein ist aktiv
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
              Öffentlich sichtbar
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="canCombine"
              checked={formData.canCombine}
              onChange={(e) => handleInputChange('canCombine', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="canCombine" className="ml-2 block text-sm text-gray-900">
              Mit anderen Gutscheinen kombinierbar
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/coupons')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Wird aktualisiert...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Gutschein aktualisieren
            </>
          )}
        </button>
      </div>
    </form>
  );
}
