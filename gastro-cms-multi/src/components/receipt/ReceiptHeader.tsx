import React from 'react';

interface ReceiptHeaderProps {
  restaurantName: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  uid?: string;
}

export default function ReceiptHeader({
  restaurantName,
  address,
  phone,
  email,
  taxNumber,
  uid
}: ReceiptHeaderProps) {
  return (
    <div className="receipt-header">
      <div className="restaurant-name">
        {restaurantName}
      </div>
      
      {address && (
        <div className="restaurant-info">
          {address}
        </div>
      )}
      
      <div className="restaurant-contact">
        {phone && <div>Tel: {phone}</div>}
        {email && <div>E-Mail: {email}</div>}
        {taxNumber && <div>USt-IdNr: {taxNumber}</div>}
        {uid && <div>UID: {uid}</div>}
      </div>
    </div>
  );
}
