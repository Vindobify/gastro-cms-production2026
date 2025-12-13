'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { STANDARD_ALLERGENS } from '@/lib/constants';
import ExtrasModal from './ExtrasModal';
import AllergenModal from './AllergenModal';

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
  categoryId: number;
  isAvailable: boolean;
  taxRate: number;
  allergens?: string;
  category?: {
    categoryExtras?: Array<{
      extraGroup: ExtraGroup;
    }>;
  };
  productExtras?: Array<{
    extraGroup: ExtraGroup;
  }>;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [selectedAllergen, setSelectedAllergen] = useState<string>('');
  const { addItem } = useCart();

  // Stelle sicher, dass alle Werte definiert sind
  const safeProduct = {
    ...product,
    price: product.price || 0,
    description: product.description || '',
    isAvailable: product.isAvailable ?? true
  };

  // Parse Allergene
  const parseAllergens = (allergensString: string | undefined) => {
    if (!allergensString) return [];
    try {
      // Wenn es bereits ein JSON-Array ist
      if (allergensString.startsWith('[')) {
        return JSON.parse(allergensString);
      }
      // Wenn es ein einfacher String ist, in Array umwandeln
      return [allergensString];
    } catch {
      return [];
    }
  };

  const allergens = parseAllergens(product.allergens);

  // Kombiniere productExtras und categoryExtras
  const productExtras = product.productExtras?.map(pe => pe.extraGroup) || [];
  const categoryExtras = product.category?.categoryExtras?.map((ce: any) => ce.extraGroup) || [];

  // Entferne Duplikate basierend auf ID
  const allExtras = [...productExtras, ...categoryExtras];
  const transformedExtras = allExtras.filter((extra, index, self) =>
    index === self.findIndex(e => e.id === extra.id)
  );

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleCartClick = () => {
    // Wenn Produkt Extras hat, öffne Modal
    if (transformedExtras && transformedExtras.length > 0) {
      setShowExtrasModal(true);
    } else {
      // Direkt zum Warenkorb hinzufügen
      handleDirectAddToCart([]);
    }
  };

  const handleDirectAddToCart = (extras: any[]) => {
    const basePrice = product.price;

    addItem({
      productId: safeProduct.id,
      name: safeProduct.name,
      description: safeProduct.description,
      price: basePrice,
      quantity,
      extras,
      taxRate: safeProduct.taxRate
    });

    onAddToCart();

    // Reset form
    setQuantity(1);
  };

  const handleAllergenClick = (allergenCode: string) => {
    setSelectedAllergen(allergenCode);
    setShowAllergenModal(true);
  };


  if (!safeProduct.isAvailable) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 opacity-60">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                {product.name}
              </h3>
              {/* Allergene */}
              <div className="flex gap-1">
                {allergens
                  .filter((allergenCode: string) => allergenCode !== 'NONE')
                  .map((allergenCode: string) => {
                    const allergenInfo = STANDARD_ALLERGENS.find(a => a.code === allergenCode);
                    return allergenInfo ? (
                      <button
                        key={allergenCode}
                        onClick={() => handleAllergenClick(allergenCode)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${allergenInfo.color} hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400`}
                        title={`${allergenInfo.name} - Klicken für Details`}
                        aria-label={`${allergenInfo.name} - Klicken für Details`}
                      >
                        {allergenCode}
                      </button>
                    ) : null;
                  })}
              </div>
            </div>
            <p className="text-gray-600 mb-3 text-sm line-clamp-2">
              {product.description}
            </p>
            <div className="text-red-500 font-medium">
              Nicht verfügbar
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-brand-600 mb-2">
              €{product.price.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Titel und Allergene */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-display font-semibold text-gray-900">
              {safeProduct.name}
            </h3>
            {/* Allergene */}
            <div className="flex gap-1">
              {allergens
                .filter((allergenCode: string) => allergenCode !== 'NONE')
                .map((allergenCode: string) => {
                  const allergenInfo = STANDARD_ALLERGENS.find(a => a.code === allergenCode);
                  return allergenInfo ? (
                    <button
                      key={allergenCode}
                      onClick={() => handleAllergenClick(allergenCode)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${allergenInfo.color} hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400`}
                      title={`${allergenInfo.name} - Klicken für Details`}
                      aria-label={`${allergenInfo.name} - Klicken für Details`}
                    >
                      {allergenCode}
                    </button>
                  ) : null;
                })}
            </div>
          </div>

          {/* Beschreibung */}
          <p className="text-gray-600 mb-3 text-sm line-clamp-2">
            {safeProduct.description}
          </p>

          {/* Extras Indicator */}
          {transformedExtras && transformedExtras.length > 0 && (
            <div className="mb-3">
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-background)' }}>
                ✨ Extras verfügbar
              </span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Menge verringern"
              disabled={quantity <= 1}
            >
              <span className="text-gray-600 font-bold text-sm">-</span>
            </button>
            <span className="text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center" aria-label={`Aktuelle Menge: ${quantity}`}>
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Menge erhöhen"
            >
              <span className="text-gray-600 font-bold text-sm">+</span>
            </button>
          </div>
        </div>

        {/* Preis und Warenkorb-Button rechts */}
        <div className="text-right ml-3 flex flex-col items-end">
          <div className="text-xl font-bold text-brand-600 mb-3">
            €{safeProduct.price.toFixed(2).replace('.', ',')}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleCartClick}
            className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-body)' }}
            title="Zum Warenkorb hinzufügen"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showExtrasModal && (
        <ExtrasModal
          isOpen={showExtrasModal}
          onClose={() => setShowExtrasModal(false)}
          product={safeProduct}
          quantity={quantity}
          extras={transformedExtras}
          onAddToCart={handleDirectAddToCart}
        />
      )}

      {showAllergenModal && (
        <AllergenModal
          isOpen={showAllergenModal}
          onClose={() => setShowAllergenModal(false)}
          allergenCode={selectedAllergen}
        />
      )}
    </div>
  );
}
