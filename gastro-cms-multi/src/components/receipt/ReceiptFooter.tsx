import React from 'react';

interface ReceiptFooterProps {
  printTime?: string;
  restaurantFooter?: string;
}

export default function ReceiptFooter({
  printTime,
  restaurantFooter
}: ReceiptFooterProps) {
  const formatPrintTime = (timeString?: string) => {
    if (!timeString) {
      return new Date().toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    const date = new Date(timeString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="receipt-footer">
      <div className="thank-you">
        Vielen Dank für Ihre Bestellung!
      </div>
      
      <div className="print-info">
        Bon gedruckt am {formatPrintTime(printTime)}
      </div>
      
      {restaurantFooter && (
        <div className="restaurant-footer">
          {restaurantFooter}
        </div>
      )}
    </div>
  );
}
