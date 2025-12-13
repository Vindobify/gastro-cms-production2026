# 🍕 Gastro CMS 3.0 - Lieferservice Management System

## 🚀 **Status: PRODUCTION READY**

Ein vollständiges Backend-System für Lieferservice-Management mit Next.js 15, TypeScript und SQLite.

---

## ✨ **Features**

### **🔐 Authentifizierung**
- JWT-basierte Authentifizierung
- Bearer Token System
- Sichere API-Endpoints

### **📊 Dashboard & Statistiken**
- Vollständige KPIs und Metriken
- Lead-, Order- und Customer-Statistiken
- Revenue-Berechnungen

### **🗄️ Datenbank-Management**
- SQLite-Datenbank mit allen Tabellen
- CRUD-Operationen für alle Entitäten
- Vollständige API-Abdeckung

### **🔧 Technische Features**
- TypeScript (vollständig typisiert)
- RESTful API-Design
- Konsistente Error-Behandlung
- Input-Validierung

---

## 📋 **API-Endpoints**

### **Authentifizierung**
- `POST /api/auth/login` - Benutzer-Login
- `POST /api/auth/logout` - Benutzer-Logout
- `GET /api/auth/verify` - Token-Verifizierung

### **Dashboard**
- `GET /api/dashboard/stats` - Dashboard-Statistiken

### **Leads Management**
- `GET /api/leads` - Alle Leads abrufen
- `POST /api/leads` - Neuen Lead erstellen
- `GET /api/leads/[id]` - Lead abrufen
- `PUT /api/leads/[id]` - Lead aktualisieren
- `DELETE /api/leads/[id]` - Lead löschen

### **Orders Management**
- `GET /api/orders` - Alle Orders abrufen
- `POST /api/orders` - Neuen Order erstellen
- `GET /api/orders/[id]` - Order abrufen
- `PUT /api/orders/[id]` - Order aktualisieren
- `DELETE /api/orders/[id]` - Order löschen

### **Customers Management**
- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunden erstellen
- `GET /api/customers/[id]` - Kunde abrufen
- `PUT /api/customers/[id]` - Kunde aktualisieren
- `DELETE /api/customers/[id]` - Kunde löschen

### **Todos Management**
- `GET /api/todos` - Alle Todos abrufen
- `POST /api/todos` - Neues Todo erstellen
- `GET /api/todos/[customerId]` - Todos für Kunde
- `POST /api/todos/[customerId]` - Todo für Kunde erstellen
- `PUT /api/todos/toggle/[todoId]` - Todo Status umschalten
- `PUT /api/todos/update/[todoId]` - Todo aktualisieren
- `DELETE /api/todos/[id]` - Todo löschen
- `POST /api/todos/default` - Standard-Todos erstellen

### **Invoices Management**
- `GET /api/invoices` - Alle Rechnungen abrufen
- `POST /api/invoices` - Neue Rechnung erstellen
- `GET /api/invoices/[id]` - Rechnung abrufen
- `PUT /api/invoices/[id]` - Rechnung aktualisieren
- `DELETE /api/invoices/[id]` - Rechnung löschen

### **Settings Management**
- `GET /api/settings` - Einstellungen abrufen
- `PUT /api/settings` - Einstellungen aktualisieren
- `POST /api/settings` - Einstellungen zurücksetzen

### **PDF Generation**
- `POST /api/generate-order-book` - Auftragsbuch PDF generieren
- `POST /api/generate-invoice/[id]` - Rechnung PDF generieren

---

## 🚀 **Schnellstart**

### **1. Installation**
```bash
# Repository klonen
git clone <repository-url>
cd gastro-cms-root

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### **2. API verwenden**
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "office@gastro-cms.at", "password": "ComPaq1987!"}'

# 2. API verwenden
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

### **3. Frontend anzeigen**
```bash
# Browser öffnen
open http://localhost:3000
```

---

## 📚 **Dokumentation**

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Vollständige API-Referenz
- **[API_METHODS_OVERVIEW.md](./API_METHODS_OVERVIEW.md)** - Übersicht aller HTTP-Methoden
- **[PROJECT_STATUS_UPDATED.md](./PROJECT_STATUS_UPDATED.md)** - Detaillierter Projekt-Status

---

## 🛠️ **Technologie-Stack**

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** TailwindCSS
- **Backend:** Next.js API Routes
- **Datenbank:** SQLite mit better-sqlite3
- **Authentifizierung:** JWT, bcrypt
- **PDF-Generierung:** Puppeteer
- **E-Mail:** Nodemailer (Brevo SMTP)

---

## 🔧 **Entwicklung**

### **Verfügbare Scripts**
```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint
npm run type-check   # TypeScript Check
```

### **Projekt-Struktur**
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── page.tsx        # Landing Page
│   └── ...
├── components/         # React Components
├── lib/               # Utilities & Database
└── ...
```

---

## 🔐 **Sicherheit**

- **API-Authentifizierung** mit Bearer Token
- **Input-Validierung** für alle Endpoints
- **SQL Injection Schutz** mit Prepared Statements
- **XSS-Schutz** durch Input-Sanitization
- **Rate Limiting** (optional)

---

## 📊 **Status**

**✅ Alle APIs funktionsfähig**  
**✅ Vollständige CRUD-Operationen**  
**✅ Authentifizierung implementiert**  
**✅ TypeScript ohne Fehler**  
**✅ API-Dokumentation vollständig**  

**🚀 Bereit für Produktion!**

---

## 📞 **Support**

Bei Fragen oder Problemen:
- **E-Mail:** office@gastro-cms.at
- **Dokumentation:** Siehe API_DOCUMENTATION.md
- **Status:** Siehe PROJECT_STATUS_UPDATED.md

---

**© 2025 Gastro CMS 3.0 - Alle Rechte vorbehalten**