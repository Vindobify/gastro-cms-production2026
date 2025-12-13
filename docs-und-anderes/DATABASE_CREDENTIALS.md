# Datenbank-Credentials

## WICHTIG: Diese Datei enthält sensible Informationen!

**Diese Datei sollte NICHT in Git committed werden!**

## Generierte starke Credentials

### Haupt-Datenbank (gastro_cms_multi)
- **Benutzername:** `gR#0@r3d@LDdihna`
- **Passwort:** `v2EqGEioll3eT!YK@dy5n0KbNdHtLRPZ`
- **Datenbank:** `gastro_cms_multi`

### Root-Datenbank (gastrocms)
- **Benutzername:** `gR#0@r3d@LDdihna`
- **Passwort:** `v2EqGEioll3eT!YK@dy5n0KbNdHtLRPZ`
- **Datenbank:** `gastrocms`

## URL-Encoding für DATABASE_URL

Die Sonderzeichen müssen URL-encoded werden:
- `#` → `%23`
- `@` → `%40`
- `!` → `%21`

**Beispiel DATABASE_URL:**
```
postgresql://gR%230%40r3d%40LDdihna:v2EqGEioll3eT%21YK%40dy5n0KbNdHtLRPZ@db:5432/gastro_cms_multi?schema=public
```

## Aktualisierte Dateien

1. `docker-compose.local.yml` - Lokale Entwicklung
2. `gastro-cms-root/docker-compose.yml` - Root App
3. `gastro-cms-multi/docker-compose.yml` - Multi App
4. `gastro-crm/Dockerfile` - CRM Dockerfile

## Sicherheitshinweise

- Diese Credentials sind für lokale Entwicklung und Produktion
- In Produktion sollten diese über Umgebungsvariablen gesetzt werden
- Niemals diese Credentials in Git committen
- Regelmäßig rotieren (alle 90 Tage empfohlen)

