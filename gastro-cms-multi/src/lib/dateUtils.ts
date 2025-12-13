/**
 * Hilfsfunktionen für sichere Datumsbehandlung
 */

export function safeFormatDeliveryTime(deliveryTime: string | null | undefined): string {
  if (!deliveryTime) {
    return 'Nicht angegeben';
  }

  try {
    const date = new Date(deliveryTime);
    if (isNaN(date.getTime())) {
      console.warn('Invalid delivery time:', deliveryTime);
      return 'Ungültiges Datum';
    }
    return date.toLocaleString('de-DE');
  } catch (error) {
    console.warn('Error formatting delivery time:', deliveryTime, error);
    return 'Ungültiges Datum';
  }
}

export function safeFormatDeliveryTimeDetailed(deliveryTime: string | null | undefined): string {
  if (!deliveryTime) {
    return 'Nicht angegeben';
  }

  try {
    const date = new Date(deliveryTime);
    if (isNaN(date.getTime())) {
      console.warn('Invalid delivery time:', deliveryTime);
      return 'Ungültiges Datum';
    }
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Uhr';
  } catch (error) {
    console.warn('Error formatting delivery time:', deliveryTime, error);
    return 'Ungültiges Datum';
  }
}

export function safeFormatDateTimeLocal(deliveryTime: string | null | undefined): string {
  if (!deliveryTime) {
    return '';
  }

  try {
    const date = new Date(deliveryTime);
    if (isNaN(date.getTime())) {
      console.warn('Invalid delivery time:', deliveryTime);
      return '';
    }
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.warn('Error formatting delivery time for datetime-local:', deliveryTime, error);
    return '';
  }
}
