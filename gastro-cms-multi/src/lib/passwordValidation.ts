// Starke Passwort-Validierung
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Mindestlänge
  if (password.length < 12) {
    errors.push('Passwort muss mindestens 12 Zeichen lang sein');
  } else {
    score += 1;
  }

  // Großbuchstaben
  if (!/[A-Z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
  } else {
    score += 1;
  }

  // Kleinbuchstaben
  if (!/[a-z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
  } else {
    score += 1;
  }

  // Zahlen
  if (!/\d/.test(password)) {
    errors.push('Passwort muss mindestens eine Zahl enthalten');
  } else {
    score += 1;
  }

  // Sonderzeichen
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
  } else {
    score += 1;
  }

  // Keine häufigen Muster
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /(.)\1{2,}/ // Wiederholende Zeichen
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Passwort enthält häufige Muster und ist unsicher');
      score -= 1;
      break;
    }
  }

  // Stärke bestimmen
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    strength
  };
}

export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Mindestens ein Zeichen aus jeder Kategorie
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Rest zufällig füllen
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Zeichen mischen
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
