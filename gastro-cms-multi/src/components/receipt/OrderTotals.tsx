import React from 'react';

interface TaxBreakdown {
  rate: number;
  ratePercent: number;
  netAmount: number;
  taxAmount: number;
}

interface OrderTotalsProps {
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  deliveryFee?: number;
  tipAmount?: number;
  taxBreakdown: TaxBreakdown[];
  coupon?: {
    code: string;
    discountAmount: number;
  };
}

export default function OrderTotals({
  subtotal,
  totalTax,
  totalAmount,
  deliveryFee = 0,
  tipAmount = 0,
  taxBreakdown,
  coupon
}: OrderTotalsProps) {
  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  const finalTotal = totalAmount + deliveryFee + tipAmount;

  return (
    <div className="totals-section">
      <div className="total-line subtotal">
        <span>Zwischensumme:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      
      {deliveryFee > 0 && (
        <div className="total-line">
          <span>Liefergebühr:</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
      )}
      
      {tipAmount > 0 && (
        <div className="total-line">
          <span>Trinkgeld:</span>
          <span>{formatPrice(tipAmount)}</span>
        </div>
      )}
      
      {coupon && (
        <div className="total-line">
          <span>Gutschein ({coupon.code}):</span>
          <span>-{formatPrice(coupon.discountAmount)}</span>
        </div>
      )}
      
      {/* Tax Breakdown */}
      {taxBreakdown.map((tax, index) => (
        <div key={index} className="total-line tax">
          <span>MwSt. {tax.ratePercent}%:</span>
          <span>{formatPrice(tax.taxAmount)}</span>
        </div>
      ))}
      
      <div className="total-line final">
        <span>Gesamtbetrag:</span>
        <span>{formatPrice(finalTotal)}</span>
      </div>
    </div>
  );
}
