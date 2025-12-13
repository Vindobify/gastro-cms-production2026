import React from 'react';

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

interface OrderItemsProps {
  items: OrderItem[];
}

export default function OrderItems({ items }: OrderItemsProps) {
  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  const formatTaxRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="items-section">
      <div className="items-title">Bestellte Artikel</div>
      
      {items.map((item, index) => (
        <div key={index} className="item">
          <div className="item-name">
            {item.productName}
          </div>
          
          {item.description && (
            <div className="item-details">
              {item.description}
            </div>
          )}
          
          <div className="item-quantity">
            Menge: {item.quantity} × {formatPrice(item.unitPrice)}
          </div>
          
          {item.extras && item.extras.length > 0 && (
            <div className="item-extras">
              {item.extras.map((extra, extraIndex) => (
                <div key={extraIndex}>
                  + {extra.name} {formatPrice(extra.price)}
                </div>
              ))}
            </div>
          )}
          
          <div className="item-price">
            {formatPrice(item.totalPrice)}
          </div>
        </div>
      ))}
    </div>
  );
}
