import React from 'react';

interface CustomerInfoProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function CustomerInfo({
  name,
  email,
  phone,
  address
}: CustomerInfoProps) {
  return (
    <div className="customer-info">
      <div className="customer-title">Kundendaten</div>
      
      <div className="customer-details">
        <div><strong>Name:</strong> {name}</div>
        {email && <div><strong>E-Mail:</strong> {email}</div>}
        {phone && <div><strong>Telefon:</strong> {phone}</div>}
        {address && <div><strong>Adresse:</strong> {address}</div>}
      </div>
    </div>
  );
}
