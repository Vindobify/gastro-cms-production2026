import React from 'react';

interface DeliveryInfoProps {
  deliveryType: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  notes?: string;
}

export default function DeliveryInfo({
  deliveryType,
  deliveryTime,
  deliveryAddress,
  notes
}: DeliveryInfoProps) {
  const formatDeliveryTime = (timeString?: string) => {
    if (!timeString) return null;
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="delivery-info">
      <div className="delivery-title">Lieferung</div>
      
      <div className="delivery-details">
        <div>
          <strong>Art:</strong> {deliveryType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}
        </div>
        
        {deliveryTime && (
          <div>
            <strong>Gewünschte Zeit:</strong> {formatDeliveryTime(deliveryTime)}
          </div>
        )}
        
        {deliveryAddress && (
          <div>
            <strong>Lieferadresse:</strong> {deliveryAddress}
          </div>
        )}
        
        {notes && (
          <div>
            <strong>Hinweise:</strong> {notes}
          </div>
        )}
      </div>
    </div>
  );
}
