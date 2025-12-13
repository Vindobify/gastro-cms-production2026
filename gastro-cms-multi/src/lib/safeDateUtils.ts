/**
 * Sichere Datums-Utilities um RangeError: Invalid time value zu vermeiden
 */

export function safeToISOString(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  // Prüfe auf leeres Objekt oder ungültige Objekte
  if (typeof date === 'object' && date !== null) {
    if (Object.keys(date).length === 0) {
      // Leeres Objekt - nicht loggen, da es häufig vorkommt
      return '';
    }
    if (!(date instanceof Date)) {
      // Nicht-Date Objekt - nicht loggen, da es häufig vorkommt
      return '';
    }
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Invalid Date - nicht loggen, da es häufig vorkommt
      return '';
    }
    return dateObj.toISOString();
  } catch (error) {
    // Fehler - nicht loggen, da es häufig vorkommt
    return '';
  }
}

export function safeToLocaleString(
  date: Date | string | null | undefined, 
  locale: string = 'de-DE',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'Nicht angegeben';
  
  // Prüfe auf leeres Objekt oder ungültige Objekte
  if (typeof date === 'object' && date !== null) {
    if (Object.keys(date).length === 0) {
      // Leeres Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    if (!(date instanceof Date)) {
      // Nicht-Date Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Invalid Date - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    return dateObj.toLocaleString(locale, options);
  } catch (error) {
    // Fehler - nicht loggen, da es häufig vorkommt
    return 'Nicht angegeben';
  }
}

export function safeToLocaleDateString(
  date: Date | string | null | undefined, 
  locale: string = 'de-DE',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'Nicht angegeben';
  
  // Prüfe auf leeres Objekt oder ungültige Objekte
  if (typeof date === 'object' && date !== null) {
    if (Object.keys(date).length === 0) {
      // Leeres Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    if (!(date instanceof Date)) {
      // Nicht-Date Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Invalid Date - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    // Fehler - nicht loggen, da es häufig vorkommt
    return 'Nicht angegeben';
  }
}

export function safeToLocaleTimeString(
  date: Date | string | null | undefined, 
  locale: string = 'de-DE',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'Nicht angegeben';
  
  // Prüfe auf leeres Objekt oder ungültige Objekte
  if (typeof date === 'object' && date !== null) {
    if (Object.keys(date).length === 0) {
      // Leeres Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    if (!(date instanceof Date)) {
      // Nicht-Date Objekt - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Invalid Date - nicht loggen, da es häufig vorkommt
      return 'Nicht angegeben';
    }
    return dateObj.toLocaleTimeString(locale, options);
  } catch (error) {
    // Fehler - nicht loggen, da es häufig vorkommt
    return 'Nicht angegeben';
  }
}

export function safeGetTime(date: Date | string | null | undefined): number {
  if (!date) return 0;
  
  // Prüfe auf leeres Objekt oder ungültige Objekte
  if (typeof date === 'object' && date !== null) {
    if (Object.keys(date).length === 0) {
      // Leeres Objekt - nicht loggen, da es häufig vorkommt
      return 0;
    }
    if (!(date instanceof Date)) {
      // Nicht-Date Objekt - nicht loggen, da es häufig vorkommt
      return 0;
    }
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Invalid Date - nicht loggen, da es häufig vorkommt
      return 0;
    }
    return dateObj.getTime();
  } catch (error) {
    // Fehler - nicht loggen, da es häufig vorkommt
    return 0;
  }
}
