'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PrinterIcon, DocumentTextIcon, UserIcon, BuildingOfficeIcon, ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  logo?: string;
  atuNumber?: string;
  fnNumber?: string;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  extras?: string[];
  product?: {
    name: string;
    description: string;
    taxRate: number;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
  };
  orderItems: OrderItem[];
  totalAmount: number;
  totalAmountNet: number;
  totalTax: number;
  deliveryType: string;
  deliveryTime?: string;
  status: string;
  createdAt: string;
  notes?: string;
  tipAmount?: number;
  tipType?: string;
  tipPercentage?: number;
  tipPaid?: boolean;
  taxBreakdown?: Array<{
    rate: number;
    ratePercent: number;
    netAmount: number;
    taxAmount: number;
  }>;
}

interface OrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderPrintModal({
  isOpen,
  onClose,
  order
}: OrderPrintModalProps) {
  const [printType, setPrintType] = useState<'customer' | 'kitchen'>('customer');
  const [copies, setCopies] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [orderWithTaxBreakdown, setOrderWithTaxBreakdown] = useState<Order | null>(null);

  useEffect(() => {
    // Restaurant-Einstellungen laden
    const loadRestaurantSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setRestaurantSettings(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Restaurant-Einstellungen:', error);
      }
    };

    // Bestellungsdaten mit taxBreakdown laden
    const loadOrderWithTaxBreakdown = async () => {
      if (order?.id) {
        try {
          const response = await fetch(`/api/orders/${order.id}/print`);
          if (response.ok) {
            const data = await response.json();
            setOrderWithTaxBreakdown({
              ...order,
              taxBreakdown: data.taxBreakdown,
              // Verwende die Daten von der API für korrekte Anzeige
              orderNumber: data.order.orderNumber,
              createdAt: data.order.date,
              customer: {
                firstName: data.customer.name.split(' ')[0] || '',
                lastName: data.customer.name.split(' ').slice(1).join(' ') || '',
                email: data.customer.email,
                phone: data.customer.phone,
                address: data.customer.address.split(',')[0] || '',
                city: data.customer.address.split(',')[1]?.trim() || '',
                postalCode: ''
              },
              totalAmount: data.totals.totalAmount,
              totalAmountNet: data.totals.subtotal,
              totalTax: data.totals.totalTax
            });
          } else {
            setOrderWithTaxBreakdown(order);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Bestellungsdaten:', error);
          setOrderWithTaxBreakdown(order);
        }
      }
    };

    if (isOpen) {
      loadRestaurantSettings();
      loadOrderWithTaxBreakdown();
    }
  }, [isOpen, order]);

  if (!isOpen || !order || !orderWithTaxBreakdown) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      const printContent = document.getElementById('print-content');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
                     printWindow.document.write(`
             <!DOCTYPE html>
             <html>
               <head>
                 <title>${printType === 'customer' ? 'Kundenbon' : 'Küchenzettel'}</title>
                 <style>
                   @media print {
                     @page { 
                       margin: 0; 
                       size: 80mm auto; 
                     }
                     body { 
                       margin: 0; 
                       padding: 0; 
                       width: 80mm; 
                     }
                     .no-print { display: none !important; }
                   }
                   
                   body { 
                     width: 80mm; 
                     margin: 0 auto; 
                     background: white; 
                     font-family: Arial, sans-serif;
                     font-size: 10px;
                     line-height: 1.2;
                     color: black;
                   }
                   
                   .receipt-header {
                     text-align: center;
                     padding: 8px 4px;
                     border-bottom: 2px solid #d1d5db;
                   }
                   
                   .logo {
                     width: 192px;
                     height: 192px;
                     margin: 0 auto 4px;
                     display: block;
                     object-fit: contain;
                   }
                   
                   .restaurant-name {
                     font-size: 14px;
                     font-weight: bold;
                     text-transform: uppercase;
                     letter-spacing: 1px;
                     margin-bottom: 4px;
                     color: black;
                   }
                   
                   .restaurant-info {
                     font-size: 8px;
                     color: black;
                     line-height: 1.1;
                   }
                   
                   .order-header {
                     text-align: center;
                     padding: 8px;
                     border-bottom: 1px solid #d1d5db;
                     margin-bottom: 8px;
                   }
                   
                   .order-title {
                     font-size: 10px;
                     font-weight: bold;
                     text-transform: uppercase;
                     letter-spacing: 1px;
                     margin-bottom: 4px;
                     color: black;
                   }
                   
                   .order-number {
                     font-size: 10px;
                     font-weight: bold;
                     color: black;
                   }
                   
                   .order-date {
                     font-size: 8px;
                     font-weight: 500;
                     color: black;
                   }
                   
                   .section {
                     padding: 8px;
                     border-bottom: 1px solid #d1d5db;
                     margin-bottom: 8px;
                   }
                   
                   .section-title {
                     font-size: 8px;
                     font-weight: bold;
                     text-transform: uppercase;
                     letter-spacing: 1px;
                     margin-bottom: 4px;
                     color: black;
                   }
                   
                   .section-content {
                     font-size: 8px;
                     font-weight: 500;
                     color: black;
                     margin-bottom: 2px;
                   }
                   
                   .items-row {
                     display: flex;
                     justify-content: space-between;
                     align-items: flex-start;
                     padding: 8px;
                     border-bottom: 1px solid #e5e7eb;
                   }
                   
                   .item-name {
                     flex: 1;
                       font-size: 8px;
                       font-weight: 600;
                       color: black;
                   }
                   
                   .item-extras {
                     font-size: 8px;
                     color: #6b7280;
                     font-style: italic;
                     margin-top: 2px;
                     margin-left: 8px;
                   }
                   
                   .item-quantity {
                     font-size: 8px;
                     font-weight: bold;
                     background: #f3f4f6;
                     padding: 2px 8px;
                     border-radius: 12px;
                     margin: 0 8px;
                     min-width: 16px;
                     text-align: center;
                     color: black;
                   }
                   
                   .item-price {
                     font-size: 8px;
                     font-weight: bold;
                     min-width: 48px;
                     text-align: right;
                     color: black;
                   }
                   
                   .totals-row {
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     margin-bottom: 2px;
                   }
                   
                   .totals-label {
                     font-size: 8px;
                     color: black;
                   }
                   
                   .totals-value {
                     font-size: 8px;
                     font-weight: bold;
                     color: black;
                   }
                   
                   .totals-divider {
                     padding-top: 8px;
                     border-top: 1px solid #d1d5db;
                   }
                   
                   .footer {
                     text-align: center;
                     padding-top: 8px;
                     border-top: 2px dashed #d1d5db;
                   }
                   
                   .thank-you {
                     font-size: 8px;
                     font-weight: bold;
                     text-transform: uppercase;
                     letter-spacing: 1px;
                     background: white;
                     padding: 8px;
                     border: 1px solid #d1d5db;
                     margin-bottom: 8px;
                     color: black;
                   }
                   
                   .print-time {
                     font-size: 8px;
                     color: black;
                     margin-bottom: 12px;
                   }
                 </style>
               </head>
               <body>
                 ${printContent.innerHTML}
               </body>
             </html>
           `);
          printWindow.document.close();
          
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in formatDate:', dateString);
        return 'Ungültiges Datum';
      }
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Ungültiges Datum';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-xl">
            <div className="flex items-center space-x-3">
              <PrinterIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Bon drucken</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Print Options */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      value="customer"
                      checked={printType === 'customer'}
                      onChange={(e) => setPrintType(e.target.value as 'customer' | 'kitchen')}
                      className="mr-3 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Kundenbon</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      value="kitchen"
                      checked={printType === 'kitchen'}
                      onChange={(e) => setPrintType(e.target.value as 'customer' | 'kitchen')}
                      className="mr-3 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <UserIcon className="w-5 h-5 mr-2 text-green-500 group-hover:text-green-600 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Küchenzettel</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Anzahl:</label>
                <select
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Print Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div className="max-w-80 mx-auto">
              <div id="print-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
                                                  {/* Header */}
                 <div className="receipt-header">
                   {restaurantSettings?.logo ? (
                     <img 
                       src={restaurantSettings.logo} 
                       alt="Restaurant Logo" 
                       className="logo"
                     />
                   ) : (
                     <div className="logo bg-gray-100 rounded-full flex items-center justify-center text-6xl">🍽️</div>
                   )}
                   <div className="restaurant-name">
                     {restaurantSettings?.restaurantName || 'RESTAURANT NAME'}
                   </div>
                   <div className="restaurant-info">
                     {restaurantSettings?.address && `${restaurantSettings.address}`}
                     {restaurantSettings?.postalCode && restaurantSettings?.city && ` • ${restaurantSettings.postalCode} ${restaurantSettings.city}`}
                   </div>
                   {restaurantSettings?.phone && (
                     <div className="restaurant-info">
                       {restaurantSettings.phone}
                     </div>
                   )}
                   {restaurantSettings?.email && (
                     <div className="restaurant-info">
                       {restaurantSettings.email}
                     </div>
                   )}
                   {restaurantSettings?.atuNumber && (
                     <div className="restaurant-info">
                       {restaurantSettings.atuNumber}
                     </div>
                   )}
                   {restaurantSettings?.fnNumber && (
                     <div className="restaurant-info">
                       {restaurantSettings.fnNumber}
                     </div>
                   )}
                 </div>

                                 {/* Order Header */}
                 <div className="order-header">
                   <div className="order-title">
                     {printType === 'customer' ? 'BESTELLUNG' : 'KÜCHENZETTEL'}
                   </div>
                   <div className="order-number">#{orderWithTaxBreakdown.orderNumber}</div>
                   <div className="order-date">{formatDate(orderWithTaxBreakdown.createdAt)}</div>
                 </div>

                                 {/* Customer Info - nur für Kundenbon */}
                 {printType === 'customer' && (
                   <div className="section">
                     <div className="section-title">
                       KUNDENDATEN
                     </div>
                     <div className="section-content">
                       {orderWithTaxBreakdown.customer.firstName} {orderWithTaxBreakdown.customer.lastName}
                     </div>
                     {orderWithTaxBreakdown.customer.address && (
                       <div className="section-content">
                         {orderWithTaxBreakdown.customer.address}<br />
                         {orderWithTaxBreakdown.customer.postalCode} {orderWithTaxBreakdown.customer.city}
                       </div>
                     )}
                   </div>
                 )}

                                 {/* Items */}
                 <div className="bg-white border-b border-gray-300 mb-2 overflow-hidden">
                   {orderWithTaxBreakdown.orderItems.map((item, index) => (
                     <div key={index} className="items-row">
                       <div className="flex-1">
                         <div className="item-name">{item.productName}</div>
                         {item.extras && item.extras.length > 0 && (
                           <div className="item-extras">
                             + {item.extras.join(', ')}
                           </div>
                         )}
                       </div>
                       <div className="item-quantity">
                         {item.quantity}
                       </div>
                       <div className="item-price">
                         {formatPrice(item.totalPrice)}
                       </div>
                     </div>
                   ))}
                 </div>

                                 {/* Totals - nur für Kundenbon */}
                 {printType === 'customer' && (
                   <div className="section">
                     <div className="totals-row">
                       <span className="totals-label">Zwischensumme:</span>
                       <span className="totals-value">{formatPrice(orderWithTaxBreakdown.totalAmountNet)}</span>
                     </div>
                     
                                           {/* MwSt. Aufschlüsselung nach Steuersätzen */}
                      {(() => {
                        // Verwende die taxBreakdown von der API, falls verfügbar
                        if (orderWithTaxBreakdown.taxBreakdown && Array.isArray(orderWithTaxBreakdown.taxBreakdown)) {
                          return orderWithTaxBreakdown.taxBreakdown.map((tax: any) => (
                            <div key={tax.rate} className="totals-row">
                              <span className="totals-label">MwSt. ({tax.ratePercent}%):</span>
                              <span className="totals-value">{formatPrice(tax.taxAmount)}</span>
                            </div>
                          ));
                        }

                        // Fallback: Berechne MwSt. selbst
                        const taxGroups = orderWithTaxBreakdown.orderItems.reduce((groups, item) => {
                          const taxRate = parseFloat(item.taxRate?.toString() || '0.20');
                          if (!groups[taxRate]) {
                            groups[taxRate] = { items: [], total: 0 };
                          }
                          groups[taxRate].items.push(item);
                          groups[taxRate].total += parseFloat(item.totalPrice.toString());
                          return groups;
                        }, {} as Record<number, { items: OrderItem[], total: number }>);

                        const taxBreakdown = Object.entries(taxGroups).map(([taxRate, data]) => {
                          const rate = parseFloat(taxRate);
                          const netAmount = data.total / (1 + rate);
                          const taxAmount = data.total - netAmount;
                          return { rate, taxAmount, netAmount };
                        });

                        return taxBreakdown.map(({ rate, taxAmount }) => (
                          <div key={rate} className="totals-row">
                            <span className="totals-label">MwSt. ({(rate * 100).toFixed(0)}%):</span>
                            <span className="totals-value">{formatPrice(taxAmount)}</span>
                          </div>
                        ));
                      })()}
                     
                     {/* Trinkgeld - nur bei Lieferungen */}
                     {orderWithTaxBreakdown.deliveryType === 'DELIVERY' && orderWithTaxBreakdown.tipAmount && parseFloat(orderWithTaxBreakdown.tipAmount.toString()) > 0 && (
                       <div className="totals-row">
                         <span className="totals-label">💰 Trinkgeld für Lieferant:</span>
                         <span className="totals-value">{formatPrice(parseFloat(orderWithTaxBreakdown.tipAmount.toString()))}</span>
                       </div>
                     )}
                     
                     <div className="totals-row totals-divider">
                       <span className="totals-label">Gesamt:</span>
                       <span className="totals-value">{formatPrice(orderWithTaxBreakdown.totalAmount)}</span>
                     </div>
                   </div>
                 )}

                                 {/* Delivery Info - nur für Kundenbon */}
                 {printType === 'customer' && (
                   <div className="section">
                     <div className="section-title">
                       LIEFERUNG
                     </div>
                     <div className="section-content">
                       {orderWithTaxBreakdown.deliveryType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}
                     </div>
                     {orderWithTaxBreakdown.deliveryTime && (
                       <div className="section-content">
                         Gewünschte Zeit: {(() => {
                           try {
                             const date = new Date(orderWithTaxBreakdown.deliveryTime);
                             return isNaN(date.getTime()) ? 'Ungültiges Datum' : date.toLocaleTimeString('de-DE', {
                               hour: '2-digit',
                               minute: '2-digit'
                             });
                           } catch (error) {
                             console.warn('Invalid delivery time in OrderPrintModal:', orderWithTaxBreakdown.deliveryTime, error);
                             return 'Ungültiges Datum';
                           }
                         })()}
                       </div>
                     )}
                   </div>
                 )}

                                 {/* Kitchen Notes - nur für Küchenzettel */}
                 {printType === 'kitchen' && orderWithTaxBreakdown.notes && (
                   <div className="section">
                     <div className="section-title">NOTIZEN:</div>
                     <div className="section-content">{orderWithTaxBreakdown.notes}</div>
                   </div>
                 )}

                                 {/* Footer */}
                 <div className="footer">
                   {printType === 'customer' ? (
                     <div className="thank-you">
                       Vielen Dank für Ihre Bestellung!
                     </div>
                   ) : (
                     <div className="thank-you">
                       Bitte zubereiten
                     </div>
                   )}
                   <div className="print-time">Bon gedruckt am {new Date().toLocaleString('de-DE')}</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <PrinterIcon className="w-4 h-4 text-gray-400" />
              <span>Bon-Größe: 80mm x automatische Länge</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                Abbrechen
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PrinterIcon className="w-5 h-5" />
                {isPrinting ? 'Drucke...' : `Drucken (${copies}x)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
