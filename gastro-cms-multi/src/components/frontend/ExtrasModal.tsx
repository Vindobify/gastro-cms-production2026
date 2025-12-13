'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ExtraItem {
  id: number;
  name: string;
  price: number;
  isFree: boolean;
}

interface ExtraGroup {
  id: number;
  name: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections?: number;
  minSelections: number;
  extraItems: ExtraItem[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  taxRate: number;
  productExtras?: Array<{
    extraGroup: ExtraGroup;
  }>;
}

interface ExtrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  extras: ExtraGroup[];
  onAddToCart: (extras: any[]) => void;
}

export default function ExtrasModal({ isOpen, onClose, product, quantity, extras, onAddToCart }: ExtrasModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<{ [groupId: number]: number[] }>({});

  // Reset selected extras when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedExtras({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const transformedExtras = extras;
  
  console.log('ExtrasModal - Received extras:', transformedExtras);
  console.log('ExtrasModal - Extras length:', transformedExtras?.length);

  const toggleExtra = (groupId: number, extraId: number) => {
    setSelectedExtras(prev => {
      const current = prev[groupId] || [];
      const selectionType = transformedExtras?.find(g => g.id === groupId)?.selectionType || 'CHECKBOX';
      
      if (selectionType === 'RADIO') {
        // Radio: nur eine Auswahl pro Gruppe
        return { ...prev, [groupId]: [extraId] };
      } else {
        // Multiple: mehrere Auswahlen möglich
        const isSelected = current.includes(extraId);
        if (isSelected) {
          return { ...prev, [groupId]: current.filter(id => id !== extraId) };
        } else {
          const maxSelections = transformedExtras?.find(g => g.id === groupId)?.maxSelections;
          if (maxSelections && current.length >= maxSelections) {
            return prev; // Maximalanzahl erreicht
          }
          return { ...prev, [groupId]: [...current, extraId] };
        }
      }
    });
  };

  const isExtraSelected = (groupId: number, extraId: number) => {
    return selectedExtras[groupId]?.includes(extraId) || false;
  };

  const getSelectedExtrasList = () => {
    const extras: any[] = [];
    Object.entries(selectedExtras).forEach(([groupId, extraIds]) => {
      extraIds.forEach(extraId => {
        const group = transformedExtras?.find(g => g.id === parseInt(groupId));
        const extra = group?.extraItems.find(e => e.id === extraId);
        if (extra) {
          extras.push({
            extraGroupId: parseInt(groupId),
            extraItemId: extraId,
            name: extra.name,
            price: extra.isFree ? 0 : (parseFloat(extra.price.toString()) || 0)
          });
        }
      });
    });
    return extras;
  };

  const hasRequiredExtrasFilled = () => {
    const requiredExtras = transformedExtras.filter(group => group.isRequired);
    return requiredExtras.every(group => {
      const selectedCount = selectedExtras[group.id]?.length || 0;
      const minSelections = group.minSelections || 1;
      return selectedCount >= minSelections;
    });
  };

  const handleConfirm = () => {
    // Prüfe ob alle Pflichtfelder ausgefüllt sind
    const requiredExtras = transformedExtras.filter(group => group.isRequired);
    const missingRequiredExtras = requiredExtras.filter(group => {
      const selectedCount = selectedExtras[group.id]?.length || 0;
      const minSelections = group.minSelections || 1;
      return selectedCount < minSelections;
    });

    if (missingRequiredExtras.length > 0) {
      const missingNames = missingRequiredExtras.map(group => group.name).join(', ');
      alert(`Bitte wähle mindestens eine Option aus: ${missingNames}`);
      return;
    }

    const extras = getSelectedExtrasList();
    onAddToCart(extras);
    onClose();
  };

  const extrasTotal = getSelectedExtrasList().reduce((sum, extra) => sum + (parseFloat(extra.price.toString()) || 0), 0);
  const totalPrice = (product.price + extrasTotal) * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-gray-600 mt-1">Extras & Zusätze auswählen</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!transformedExtras || transformedExtras.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine Extras verfügbar für dieses Produkt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {transformedExtras.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    {group.name}
                    {group.isRequired && (
                      <span className="text-sm text-red-600 ml-2 font-medium">
                        * Pflichtfeld
                      </span>
                    )}
                    {group.maxSelections && group.maxSelections > 1 && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Max. {group.maxSelections})
                      </span>
                    )}
                  </h3>
                  
                  <div className="space-y-3">
                    {group.extraItems.map((extra) => (
                      <label key={extra.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <input
                            type={group.selectionType === 'RADIO' ? 'radio' : 'checkbox'}
                            name={`group-${group.id}`}
                            checked={isExtraSelected(group.id, extra.id)}
                            onChange={() => toggleExtra(group.id, extra.id)}
                            className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                          />
                          <span className="text-gray-700 font-medium">{extra.name}</span>
                        </div>
                        <div className="text-right">
                          {extra.isFree ? (
                            <span className="text-green-600 font-medium text-sm">Kostenlos</span>
                          ) : (
                            <span className="text-brand-600 font-semibold">
                              +€{(parseFloat(extra.price.toString()) || 0).toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          {/* Pflichtfeld-Hinweis */}
          {transformedExtras.some(group => group.isRequired) && !hasRequiredExtrasFilled() && (
            <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">
              ⚠️ Bitte wähle alle Pflichtfelder aus, bevor du das Produkt in den Warenkorb legst.
            </div>
          )}

          {/* Preisübersicht */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Grundpreis ({quantity}x)</span>
              <span>€{(product.price * quantity).toFixed(2).replace('.', ',')}</span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Extras ({quantity}x)</span>
                <span>€{(extrasTotal * quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Gesamt</span>
              <span>€{totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              disabled={transformedExtras.length > 0 && !hasRequiredExtrasFilled()}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                transformedExtras.length === 0 || hasRequiredExtrasFilled()
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
