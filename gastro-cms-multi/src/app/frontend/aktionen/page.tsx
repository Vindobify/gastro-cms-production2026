'use client';

import { useState, useEffect } from 'react';
import { TagIcon, CalendarIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useToast } from '@/contexts/ToastContext';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY';
  discountValue: number | null;
  minimumOrderValue?: number;
  maxUsage?: number;
  currentUsage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function AktionenPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const response = await fetch('/api/coupons?active=true');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        setError('Fehler beim Laden der Gutscheine');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Gutscheine:', error);
      setError('Fehler beim Laden der Gutscheine');
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'FREE_DELIVERY') {
      return 'Kostenlose Lieferung';
    } else if (coupon.discountType === 'PERCENTAGE' && coupon.discountValue !== null) {
      return `${coupon.discountValue}%`;
    } else if (coupon.discountType === 'FIXED_AMOUNT' && coupon.discountValue !== null) {
      return `€${coupon.discountValue.toFixed(2)}`;
    } else {
      return 'Unbekannt';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Kein Datum';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ungültiges Datum';
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      success(`Gutscheincode "${code}" wurde kopiert! 🎉`);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
      showError('Fehler beim Kopieren des Gutscheincodes');
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    return expiryDate < today;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Lade Aktionen...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Aktuelle Aktionen & Gutscheine
          </h1>
          <p className="text-xl text-gray-600">
            Spare bei deiner nächsten Bestellung mit unseren exklusiven Angeboten!
          </p>
        </div>

        {/* Gutscheine Grid */}
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Aktionen verfügbar
            </h3>
            <p className="text-gray-600">
              Aktuell sind keine Gutscheine oder Aktionen verfügbar. Schau bald wieder vorbei!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-white rounded-xl shadow-card overflow-hidden border-2 transition-all hover:shadow-lg ${
                  isExpired(coupon.validUntil)
                    ? 'border-gray-300 opacity-60'
                    : isExpiringSoon(coupon.validUntil)
                    ? 'border-yellow-400'
                    : 'border-brand-200 hover:border-brand-400'
                }`}
              >
                {/* Gutschein Header */}
                <div className={`px-6 py-4 ${
                  isExpired(coupon.validUntil)
                    ? 'bg-gray-100'
                    : 'bg-gradient-to-r from-brand-500 to-brand-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ReceiptPercentIcon className={`w-6 h-6 ${
                        isExpired(coupon.validUntil) ? 'text-gray-500' : 'text-white'
                      }`} />
                      <span className={`text-2xl font-bold ${
                        isExpired(coupon.validUntil) ? 'text-gray-500' : 'text-white'
                      }`}>
                        {formatDiscount(coupon)}
                      </span>
                    </div>
                    {isExpiringSoon(coupon.validUntil) && !isExpired(coupon.validUntil) && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Läuft bald ab!
                      </span>
                    )}
                    {isExpired(coupon.validUntil) && (
                      <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                        Abgelaufen
                      </span>
                    )}
                  </div>
                </div>

                {/* Gutschein Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {coupon.description}
                  </h3>

                  {/* Gutschein Code */}
                  <div className="mb-4">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                        isExpired(coupon.validUntil)
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-brand-300 bg-brand-50 hover:bg-brand-100'
                      }`}
                      onClick={() => !isExpired(coupon.validUntil) && copyToClipboard(coupon.code)}
                    >
                      <span className={`text-xl font-mono font-bold tracking-wider ${
                        isExpired(coupon.validUntil) ? 'text-gray-500' : 'text-brand-700'
                      }`}>
                        {coupon.code}
                      </span>
                      {!isExpired(coupon.validUntil) && (
                        <p className="text-xs text-brand-600 mt-1">
                          Klicken zum Kopieren
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {coupon.minimumOrderValue && (
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span>Mindestbestellwert: €{coupon.minimumOrderValue?.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Gültig bis: {formatDate(coupon.validUntil)}</span>
                    </div>

                    {coupon.maxUsage && (
                      <div className="flex items-center space-x-2">
                        <span>🎫</span>
                        <span>
                          Verwendet: {coupon.currentUsage}/{coupon.maxUsage}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Usage Progress */}
                  {coupon.maxUsage && (
                    <div className="mt-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isExpired(coupon.validUntil) ? 'bg-gray-400' : 'bg-brand-500'
                          }`}
                          style={{
                            width: `${Math.min((coupon.currentUsage / coupon.maxUsage) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 So funktioniert's:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Klicke auf einen Gutscheincode, um ihn zu kopieren</li>
            <li>• Gib den Code beim Checkout ein</li>
            <li>• Der Rabatt wird automatisch angewendet</li>
            <li>• Beachte Mindestbestellwerte und Gültigkeitsdauer</li>
          </ul>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
