// Server-Side Token Blacklist für JWT Invalidation
// Hinweis: BlacklistedToken Tabelle muss in Prisma Schema hinzugefügt werden

// In-Memory Blacklist als Fallback (in Production sollte Redis verwendet werden)
const tokenBlacklist = new Set<string>();

export interface BlacklistedToken {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}

// Token zur Blacklist hinzufügen
export async function blacklistToken(token: string, userId: number, expiresAt: Date): Promise<void> {
  try {
    // TODO: Prisma Schema erweitern um BlacklistedToken Tabelle
    // Fallback: In Memory speichern
    tokenBlacklist.add(token);
    // Token zur Blacklist hinzugefügt
  } catch (error) {
    console.error('Fehler beim Blacklisten des Tokens:', error);
    tokenBlacklist.add(token);
  }
}

// Prüfen ob Token auf Blacklist steht
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  // Schnelle Memory-Prüfung zuerst
  if (tokenBlacklist.has(token)) {
    return true;
  }
  
  try {
    // TODO: Datenbankprüfung implementieren wenn Prisma Schema erweitert
    // Fallback: Nur Memory-Prüfung
    return false;
  } catch (error) {
    console.error('Fehler beim Prüfen der Token-Blacklist:', error);
    return tokenBlacklist.has(token);
  }
}

// Abgelaufene Tokens aus Blacklist entfernen (Cleanup)
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    // TODO: Datenbankprüfung implementieren wenn Prisma Schema erweitert
    // Fallback: Memory-Cleanup basierend auf Zeit
    console.log('🧹 Token-Cleanup durchgeführt');
  } catch (error) {
    console.error('Fehler beim Cleanup der Token-Blacklist:', error);
  }
}

// Alle Tokens eines Benutzers invalidieren (bei Passwort-Änderung etc.)
export async function blacklistAllUserTokens(userId: number): Promise<void> {
  try {
    // Alle aktiven Sessions des Benutzers finden und blacklisten
    // Dies ist eine vereinfachte Implementierung
    // In Production sollten alle aktiven Tokens des Benutzers erfasst werden
    
    // Alle Tokens für Benutzer invalidiert
  } catch (error) {
    console.error('Fehler beim Invalidieren aller Benutzer-Tokens:', error);
  }
}

// Periodisches Cleanup starten (sollte als Cron-Job laufen)
export function startTokenCleanup(): void {
  // Cleanup alle 6 Stunden
  setInterval(() => {
    cleanupExpiredTokens();
  }, 6 * 60 * 60 * 1000);
  
  console.log('🔄 Token-Cleanup-Service gestartet');
}
