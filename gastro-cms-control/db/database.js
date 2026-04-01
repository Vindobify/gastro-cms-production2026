const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "gastro-cms-control.db");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- CRM: Kundenverwaltung (nur lokal im Control-Center)
CREATE TABLE IF NOT EXISTS kunden (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Ansprechpartner / Kontaktperson
  name TEXT,
  restaurant TEXT NOT NULL,
  domain TEXT UNIQUE,
  landingpage_domain TEXT,
  email TEXT,
  telefon TEXT,
  adresse TEXT,
  notizen TEXT,

  -- Branding für schnelle Vorschau im CRM
  favicon_url TEXT,
  logo_url TEXT,

  -- Restaurant-Settings-Export (shape wie /api/admin/settings-export)
  settings_snapshot TEXT,

  -- wann wurden settings_snapshot das letzte mal in die Instanz importiert?
  settings_imported_at DATETIME,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Migration für bestehende Local-DBs: Spalte nachziehen, falls fehlt.
try {
  db.exec("ALTER TABLE kunden ADD COLUMN settings_imported_at DATETIME");
} catch (_) {
  // Spalte existiert bereits.
}

db.exec(`
CREATE TABLE IF NOT EXISTS crm_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kunden_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_activity_kunde ON crm_activity (kunden_id, created_at DESC);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS crm_admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kunden_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  note TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kunden_id) REFERENCES kunden(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_crm_admin_users_kunde ON crm_admin_users (kunden_id, created_at DESC);
`);

module.exports = db;
