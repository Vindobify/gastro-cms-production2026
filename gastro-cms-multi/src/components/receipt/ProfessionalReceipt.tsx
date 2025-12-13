'use client';

import React, { useEffect } from 'react';
import ReceiptHeader from './ReceiptHeader';
import OrderInfo from './OrderInfo';
import CustomerInfo from './CustomerInfo';
import OrderItems from './OrderItems';
import OrderTotals from './OrderTotals';
import DeliveryInfo from './DeliveryInfo';
import ReceiptFooter from './ReceiptFooter';

interface OrderItem {
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

interface TaxBreakdown {
  rate: number;
  ratePercent: number;
  netAmount: number;
  taxAmount: number;
}

interface ProfessionalReceiptProps {
  // Restaurant Info
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantEmail?: string;
  taxNumber?: string;
  uid?: string;
  
  // Order Info
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  deliveryType: string;
  paymentMethod: string;
  
  // Customer Info
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  // Order Items
  items: OrderItem[];
  
  // Totals
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  deliveryFee?: number;
  tipAmount?: number;
  taxBreakdown: TaxBreakdown[];
  
  // Coupon
  coupon?: {
    code: string;
    discountAmount: number;
  };
  
  // Delivery Info
  deliveryTime?: string;
  notes?: string;
  
  // Footer
  printTime?: string;
  restaurantFooter?: string;
  
  // Actions
  onPrint?: () => void;
  showPrintButton?: boolean;
}

export default function ProfessionalReceipt({
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  restaurantEmail,
  taxNumber,
  uid,
  orderNumber,
  orderDate,
  orderStatus,
  deliveryType,
  paymentMethod,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  items,
  subtotal,
  totalTax,
  totalAmount,
  deliveryFee = 0,
  tipAmount = 0,
  taxBreakdown,
  coupon,
  deliveryTime,
  notes,
  printTime,
  restaurantFooter,
  onPrint,
  showPrintButton = true
}: ProfessionalReceiptProps) {
  
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  useEffect(() => {
    // Auto-focus for printing
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="receipt-container" className="receipt">
      <ReceiptHeader
        restaurantName={restaurantName}
        address={restaurantAddress}
        phone={restaurantPhone}
        email={restaurantEmail}
        taxNumber={taxNumber}
        uid={uid}
      />
      
      <OrderInfo
        orderNumber={orderNumber}
        date={orderDate}
        time={orderDate}
        status={orderStatus}
        deliveryType={deliveryType}
        paymentMethod={paymentMethod}
      />
      
      <CustomerInfo
        name={customerName}
        email={customerEmail}
        phone={customerPhone}
        address={customerAddress}
      />
      
      <OrderItems items={items} />
      
      <OrderTotals
        subtotal={subtotal}
        totalTax={totalTax}
        totalAmount={totalAmount}
        deliveryFee={deliveryFee}
        tipAmount={tipAmount}
        taxBreakdown={taxBreakdown}
        coupon={coupon}
      />
      
      <DeliveryInfo
        deliveryType={deliveryType}
        deliveryTime={deliveryTime}
        deliveryAddress={customerAddress}
        notes={notes}
      />
      
      <ReceiptFooter
        printTime={printTime}
        restaurantFooter={restaurantFooter}
      />
      
      {showPrintButton && (
        <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            className="print-button"
            onClick={handlePrint}
          >
            🖨️ Bon drucken
          </button>
        </div>
      )}
    </div>
  );
}
