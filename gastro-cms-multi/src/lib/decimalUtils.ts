/**
 * 🧮 Decimal Utilities für PostgreSQL
 * Konvertiert Decimal-Werte zu number für Frontend-Kompatibilität
 */

// Hilfsfunktion um Decimal-Werte in number zu konvertieren
export function convertDecimalToNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  if (value && typeof value.toString === 'function') return parseFloat(value.toString());
  return null;
}

// Hilfsfunktion um ein Objekt rekursiv zu normalisieren
export function normalizeDecimalFields(obj: any, decimalFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeDecimalFields(item, decimalFields));
  }
  
  const normalized = { ...obj };
  
  for (const field of decimalFields) {
    if (normalized[field] !== undefined) {
      normalized[field] = convertDecimalToNumber(normalized[field]);
    }
  }
  
  // Konvertiere Datumsfelder zu ISO-Strings
  const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt', 'lastLoginAt'];
  for (const field of dateFields) {
    if (normalized[field] !== undefined && normalized[field] !== null) {
      if (normalized[field] instanceof Date) {
        normalized[field] = normalized[field].toISOString();
      } else if (typeof normalized[field] === 'string' && normalized[field] !== '') {
        // Versuche das Datum zu parsen und zu konvertieren
        try {
          const date = new Date(normalized[field]);
          if (!isNaN(date.getTime())) {
            normalized[field] = date.toISOString();
          }
        } catch (e) {
          // Behalte den ursprünglichen Wert bei
        }
      }
    }
  }
  
  // Rekursiv für verschachtelte Objekte
  for (const key in normalized) {
    if (normalized[key] && typeof normalized[key] === 'object') {
      normalized[key] = normalizeDecimalFields(normalized[key], decimalFields);
    }
  }
  
  return normalized;
}

// Standard Decimal-Felder für verschiedene Modelle
export const DECIMAL_FIELDS = {
  PRODUCT: ['price', 'taxRate'] as string[],
  ORDER: ['totalAmount', 'totalAmountNet', 'totalTax', 'tipAmount', 'tipPercentage'] as string[],
  ORDER_ITEM: ['unitPrice', 'totalPrice'] as string[],
  COUPON: ['discountValue', 'minimumOrderAmount', 'maximumDiscount'] as string[],
  RESTAURANT_SETTINGS: ['minOrderAmount', 'deliveryFee', 'freeDeliveryThreshold', 'defaultTaxRate'] as string[],
  EXTRA_ITEM: ['price'] as string[]
};
