'use client';

import React from 'react';

interface OrderItem {
  id: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras?: Array<{
    name: string;
    price: number;
  }>;
}

interface KitchenTicketProps {
  orderNumber: string;
  orderTime: string;
  items: OrderItem[];
  notes?: string;
  priority?: 'NORMAL' | 'URGENT' | 'RUSH';
  tableNumber?: string;
}

export default function KitchenTicket({
  orderNumber,
  orderTime,
  items,
  notes,
  priority = 'NORMAL',
  tableNumber
}: KitchenTicketProps) {
  
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#dc3545';
      case 'RUSH':
        return '#ffc107';
      default:
        return '#000';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'DRINGEND';
      case 'RUSH':
        return 'EILIG';
      default:
        return 'NORMAL';
    }
  };

  return (
    <div className="kitchen-ticket">
      <div 
        className="kitchen-header"
        style={{ backgroundColor: getPriorityColor(priority) }}
      >
        <div>KÜCHENZETTEL</div>
        <div>#{orderNumber} - {getPriorityText(priority)}</div>
        {tableNumber && <div>Tisch: {tableNumber}</div>}
      </div>
      
      <div className="kitchen-order-info">
        <div><strong>Bestellzeit:</strong> {formatTime(orderTime)}</div>
        <div><strong>Druckzeit:</strong> {new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
      
      <div className="kitchen-items">
        {items.map((item, index) => (
          <div key={index} className="kitchen-item">
            <div className="kitchen-item-quantity">
              {item.quantity}x
            </div>
            <div className="kitchen-item-name">
              {item.productName}
            </div>
            {item.description && (
              <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                {item.description}
              </div>
            )}
            {item.extras && item.extras.length > 0 && (
              <div className="kitchen-item-extras">
                {item.extras.map((extra, extraIndex) => (
                  <div key={extraIndex}>
                    + {extra.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {notes && (
        <div className="kitchen-notes">
          <div><strong>Hinweise:</strong></div>
          <div>{notes}</div>
        </div>
      )}
    </div>
  );
}
