// Input Sanitization Utility
export interface SanitizedInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

// E-Mail-Validierung und Normalisierung
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('E-Mail ist erforderlich');
  }
  
  // Whitespace entfernen und zu Kleinbuchstaben
  const cleaned = email.trim().toLowerCase();
  
  // E-Mail-Format validieren
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Ungültiges E-Mail-Format');
  }
  
  // Länge prüfen
  if (cleaned.length > 254) {
    throw new Error('E-Mail-Adresse ist zu lang');
  }
  
  return cleaned;
}

// Namen sanitizen
export function sanitizeName(name: string, fieldName: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error(`${fieldName} ist erforderlich`);
  }
  
  // Whitespace entfernen
  const cleaned = name.trim();
  
  // Länge prüfen
  if (cleaned.length < 1 || cleaned.length > 50) {
    throw new Error(`${fieldName} muss zwischen 1 und 50 Zeichen lang sein`);
  }
  
  // Nur Buchstaben, Bindestriche und Leerzeichen erlauben
  const nameRegex = /^[a-zA-ZäöüÄÖÜß\s\-']+$/;
  if (!nameRegex.test(cleaned)) {
    throw new Error(`${fieldName} enthält ungültige Zeichen`);
  }
  
  return cleaned;
}

// Telefonnummer sanitizen
export function sanitizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  
  if (typeof phone !== 'string') {
    throw new Error('Ungültiges Telefonnummer-Format');
  }
  
  // Alle Nicht-Ziffern und + entfernen
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Länge prüfen
  if (cleaned.length < 6 || cleaned.length > 20) {
    throw new Error('Telefonnummer muss zwischen 6 und 20 Ziffern lang sein');
  }
  
  return cleaned;
}

// Adresse sanitizen
export function sanitizeAddress(address?: string): string | undefined {
  if (!address) return undefined;
  
  if (typeof address !== 'string') {
    throw new Error('Ungültiges Adress-Format');
  }
  
  const cleaned = address.trim();
  
  if (cleaned.length > 200) {
    throw new Error('Adresse ist zu lang (max. 200 Zeichen)');
  }
  
  // Gefährliche Zeichen entfernen
  const sanitized = cleaned.replace(/[<>\"'&]/g, '');
  
  return sanitized;
}

// Stadt sanitizen
export function sanitizeCity(city?: string): string | undefined {
  if (!city) return undefined;
  
  if (typeof city !== 'string') {
    throw new Error('Ungültiges Stadt-Format');
  }
  
  const cleaned = city.trim();
  
  if (cleaned.length > 100) {
    throw new Error('Stadt ist zu lang (max. 100 Zeichen)');
  }
  
  // Nur Buchstaben, Bindestriche und Leerzeichen
  const cityRegex = /^[a-zA-ZäöüÄÖÜß\s\-']+$/;
  if (!cityRegex.test(cleaned)) {
    throw new Error('Stadt enthält ungültige Zeichen');
  }
  
  return cleaned;
}

// Postleitzahl sanitizen
export function sanitizePostalCode(postalCode?: string): string | undefined {
  if (!postalCode) return undefined;
  
  if (typeof postalCode !== 'string') {
    throw new Error('Ungültiges Postleitzahl-Format');
  }
  
  const cleaned = postalCode.trim();
  
  // Österreichische PLZ: 4 Ziffern
  const postalRegex = /^\d{4}$/;
  if (!postalRegex.test(cleaned)) {
    throw new Error('Postleitzahl muss 4 Ziffern haben');
  }
  
  return cleaned;
}

// Alle Eingaben sanitizen
export function sanitizeUserInput(input: any): SanitizedInput {
  return {
    email: sanitizeEmail(input.email),
    firstName: sanitizeName(input.firstName, 'Vorname'),
    lastName: sanitizeName(input.lastName, 'Nachname'),
    phone: sanitizePhone(input.phone),
    address: sanitizeAddress(input.address),
    city: sanitizeCity(input.city),
    postalCode: sanitizePostalCode(input.postalCode)
  };
}
