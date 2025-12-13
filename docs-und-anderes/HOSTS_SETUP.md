# Lokale Hosts-Einträge (Windows)

Füge in `C:\Windows\System32\drivers\etc\hosts` hinzu:
```
127.0.0.1 landingpage.local
127.0.0.1 crm.restaurant-lieferservice.localhost
127.0.0.1 pizzeria1140.local
```

Falls weitere Restaurant-Domains getestet werden sollen, trage sie ebenfalls auf 127.0.0.1 ein.

# Start mit Docker-Compose
```
docker-compose -f docker-compose.local.yml up -d --build
```

Services/Hosts:
- Landing: http://landingpage.local
- CRM: http://crm.restaurant-lieferservice.localhost
- Multi (Beispielrestaurant): http://pizzeria1140.local

DB läuft als Postgres im Compose (`db`).

