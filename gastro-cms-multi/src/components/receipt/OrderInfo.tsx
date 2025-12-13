import React from 'react';

interface OrderInfoProps {
  orderNumber: string;
  date: string;
  time: string;
  status: string;
  deliveryType: string;
  paymentMethod: string;
}

export default function OrderInfo({
  orderNumber,
  date,
  time,
  status,
  deliveryType,
  paymentMethod
}: OrderInfoProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-info">
      <div className="order-title">Bestellung</div>
      
      <div className="order-details">
        <span>Bestell-Nr:</span>
        <span className="order-number">#{orderNumber}</span>
      </div>
      
      <div className="order-details">
        <span>Datum:</span>
        <span>{formatDate(date)}</span>
      </div>
      
      <div className="order-details">
        <span>Uhrzeit:</span>
        <span>{formatTime(date)}</span>
      </div>
      
      <div className="order-details">
        <span>Status:</span>
        <span>{status}</span>
      </div>
      
      <div className="order-details">
        <span>Art:</span>
        <span>{deliveryType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}</span>
      </div>
      
      <div className="order-details">
        <span>Zahlung:</span>
        <span>{paymentMethod}</span>
      </div>
    </div>
  );
}
