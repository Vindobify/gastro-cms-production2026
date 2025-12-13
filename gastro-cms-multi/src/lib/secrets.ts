// Sichere Secrets-Verwaltung
import crypto from 'crypto';

export interface SecretConfig {
  jwtSecret: string;
  nextAuthSecret: string;
  csrfSecret: string;
  dbPassword: string;
  dbRootPassword: string;
}

// Validierung der Secret-Länge und -Stärke
export function validateSecret(secret: string, minLength: number = 32, name: string): void {
  if (!secret) {
    throw new Error(`${name} ist erforderlich`);
  }
  
  if (secret.length < minLength) {
    throw new Error(`${name} muss mindestens ${minLength} Zeichen lang sein`);
  }
  
  // Prüfe auf schwache/unsichere Secrets
  const weakPatterns = [
    /^[a-z]+$/i, // Nur Buchstaben
    /^[0-9]+$/, // Nur Zahlen
    /password/i, // Enthält "password"
    /secret/i, // Enthält "secret"
    /admin/i, // Enthält "admin"
    /123456/, // Sequenzielle Zahlen
    /qwerty/i, // QWERTY-Muster
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(secret)) {
      throw new Error(`${name} ist zu schwach und enthält unsichere Muster`);
    }
  }
}

// Sichere Secret-Generierung
export function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64');
}

// Secrets aus Umgebungsvariablen laden und validieren
export function loadSecrets(): SecretConfig {
  const jwtSecret = process.env.JWT_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const csrfSecret = process.env.CSRF_SECRET;
  const dbPassword = process.env.DB_PASSWORD;
  const dbRootPassword = process.env.DB_ROOT_PASSWORD;

  // Validiere alle Secrets
  validateSecret(jwtSecret!, 64, 'JWT_SECRET');
  validateSecret(nextAuthSecret!, 64, 'NEXTAUTH_SECRET');
  validateSecret(csrfSecret!, 32, 'CSRF_SECRET');
  validateSecret(dbPassword!, 32, 'DB_PASSWORD');
  validateSecret(dbRootPassword!, 64, 'DB_ROOT_PASSWORD');

  return {
    jwtSecret: jwtSecret!,
    nextAuthSecret: nextAuthSecret!,
    csrfSecret: csrfSecret!,
    dbPassword: dbPassword!,
    dbRootPassword: dbRootPassword!
  };
}

// Secrets für Development generieren (nur für lokale Entwicklung)
export function generateDevelopmentSecrets(): SecretConfig {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development-Secrets dürfen nicht in Production verwendet werden');
  }

  return {
    jwtSecret: generateSecureSecret(64),
    nextAuthSecret: generateSecureSecret(64),
    csrfSecret: generateSecureSecret(32),
    dbPassword: generateSecureSecret(32),
    dbRootPassword: generateSecureSecret(64)
  };
}

// Secret-Rotation (für zukünftige Implementierung)
export function rotateSecret(currentSecret: string, newSecret: string): boolean {
  // Hier könnte eine Secret-Rotation-Logik implementiert werden
  // z.B. beide Secrets für eine Übergangszeit akzeptieren
  return newSecret.length >= 32;
}

// Secrets-Hashing für sichere Speicherung
export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

// Secret-Stärke bewerten
export function evaluateSecretStrength(secret: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Länge
  if (secret.length >= 64) {
    score += 3;
  } else if (secret.length >= 32) {
    score += 2;
  } else if (secret.length >= 16) {
    score += 1;
  } else {
    feedback.push('Secret ist zu kurz (mindestens 16 Zeichen empfohlen)');
  }

  // Zeichenvielfalt
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecial = /[^a-zA-Z0-9]/.test(secret);

  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumbers) score += 1;
  if (hasSpecial) score += 1;

  if (!hasLower) feedback.push('Kleinbuchstaben hinzufügen');
  if (!hasUpper) feedback.push('Großbuchstaben hinzufügen');
  if (!hasNumbers) feedback.push('Zahlen hinzufügen');
  if (!hasSpecial) feedback.push('Sonderzeichen hinzufügen');

  // Entropie
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < secret.length * 0.5) {
    feedback.push('Secret enthält zu viele wiederholende Zeichen');
    score -= 1;
  }

  return { score, feedback };
}
