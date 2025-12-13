# Docker Container Status

## ✅ Alle Container laufen erfolgreich!

### Container-Übersicht

| Container | Status | Ports | Beschreibung |
|-----------|--------|-------|--------------|
| **db** | ✅ Running | 5433:5432 | PostgreSQL Datenbank |
| **root** | ✅ Running | 3000/tcp | Gastro CMS Root (Landing Page) |
| **multi** | ✅ Running | 3000/tcp | Gastro CMS Multi (Restaurant CMS) |
| **crm** | ✅ Running | 3000/tcp | Gastro CRM (Admin Dashboard) |
| **proxy** | ✅ Running | 80:80 | Nginx Reverse Proxy |

### Zugriff auf die Websites

Die Websites sind über den Nginx-Proxy erreichbar:

1. **Root (Landing Page):**
   - `http://gastro-cms.local`
   - `http://www.gastro-cms.local`
   - `http://gastro-cms.at`

2. **CRM (Admin Dashboard):**
   - `http://crm.gastro-cms.local`

3. **Multi (Restaurant CMS):**
   - `http://pizzeria1140.local`
   - Alle anderen Hosts (Fallback)

### Datenbank

- **Host:** localhost:5433 (extern) oder db:5432 (intern)
- **Datenbank:** gastro_cms_multi
- **Benutzer:** gR#0@r3d@LDdihna
- **Status:** ✅ Neu initialisiert mit starken Credentials

### Wichtige Hinweise

1. **Hosts-Datei:** Stelle sicher, dass die Domains in deiner `/etc/hosts` (Linux/Mac) oder `C:\Windows\System32\drivers\etc\hosts` (Windows) eingetragen sind:
   ```
   127.0.0.1 gastro-cms.local
   127.0.0.1 www.gastro-cms.local
   127.0.0.1 crm.gastro-cms.local
   127.0.0.1 pizzeria1140.local
   ```

2. **Datenbank-Migrationen:** Die Datenbank wurde neu initialisiert. Du musst möglicherweise die Prisma-Migrationen ausführen:
   ```bash
   # Für Multi
   docker-compose -f docker-compose.local.yml exec multi npx prisma db push
   
   # Für CRM
   docker-compose -f docker-compose.local.yml exec crm npx prisma db push
   
   # Für Root
   docker-compose -f docker-compose.local.yml exec root npx prisma db push
   ```

3. **Logs anzeigen:**
   ```bash
   docker-compose -f docker-compose.local.yml logs -f [service-name]
   ```

4. **Container neu starten:**
   ```bash
   docker-compose -f docker-compose.local.yml restart [service-name]
   ```

### Nächste Schritte

1. ✅ Alle Container laufen
2. ⏳ Datenbank-Migrationen ausführen (falls nötig)
3. ⏳ Websites im Browser testen
4. ⏳ Kontaktformular testen (sollte jetzt in DB speichern)

