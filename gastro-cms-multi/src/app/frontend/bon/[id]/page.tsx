'use client';

import React, { useEffect, useState } from 'react';
import ProfessionalReceipt from '@/components/receipt/ProfessionalReceipt';
import KitchenTicket from '@/components/receipt/KitchenTicket';

interface ReceiptItem {
  id: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  extras?: Array<{
    name: string;
    price: number;
  }>;
}

interface TaxBreakdownItem {
  rate: number;
  ratePercent: number;
  netAmount: number;
  taxAmount: number;
}

interface ReceiptData {
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  taxNumber?: string;
  uid?: string;
  logoUrl?: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  deliveryType: string;
  paymentMethod: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: ReceiptItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  deliveryFee?: number;
  tipAmount?: number;
  taxBreakdown: TaxBreakdownItem[];
  deliveryTime?: string;
  notes?: string;
  printTime: string;
  restaurantFooter: string;
}

export default function ProfessionalBonPage({ params }: { params: { id: string } }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(params.id);
  }, [params.id]);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}/receipt`);
      if (!response.ok) {
        throw new Error('Bon-Daten nicht gefunden');
      }

      const receiptData = await response.json();
      setOrderData(receiptData);
    } catch (err) {
      console.error('Fehler beim Laden der Bon-Daten:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintReceipt = () => {
    // Setze CSS-Klasse für separaten Druck
    document.body.classList.add('print-receipt-only');
    
    // Kurze Verzögerung für CSS-Anwendung
    setTimeout(() => {
      window.print();
      
      // Cleanup nach dem Druck
      setTimeout(() => {
        document.body.classList.remove('print-receipt-only');
      }, 1000);
    }, 100);
  };

  const handlePrintKitchen = () => {
    // Setze CSS-Klasse für separaten Druck
    document.body.classList.add('print-kitchen-only');
    
    // Kurze Verzögerung für CSS-Anwendung
    setTimeout(() => {
      window.print();
      
      // Cleanup nach dem Druck
      setTimeout(() => {
        document.body.classList.remove('print-kitchen-only');
      }, 1000);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Bon wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h1>
          <p className="text-gray-600 mb-4">{error || 'Bon konnte nicht geladen werden'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 no-print">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professioneller Bon
          </h1>
          <p className="text-gray-600">
            Bestellung #{orderData.orderNumber} - {new Date(orderData.orderDate).toLocaleDateString('de-DE')}
          </p>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 no-print">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Kundenbon
            </h2>
            <button
              onClick={handlePrintReceipt}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              🖨️ Kundenbon drucken
            </button>
          </div>
        </div>

        {/* Receipt Content - Only for Print */}
        <div id="receipt-only" className="print-only">
          <ProfessionalReceipt
            {...orderData}
            onPrint={() => {}}
            showPrintButton={false}
          />
        </div>

        {/* Kitchen Ticket */}
        <div className="bg-white rounded-lg shadow-lg p-6 no-print">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Küchenzettel
            </h2>
            <button
              onClick={handlePrintKitchen}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
            >
              🖨️ Küchenzettel drucken
            </button>
          </div>
        </div>

        {/* Kitchen Content - Only for Print */}
        <div id="kitchen-only" className="print-only">
          <KitchenTicket
            orderNumber={orderData.orderNumber}
            orderTime={orderData.orderDate}
            items={orderData.items}
            notes={orderData.notes}
            priority="NORMAL"
          />
        </div>

        {/* Actions */}
        <div className="text-center mt-8 no-print">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-semibold"
          >
            ← Zurück
          </button>
        </div>
      </div>
    </div>
  );
}