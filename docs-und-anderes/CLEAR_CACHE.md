# Docker Cache löschen - Anleitung

## Übersicht: Wo kann man Docker-Caches löschen?

### 1. **Container Cache** (sanft)
```powershell
# Container stoppen und entfernen (ohne Volumes)
docker-compose -f docker-compose.local.yml down
```

### 2. **Build Cache** (empfohlen bei Code-Änderungen)
```powershell
# Docker Build Cache löschen
docker builder prune -f

# Oder beim Build Cache überspringen
docker-compose -f docker-compose.local.yml build --no-cache crm
```

### 3. **Image Cache** (wenn Images neu gebaut werden sollen)
```powershell
# Alle Images entfernen
docker-compose -f docker-compose.local.yml down --rmi all

# Oder nur unbenutzte Images
docker image prune -f
```

### 4. **Volume Cache** (⚠️ VORSICHT: Kann Daten löschen!)
```powershell
# Nur unbenutzte Volumes (sicher)
docker volume prune -f

# Spezifisches Volume löschen (ACHTUNG: Datenbank-Daten!)
docker-compose -f docker-compose.local.yml down -v
```

### 5. **System-weite Bereinigung** (radikal - entfernt ALLES unbenutzte)
```powershell
# Alles auf einmal: Images, Container, Volumes, Netzwerke, Build-Cache
docker system prune -a --volumes -f
```

### 6. **Next.js Build Cache** (lokal in den Projekten)
```powershell
# In jedem Projekt-Verzeichnis:
cd gastro-crm
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

cd ../gastro-cms-multi
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

cd ../restaurant-lieferservice-page
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
```

### 7. **Prisma Client Cache**
```powershell
# Prisma Client neu generieren in jedem Projekt
cd gastro-crm
npx prisma generate

cd ../gastro-cms-multi
npx prisma generate

cd ../restaurant-lieferservice-page
npx prisma generate
```

## Empfohlene Reihenfolge bei Problemen:

### **Sanfte Methode** (behält Daten):
1. Container stoppen: `docker-compose -f docker-compose.local.yml down`
2. Build Cache löschen: `docker builder prune -f`
3. Mit `--no-cache` neu bauen: `docker-compose -f docker-compose.local.yml build --no-cache`
4. Container starten: `docker-compose -f docker-compose.local.yml up -d`

### **Mittlere Methode** (behält Datenbank):
1. Container stoppen: `docker-compose -f docker-compose.local.yml down`
2. Images entfernen: `docker-compose -f docker-compose.local.yml down --rmi all`
3. Build Cache löschen: `docker builder prune -f`
4. Neu bauen: `docker-compose -f docker-compose.local.yml build --no-cache`
5. Container starten: `docker-compose -f docker-compose.local.yml up -d`

### **Radikale Methode** (⚠️ LÖSCHT ALLES inkl. Datenbank!):
1. Alles stoppen: `docker-compose -f docker-compose.local.yml down -v`
2. System bereinigen: `docker system prune -a --volumes -f`
3. Neu bauen: `docker-compose -f docker-compose.local.yml build --no-cache`
4. Container starten: `docker-compose -f docker-compose.local.yml up -d`

## Automatisches Skript verwenden:

```powershell
# Führe das Skript aus:
.\clear-docker-cache.ps1
```

Das Skript führt dich interaktiv durch alle Optionen.

