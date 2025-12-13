'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useCart } from '@/contexts/CartContext';
import { 
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowLeftIcon,
  TruckIcon,
  TicketIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function WarenkorbPage() {
  const { state: cartState, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Lieferung kostenlos ab €25 (berücksichtige Gutschein-Rabatt)
  const subtotalForDelivery = cartState.appliedCoupon ? cartState.subtotalAfterDiscount : cartState.totalPrice;
  const deliveryFee = subtotalForDelivery >= 25 ? 0 : 2.50;
  const finalTotal = subtotalForDelivery + deliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Bitte geben Sie einen Gutscheincode ein');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderAmount: cartState.totalPrice
        }),
      });

      if (response.ok) {
        const coupon = await response.json();
        applyCoupon(coupon);
        setCouponCode('');
        setCouponError('');
      } else {
        const error = await response.json();
        setCouponError(error.message || 'Gutschein konnte nicht angewendet werden');
      }
    } catch (error) {
      setCouponError('Fehler beim Anwenden des Gutscheins');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
              Ihr Warenkorb ist leer
            </h2>
            <p className="text-gray-600 mb-6">
              Fügen Sie leckere Gerichte aus unserer Speisekarte hinzu.
            </p>
            <Link
              href="/speisekarte"
              className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Zur Speisekarte
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {cartState.totalItems > 0 && `Warenkorb enthält ${cartState.totalItems} Artikel`}
      </div>
      
      <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/speisekarte"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zurück zur Speisekarte
          </Link>
          <h1 className="text-3xl font-display font-semibold text-gray-900">
            Warenkorb
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
              Ihre Bestellung ({cartState.totalItems} Artikel)
            </h2>
            
            <div className="space-y-4">
              {cartState.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                      
                      {/* Extras anzeigen */}
                      {item.extras.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Extras:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.extras.map((extra, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-md"
                              >
                                {extra.name}
                                {extra.price > 0 && ` (+€${extra.price.toFixed(2).replace('.', ',')})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-brand-600">
                        €{item.totalPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-sm text-gray-500">
                        €{(item.totalPrice / item.quantity).toFixed(2).replace('.', ',')} pro Stück
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label={`Menge von ${item.name} verringern`}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center" aria-label={`Aktuelle Menge: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label={`Menge von ${item.name} erhöhen`}
                      >
                        <PlusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      aria-label={`${item.name} aus Warenkorb entfernen`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gutschein Eingabe */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TicketIcon className="w-5 h-5 mr-2 text-brand-600" />
                Gutschein einlösen
              </h3>
              
              {cartState.appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">
                        Gutschein "{cartState.appliedCoupon.code}" angewendet
                      </p>
                      {cartState.items.length > 0 ? (
                        <p className="text-green-600 text-sm">
                          Rabatt: -€{cartState.discountAmount.toFixed(2).replace('.', ',')}
                        </p>
                      ) : (
                        <p className="text-green-600 text-sm">
                          {cartState.appliedCoupon.discountType === 'PERCENTAGE' 
                            ? `${cartState.appliedCoupon.discountValue}% Rabatt wird beim nächsten Artikel angewendet`
                            : `€${cartState.appliedCoupon.discountValue.toFixed(2).replace('.', ',')} Rabatt wird beim nächsten Artikel angewendet`
                          }
                        </p>
                      )}
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Gutscheincode eingeben"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isApplyingCoupon ? '...' : 'Einlösen'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-sm">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={clearCart}
                className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                Warenkorb leeren
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-card p-6 h-fit">
            <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
              Bestellübersicht
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Zwischensumme:</span>
                <span>€{cartState.totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {cartState.appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Gutschein "{cartState.appliedCoupon.code}":</span>
                  <span>-€{cartState.discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Lieferung:</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Kostenlos</span>
                  ) : (
                    `€${deliveryFee.toFixed(2).replace('.', ',')}`
                  )}
                </span>
              </div>
              
              {deliveryFee > 0 && (
                <div className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span>Kostenlose Lieferung ab €25,00</span>
                  </div>
                  <div className="mt-1">
                    Noch €{(25 - subtotalForDelivery).toFixed(2).replace('.', ',')} für kostenlose Lieferung
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Gesamt:</span>
                  <span>€{finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
            
            <Link
              href="/checkout"
              className="w-full bg-brand-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-brand-700 transition-colors text-center block"
            >
              Zur Kasse gehen
            </Link>
            
            <div className="mt-4 text-center">
              <Link
                href="/speisekarte"
                className="text-brand-600 hover:text-brand-700 text-sm"
              >
                Weiter einkaufen
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
