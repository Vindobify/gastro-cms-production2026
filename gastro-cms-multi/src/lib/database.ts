import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Verwende DATABASE_URL aus Environment oder Fallback für lokale Entwicklung
const databaseUrl = process.env.gastro_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'

console.log('🔗 Datenbankverbindung:', {
  nodeEnv: process.env.NODE_ENV,
  provider: (process.env.gastro_DATABASE_URL || process.env.DATABASE_URL) ? 'postgresql' : 'sqlite',
  databaseUrl: (process.env.gastro_DATABASE_URL || process.env.DATABASE_URL) ? 'postgresql://***' : 'file:./dev.db'
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Hilfsfunktion für korrekte Steuerberechnung
export function calculateTaxFromInclusivePrice(priceInclusive: number, taxRate: number): {
  priceExclusive: number;
  taxAmount: number;
  priceInclusive: number;
} {
  // Alle Preise sind inkl. MwSt.
  // taxRate ist als Dezimalzahl (0.10 für 10%, 0.20 für 20%)
  
  if (taxRate <= 0) {
    return {
      priceExclusive: priceInclusive,
      taxAmount: 0,
      priceInclusive: priceInclusive
    };
  }
  
  // Berechne Preis exkl. MwSt. aus inkl. MwSt.
  const priceExclusive = priceInclusive / (1 + taxRate);
  const taxAmount = priceInclusive - priceExclusive;
  
  return {
    priceExclusive: Math.round(priceExclusive * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    priceInclusive: priceInclusive
  };
}

// Hilfsfunktion für Steuerberechnung bei Bestellungen
export function calculateOrderTaxes(orderItems: any[], taxRates: any[]): {
  subtotalExclusive: number;
  totalTax: number;
  totalInclusive: number;
  taxBreakdown: Array<{
    rate: number;
    amount: number;
    label: string;
  }>;
} {
  let subtotalExclusive = 0;
  let totalTax = 0;
  const taxBreakdown: Array<{rate: number, amount: number, label: string}> = [];
  
  // Gruppiere Steuersätze nach Rate
  const taxRateGroups: {[key: number]: any} = {};
  taxRates.forEach(tax => {
    const rate = parseFloat(tax.rate.toString());
    if (rate > 0) {
      taxRateGroups[rate] = tax;
    }
  });
  
  // Berechne Steuern für jedes Produkt
  orderItems.forEach((item: any) => {
    const itemPrice = parseFloat(item.totalPrice.toString());
    const itemQuantity = parseInt(item.quantity.toString());
    const totalItemPrice = itemPrice * itemQuantity;
    
    // Bestimme den Steuersatz für das Produkt
    let applicableTaxRate = 0.20; // Standard 20%
    
    // Hier könntest du die Steuerklasse des Produkts prüfen
    // Für jetzt verwenden wir den Standard
    
    // Berechne Steuer für dieses Produkt
    const itemTaxCalculation = calculateTaxFromInclusivePrice(totalItemPrice, applicableTaxRate);
    
    subtotalExclusive += itemTaxCalculation.priceExclusive;
    totalTax += itemTaxCalculation.taxAmount;
    
    // Füge zur Steueraufschlüsselung hinzu
    const existingTaxBreakdown = taxBreakdown.find(tb => tb.rate === applicableTaxRate);
    if (existingTaxBreakdown) {
      existingTaxBreakdown.amount += itemTaxCalculation.taxAmount;
    } else {
      const taxLabel = applicableTaxRate === 0.10 ? 'MwSt. 10% (Speisen)' : 'MwSt. 20% (Getränke)';
      taxBreakdown.push({
        rate: applicableTaxRate,
        amount: itemTaxCalculation.taxAmount,
        label: taxLabel
      });
    }
  });
  
  return {
    subtotalExclusive: Math.round(subtotalExclusive * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalInclusive: subtotalExclusive + totalTax,
    taxBreakdown: taxBreakdown.sort((a, b) => b.rate - a.rate) // Höhere Steuersätze zuerst
  };
}
