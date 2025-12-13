'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ExtraGroup {
  id: number;
  name: string;
  description?: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections?: number;
  minSelections: number;
  extraItems: Array<{
    id: number;
    name: string;
    price: number;
    isFree: boolean;
  }>;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
}

interface ProductExtra {
  id: number;
  extraGroup?: ExtraGroup;
  name?: string;
  extraItems?: Array<{
    id: number;
    name: string;
    price: number;
    isFree: boolean;
  }>;
  isActive: boolean;
  sortOrder: number;
}

interface ProductExtrasManagerProps {
  productId: number;
}

export default function ProductExtrasManager({ productId }: ProductExtrasManagerProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [availableExtras, setAvailableExtras] = useState<ExtraGroup[]>([]);
  const [assignedExtras, setAssignedExtras] = useState<ProductExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, extrasRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/extras')
      ]);

      if (productRes.ok) {
        const productData = await productRes.json();
        setProduct(productData);
      }

      if (extrasRes.ok) {
        const extrasData = await extrasRes.json();
        console.log('Verfügbare Extras geladen:', extrasData);
        setAvailableExtras(extrasData);
      } else {
        console.error('Fehler beim Laden der verfügbaren Extras:', extrasRes.status);
      }

      // Lade zugewiesene Extras
      await fetchAssignedExtras();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedExtras = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/extras`);
      if (response.ok) {
        const data = await response.json();
        console.log('Zugewiesene Extras geladen:', data);
        setAssignedExtras(data);
      } else {
        console.error('Fehler beim Laden der zugewiesenen Extras:', response.status);
      }
    } catch (error) {
      console.error('Error fetching assigned extras:', error);
    }
  };

  const assignExtra = async (extraGroupId: number) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/products/${productId}/extras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extraGroupId,
          isActive: true,
          sortOrder: assignedExtras.length
        }),
      });

      if (response.ok) {
        await fetchAssignedExtras();
      } else {
        alert('Fehler beim Zuweisen des Extras');
      }
    } catch (error) {
      console.error('Error assigning extra:', error);
      alert('Fehler beim Zuweisen des Extras');
    } finally {
      setSaving(false);
    }
  };

  const removeExtra = async (productExtraId: number) => {
    if (!confirm('Möchtest du dieses Extra wirklich entfernen?')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/products/${productId}/extras/${productExtraId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAssignedExtras();
      } else {
        alert('Fehler beim Entfernen des Extras');
      }
    } catch (error) {
      console.error('Error removing extra:', error);
      alert('Fehler beim Entfernen des Extras');
    } finally {
      setSaving(false);
    }
  };

  const isExtraAssigned = (extraGroupId: number) => {
    return assignedExtras.some(pe => (pe.extraGroup?.id || pe.id) === extraGroupId);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Produkt nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Zurück zu Produkten
        </Link>
        <h2 className="text-lg font-medium text-gray-900">
          {product.name} - Extras verwalten
        </h2>
      </div>

      {/* Zugewiesene Extras */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Zugewiesene Extras ({assignedExtras.length})
          </h3>
          
          {assignedExtras.length === 0 ? (
            <p className="text-gray-500">Noch keine Extras zugewiesen</p>
          ) : (
            <div className="space-y-3">
                             {assignedExtras.map((productExtra) => (
                 <div key={productExtra.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div>
                     <h4 className="font-medium text-gray-900">{productExtra.extraGroup?.name || productExtra.name || 'Unbekannt'}</h4>
                     <p className="text-sm text-gray-500">
                       {((productExtra.extraGroup?.extraItems || productExtra.extraItems || []).length)} Optionen verfügbar
                     </p>
                   </div>
                   <button
                     onClick={() => removeExtra(productExtra.id)}
                     disabled={saving}
                     className="text-red-600 hover:text-red-700 disabled:opacity-50"
                   >
                     <MinusIcon className="h-5 w-5" />
                   </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Verfügbare Extras */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verfügbare Extras ({availableExtras.filter(e => !isExtraAssigned(e.id)).length})
          </h3>
          
          <div className="space-y-3">
            {availableExtras
              .filter(extra => !isExtraAssigned(extra.id))
              .map((extra) => (
                <div key={extra.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{extra.name}</h4>
                    <p className="text-sm text-gray-500">
                      {extra.description || 'Keine Beschreibung'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        extra.selectionType === 'RADIO' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {extra.selectionType === 'RADIO' ? 'Einzelauswahl' : 'Mehrfachauswahl'}
                      </span>
                                             <span className="text-xs text-gray-500">
                         {(extra.extraItems || []).length} Optionen
                       </span>
                    </div>
                  </div>
                  <button
                    onClick={() => assignExtra(extra.id)}
                    disabled={saving}
                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
          </div>
          
          {availableExtras.filter(e => !isExtraAssigned(e.id)).length === 0 && (
            <p className="text-gray-500">Alle verfügbaren Extras sind bereits zugewiesen</p>
          )}
        </div>
      </div>
    </div>
  );
}
