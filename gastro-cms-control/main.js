const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const tls = require("tls");
const fetch = require("node-fetch");
const db = require("./db/database");

function tlsCertExpiry(hostname) {
  const h = String(hostname || "").trim();
  if (!h) return Promise.resolve({ ok: false, error: "hostname fehlt" });
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: h,
        port: 443,
        servername: h,
        rejectUnauthorized: false,
        timeout: 12000
      },
      () => {
        try {
          const cert = typeof socket.getPeerCertificate === "function" ? socket.getPeerCertificate(true) : null;
          const validTo = cert && cert.valid_to ? cert.valid_to : null;
          socket.end();
          resolve({ ok: true, validTo });
        } catch (e) {
          try {
            socket.destroy();
          } catch (_) {}
          resolve({ ok: false, error: e.message });
        }
      }
    );
    socket.on("error", (e) => resolve({ ok: false, error: e.message }));
    socket.on("timeout", () => {
      try {
        socket.destroy();
      } catch (_) {}
      resolve({ ok: false, error: "timeout" });
    });
  });
}

let mainWindow;

function settingGet(key, fallback = "") {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : fallback;
}

function authHeaders(useToken = false) {
  const user = settingGet("vps-user", "mario");
  const pass = settingGet("vps-pass", "");
  const token = settingGet("admin-token", "");
  const headers = {
    Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64")
  };
  if (useToken && token) headers["x-admin-token"] = token;
  return headers;
}

async function parseJsonBody(res) {
  const text = await res.text();
  if (!text) {
    if (!res.ok) return { error: `HTTP ${res.status}: Leere Antwort` };
    return {};
  }
  try {
    const data = JSON.parse(text);
    if (!res.ok && data && !data.error) {
      data.error = data.message || `HTTP ${res.status}`;
    }
    return data;
  } catch {
    const routeMatch = text.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^\s<]+)/i);
    if (routeMatch) {
      return { error: `Endpoint fehlt am Server: ${routeMatch[1].toUpperCase()} ${routeMatch[2]}` };
    }
    const snippet = text.replace(/\s+/g, " ").slice(0, 180);
    return { error: `HTTP ${res.status}: Kein JSON (${snippet})` };
  }
}

async function apiGet(endpoint) {
  const baseUrl = settingGet("vps-url", "https://updates.gastro-cms.at").replace(/\/$/, "");
  let res;
  try {
    res = await fetch(`${baseUrl}${endpoint}`, { headers: authHeaders(false) });
  } catch (err) {
    return { error: `Netzwerk: ${err.message || err}` };
  }
  return parseJsonBody(res);
}

async function apiPost(endpoint, body = {}) {
  const baseUrl = settingGet("vps-url", "https://updates.gastro-cms.at").replace(/\/$/, "");
  let res;
  try {
    res = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        ...authHeaders(true),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    return { error: `Netzwerk: ${err.message || err}` };
  }
  return parseJsonBody(res);
}

async function fetchSettingsExportFromDomain(domain) {
  const candidates = ["https", "http"];
  let lastErr = null;
  for (const scheme of candidates) {
    const url = `${scheme}://${domain}/api/admin/settings-export`;
    try {
      const res = await fetch(url);
      const data = await parseJsonBody(res);
      if (res.ok && data && !data.error) return data;
      lastErr = data?.error || `HTTP ${res.status}`;
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  throw new Error(lastErr || "settings-export fehlgeschlagen");
}

ipcMain.handle("dashboard:kpis", async () => {
  const rows = db
    .prepare("SELECT id, restaurant, domain FROM kunden WHERE domain IS NOT NULL AND domain <> '' ORDER BY created_at DESC")
    .all();

  const out = {
    restaurantsTotal: rows.length,
    restaurantsReachable: 0,
    restaurantsUnreachable: 0,
    totalRevenue: 0,
    totalCommission: 0,
    perRestaurant: [],
  };

  for (const r of rows) {
    try {
      const exported = await fetchSettingsExportFromDomain(r.domain);
      const revenue = Number(exported?.totalRevenue || 0);
      const commission = Number(exported?.totalCommission || 0);
      out.restaurantsReachable += 1;
      out.totalRevenue += Number.isFinite(revenue) ? revenue : 0;
      out.totalCommission += Number.isFinite(commission) ? commission : 0;
      out.perRestaurant.push({
        id: r.id,
        restaurant: r.restaurant,
        domain: r.domain,
        totalRevenue: revenue,
        totalCommission: commission,
      });
    } catch (_e) {
      out.restaurantsUnreachable += 1;
      out.perRestaurant.push({
        id: r.id,
        restaurant: r.restaurant,
        domain: r.domain,
        error: true,
      });
    }
  }

  // Rundung für Anzeige
  out.totalRevenue = Math.round(out.totalRevenue * 100) / 100;
  out.totalCommission = Math.round(out.totalCommission * 100) / 100;
  return out;
});

function createWindow() {
  const appIcon = path.resolve(__dirname, "..", "icon.png");
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("settings:get", () => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
});

ipcMain.handle("settings:set", (_event, key, value) => {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
  return { ok: true };
});

function getJsonSetting(key, fallback) {
  const raw = settingGet(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJsonSetting(key, value) {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
}

ipcMain.handle("connection:test", async () => {
  const baseUrl = settingGet("vps-url", "https://updates.gastro-cms.at").replace(/\/$/, "");
  const out = { baseUrl, health: null, status: null, capabilities: null };
  try {
    const h = await fetch(`${baseUrl}/health`);
    const data = await parseJsonBody(h);
    out.health = { ok: h.ok, status: h.status, body: data.error ? { error: data.error } : data };
  } catch (err) {
    out.health = { ok: false, error: err.message || String(err) };
  }
  try {
    const s = await fetch(`${baseUrl}/status`, { headers: authHeaders(false) });
    const data = await parseJsonBody(s);
    out.status = {
      ok: s.ok && !data.error,
      status: s.status,
      rolloutInProgress: data.rolloutInProgress,
      error: data.error || null
    };
  } catch (err) {
    out.status = { ok: false, error: err.message || String(err) };
  }
  try {
    const c = await fetch(`${baseUrl}/capabilities`, { headers: authHeaders(false) });
    const data = await parseJsonBody(c);
    out.capabilities = {
      ok: c.ok && !data.error,
      status: c.status,
      data: c.ok && !data.error ? data : null,
      error: data?.error || null
    };
  } catch (err) {
    out.capabilities = { ok: false, error: err.message || String(err) };
  }
  out.ok = !!(
    out.health &&
    out.health.ok &&
    out.status &&
    out.status.ok &&
    out.capabilities &&
    out.capabilities.ok
  );
  return out;
});

ipcMain.handle("status:get", async () => apiGet("/status"));
ipcMain.handle("server:capabilities", async () => apiGet("/capabilities"));
ipcMain.handle("versions:status", async () => apiGet("/versions/status"));
ipcMain.handle("staging:profile", async () => apiGet("/staging/profile"));
ipcMain.handle("instances:list", async () => apiGet("/instances"));
ipcMain.handle("instance:update", async (_event, payload) => apiPost("/update", payload));
ipcMain.handle("instance:restart", async (_event, payload) => apiPost("/restart", payload));
ipcMain.handle("instance:delete", async (_event, payload) => apiPost("/delete", payload));
ipcMain.handle("instance:backup-create", async (_event, payload) => {
  const body = payload && typeof payload === "object" ? payload : { domain: payload };
  return apiPost("/instance/backup", body);
});
ipcMain.handle("instance:backups-list", async (_event, domain) =>
  apiGet(`/instance/backups?domain=${encodeURIComponent(String(domain || "").trim())}`)
);
ipcMain.handle("instance:db-size", async (_event, domain) =>
  apiGet(`/instance/db-size?domain=${encodeURIComponent(String(domain || "").trim())}`)
);
ipcMain.handle("instance:backup-download", async (_event, { domain, file }) => {
  const baseUrl = settingGet("vps-url", "https://updates.gastro-cms.at").replace(/\/$/, "");
  const url = `${baseUrl}/instance/backup/download?domain=${encodeURIComponent(String(domain || "").trim())}&file=${encodeURIComponent(String(file || "").trim())}`;
  let res;
  try {
    res = await fetch(url, { headers: authHeaders(true) });
  } catch (err) {
    return { error: `Netzwerk: ${err.message || err}` };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: text || `HTTP ${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Backup speichern",
    defaultPath: String(file || "backup.sql.gz"),
    filters: [{ name: "Gzip SQL", extensions: ["gz"] }]
  });
  if (canceled || !filePath) return { ok: false, cancelled: true };
  fs.writeFileSync(filePath, buf);
  return { ok: true, filePath };
});

ipcMain.handle("utility:fetch-health", async (_event, url) => {
  const u = String(url || "").trim();
  if (!u) return { ok: false, error: "url fehlt" };
  try {
    const res = await fetch(u, { timeout: 15000 });
    return { ok: res.ok, status: res.status, url: u };
  } catch (e) {
    const errMsg = e.message || String(e);
    // TLS/Caddy Fehler: zusätzlich HTTP testen, um "läuft aber TLS kaputt" zu erkennen.
    if (/EPROTO|SSL|TLS|CERT/i.test(errMsg) && /^https:\/\//i.test(u)) {
      try {
        const fallback = u.replace(/^https:\/\//i, "http://");
        const r2 = await fetch(fallback, { timeout: 15000 });
        return {
          ok: false,
          error: errMsg,
          url: u,
          tlsError: true,
          httpFallbackUrl: fallback,
          httpFallbackOk: r2.ok,
          httpFallbackStatus: r2.status
        };
      } catch (e2) {
        return {
          ok: false,
          error: errMsg,
          url: u,
          tlsError: true,
          httpFallbackUrl: u.replace(/^https:\/\//i, "http://"),
          httpFallbackOk: false,
          httpFallbackError: e2.message || String(e2)
        };
      }
    }
    return { ok: false, error: errMsg, url: u };
  }
});

ipcMain.handle("utility:tls-expiry", async (_event, hostname) => tlsCertExpiry(hostname));

ipcMain.handle("crm:caddy-has-domain", async (_event, hostnames) => {
  const arr = (Array.isArray(hostnames) ? hostnames : [hostnames])
    .map((h) => String(h || "").trim())
    .filter(Boolean);
  const data = await apiGet("/caddy/file");
  if (data?.error) return data;
  const c = data.content || "";
  const presence = {};
  for (const h of arr) presence[h] = c.includes(h);
  return { ok: true, presence };
});
ipcMain.handle("staging:deploy", async (_event, payload) => {
  const body = typeof payload === "string" ? { target: payload } : payload || {};
  return apiPost("/staging/deploy", body);
});
ipcMain.handle("rollout:start", async (_event, payload) => {
  const body = typeof payload === "string" ? { target: payload } : payload || {};
  return apiPost("/rollout/start", body);
});
ipcMain.handle("cms:prisma-migrate-staging", async (_event, payload) => {
  const body = payload && typeof payload === "object" ? payload : {};
  return apiPost("/cms/prisma-migrate/staging", body);
});
ipcMain.handle("cms:prisma-migrate-rollout", async (_event, payload) => {
  const body = payload && typeof payload === "object" ? payload : {};
  return apiPost("/cms/prisma-migrate/rollout", body);
});
ipcMain.handle("caddy:get", async () => apiGet("/caddy/file"));
ipcMain.handle("caddy:save", async (_event, content) => apiPost("/caddy/file", { content }));
ipcMain.handle("caddy:reload", async () => apiPost("/caddy/reload", {}));

ipcMain.handle("provision:deploy", async (_event, payload) =>
  apiPost("/provision/deploy", payload && typeof payload === "object" ? payload : {})
);
ipcMain.handle("provision:backfill-existing", async (_event, payload) =>
  apiPost("/provision/backfill-existing", payload && typeof payload === "object" ? payload : {})
);
ipcMain.handle("provision:status", async (_event, operationId) => {
  const id = String(operationId || "").trim();
  if (!id) return { error: "operationId fehlt" };
  return apiGet(`/provision/status/${encodeURIComponent(id)}`);
});

ipcMain.handle("crm:activity-append", async (_event, payload) => {
  const kundenId = Number(payload?.kundenId);
  if (!Number.isFinite(kundenId) || kundenId <= 0) return { error: "Ungültige Kunden-ID" };
  const k = db.prepare("SELECT id FROM kunden WHERE id = ?").get(kundenId);
  if (!k) return { error: "Kunde nicht gefunden" };
  const kind = String(payload?.kind || "info").slice(0, 64);
  const message = String(payload?.message || "").slice(0, 2000);
  db.prepare("INSERT INTO crm_activity (kunden_id, kind, message) VALUES (?, ?, ?)").run(kundenId, kind, message);
  return { ok: true };
});

ipcMain.handle("crm:activity-list", async (_event, payload) => {
  const kundenId = Number(payload?.kundenId);
  const lim = Math.min(200, Math.max(1, Number(payload?.limit) || 80));
  if (!Number.isFinite(kundenId) || kundenId <= 0) return { error: "Ungültige Kunden-ID" };
  const rows = db
    .prepare(
      "SELECT id, kind, message, created_at FROM crm_activity WHERE kunden_id = ? ORDER BY datetime(created_at) DESC LIMIT ?"
    )
    .all(kundenId, lim);
  return { rows };
});

ipcMain.handle("crm:admin-users-list", async (_event, payload) => {
  const kundenId = Number(payload?.kundenId);
  if (!Number.isFinite(kundenId) || kundenId <= 0) return { error: "Ungültige Kunden-ID" };
  const rows = db
    .prepare(
      `SELECT id, kunden_id, email, password, role, note, is_active, created_at, updated_at
       FROM crm_admin_users
       WHERE kunden_id = ?
       ORDER BY datetime(created_at) DESC`
    )
    .all(kundenId);
  return { rows };
});

ipcMain.handle("crm:admin-user-create", async (_event, payload) => {
  const kundenId = Number(payload?.kundenId);
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "").trim();
  const role = String(payload?.role || "ADMIN").trim().toUpperCase() || "ADMIN";
  const note = String(payload?.note || "").trim();
  if (!Number.isFinite(kundenId) || kundenId <= 0) return { error: "Ungültige Kunden-ID" };
  if (!email || !email.includes("@")) return { error: "Gültige E-Mail erforderlich" };
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen haben" };
  const k = db.prepare("SELECT id FROM kunden WHERE id = ?").get(kundenId);
  if (!k) return { error: "Kunde nicht gefunden" };
  const clash = db
    .prepare("SELECT id FROM crm_admin_users WHERE kunden_id = ? AND lower(email) = lower(?)")
    .get(kundenId, email);
  if (clash) return { error: "Für dieses Restaurant existiert diese E-Mail bereits" };
  const info = db
    .prepare(
      `INSERT INTO crm_admin_users (kunden_id, email, password, role, note, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`
    )
    .run(kundenId, email, password, role, note || null);
  return { ok: true, id: info.lastInsertRowid };
});

ipcMain.handle("crm:admin-user-password-set", async (_event, payload) => {
  const id = Number(payload?.id);
  const password = String(payload?.password || "").trim();
  if (!Number.isFinite(id) || id <= 0) return { error: "Ungültige Benutzer-ID" };
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen haben" };
  const row = db.prepare("SELECT id FROM crm_admin_users WHERE id = ?").get(id);
  if (!row) return { error: "Admin-Benutzer nicht gefunden" };
  db.prepare("UPDATE crm_admin_users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(password, id);
  return { ok: true };
});

ipcMain.handle("crm:admin-user-delete", async (_event, payload) => {
  const id = Number(payload?.id);
  if (!Number.isFinite(id) || id <= 0) return { error: "Ungültige Benutzer-ID" };
  const row = db.prepare("SELECT id FROM crm_admin_users WHERE id = ?").get(id);
  if (!row) return { error: "Admin-Benutzer nicht gefunden" };
  db.prepare("DELETE FROM crm_admin_users WHERE id = ?").run(id);
  return { ok: true };
});

// Staging: lokale Zugangsdaten + Notizen/Protokoll im Control Center
ipcMain.handle("staging:credentials:list", async () => {
  const remote = await apiGet("/staging/admin-users");
  if (!remote?.error) return { rows: Array.isArray(remote?.rows) ? remote.rows : [], source: "remote" };
  const rows = getJsonSetting("staging-credentials", []);
  return { rows: Array.isArray(rows) ? rows : [], source: "local", warning: remote?.error || null };
});

ipcMain.handle("staging:credentials:create", async (_event, payload) => {
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "").trim();
  const role = String(payload?.role || "ADMIN").trim().toUpperCase() || "ADMIN";
  const note = String(payload?.note || "").trim();
  if (!email || !email.includes("@")) return { error: "Gültige E-Mail erforderlich" };
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen haben" };

  const remote = await apiPost("/staging/admin-users", { email, password, role, note });
  if (!remote?.error) return remote;

  const rows = getJsonSetting("staging-credentials", []);
  if (rows.some((r) => String(r.email || "").toLowerCase() === email)) {
    return { error: "E-Mail existiert bereits" };
  }
  const row = {
    id: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    password,
    role,
    note: note || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  rows.unshift(row);
  setJsonSetting("staging-credentials", rows);
  return { ok: true, id: row.id, source: "local", warning: remote?.error || null };
});

ipcMain.handle("staging:credentials:update-password", async (_event, payload) => {
  const id = String(payload?.id || "").trim();
  const password = String(payload?.password || "").trim();
  if (!id) return { error: "Ungültige ID" };
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen haben" };

  if (!String(id).startsWith("stg-")) {
    const remote = await apiPost(`/staging/admin-users/${encodeURIComponent(id)}/password`, { password });
    if (!remote?.error) return remote;
  }

  const rows = getJsonSetting("staging-credentials", []);
  const idx = rows.findIndex((r) => String(r.id) === id);
  if (idx === -1) return { error: "Eintrag nicht gefunden" };
  rows[idx] = { ...rows[idx], password, updated_at: new Date().toISOString() };
  setJsonSetting("staging-credentials", rows);
  return { ok: true };
});

ipcMain.handle("staging:credentials:delete", async (_event, payload) => {
  const id = String(payload?.id || "").trim();
  if (!id) return { error: "Ungültige ID" };

  if (!String(id).startsWith("stg-")) {
    const remote = await apiPost("/staging/admin-users/delete", { id });
    if (!remote?.error) return remote;
    const remoteDel = await (async () => {
      const baseUrl = settingGet("vps-url", "https://updates.gastro-cms.at").replace(/\/$/, "");
      let res;
      try {
        res = await fetch(`${baseUrl}/staging/admin-users/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: authHeaders(true)
        });
      } catch (err) {
        return { error: `Netzwerk: ${err.message || err}` };
      }
      return parseJsonBody(res);
    })();
    if (!remoteDel?.error) return remoteDel;
  }

  const rows = getJsonSetting("staging-credentials", []);
  const next = rows.filter((r) => String(r.id) !== id);
  setJsonSetting("staging-credentials", next);
  return { ok: true };
});

ipcMain.handle("staging:notes:get", async () => {
  return { text: settingGet("staging-notes", "") };
});

ipcMain.handle("staging:notes:set", async (_event, payload) => {
  const text = String(payload?.text || "");
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("staging-notes", text);
  return { ok: true };
});

ipcMain.handle("staging:activity:list", async () => {
  const rows = getJsonSetting("staging-activity", []);
  return { rows: Array.isArray(rows) ? rows : [] };
});

ipcMain.handle("staging:activity:append", async (_event, payload) => {
  const kind = String(payload?.kind || "info").slice(0, 64);
  const message = String(payload?.message || "").slice(0, 2000);
  if (!message) return { error: "message fehlt" };
  const rows = getJsonSetting("staging-activity", []);
  rows.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    message,
    created_at: new Date().toISOString()
  });
  setJsonSetting("staging-activity", rows.slice(0, 300));
  return { ok: true };
});

// ── CRM (Kundenverwaltung) ──────────────────────────────────────────────
async function fetchInstanceSettingsExport(domain) {
  const candidates = ["https", "http"];
  let lastErr = null;
  for (const scheme of candidates) {
    const url = `${scheme}://${domain}/api/admin/settings-export`;
    try {
      const res = await fetch(url);
      const data = await parseJsonBody(res);
      if (res.ok && !data?.error) return data;
      lastErr = data?.error || `HTTP ${res.status}`;
      if (res.status === 404) {
        lastErr = `settings-export Route nicht gefunden (404): ${url}. Bitte Gastro CMS neu deployen (Staging deployen + Rollout CMS) damit die Import/Export-Routen live verfügbar sind.`;
      }
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  throw new Error(`settings-export fehlgeschlagen: ${lastErr || "unbekannt"}`);
}

ipcMain.handle("crm:kunde-refresh-snapshot", async (_event, id) => {
  const row = db.prepare("SELECT id, domain FROM kunden WHERE id = ?").get(id);
  if (!row) return { error: "Kunde nicht gefunden" };
  if (!row.domain) return { error: "Domain fehlt" };
  try {
    const exported = await fetchInstanceSettingsExport(row.domain);
    db.prepare(
      `UPDATE kunden
       SET restaurant = ?,
           favicon_url = ?,
           logo_url = ?,
           settings_snapshot = ?
       WHERE id = ?`
    ).run(
      exported?.name || "Restaurant",
      exported?.favicon || null,
      exported?.logo || null,
      JSON.stringify(exported),
      id
    );
    return { ok: true };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

async function importInstanceSettings(domain, snapshot) {
  const candidates = ["https", "http"];
  let lastErr = null;
  const body = snapshot || {};

  for (const scheme of candidates) {
    const url = `${scheme}://${domain}/api/admin/settings-import`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await parseJsonBody(res);
      if (res.ok) return data;
      lastErr = data?.error || `HTTP ${res.status}`;
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  throw new Error(`settings-import fehlgeschlagen: ${lastErr || "unbekannt"}`);
}

function dbGetTemplateSnapshot() {
  const v = settingGet("crm-template-settings", "");
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function dbGetTemplateDomain() {
  return settingGet("crm-template-domain", "bestellung.pizzeria1140.at");
}

function dbSetTemplateSnapshot(snapshot) {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    "crm-template-settings",
    JSON.stringify(snapshot || {})
  );
}

function dbSetTemplateDomain(domain) {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("crm-template-domain", domain);
}

async function ensureTemplateSnapshot() {
  const existing = dbGetTemplateSnapshot();
  if (existing) return existing;

  const templateDomain = dbGetTemplateDomain();
  const exported = await fetchInstanceSettingsExport(templateDomain);
  dbSetTemplateDomain(templateDomain);
  dbSetTemplateSnapshot(exported);
  return exported;
}

ipcMain.handle("crm:sync-from-instances", async () => {
  const instances = await apiGet("/instances");
  if (instances?.error) return { error: instances.error };

  const cmsInstances = (instances || []).filter((i) => (i.kind || "cms") !== "landingpage" && i.domain);
  const stmtCheck = db.prepare("SELECT id FROM kunden WHERE domain = ?");
  const stmtExisting = db.prepare("SELECT id, settings_snapshot, settings_imported_at FROM kunden WHERE domain = ?");
  const stmtUpdate = db.prepare(
    `UPDATE kunden
     SET restaurant=@restaurant,
         favicon_url=@favicon_url,
         logo_url=@logo_url,
         settings_snapshot=@settings_snapshot
     WHERE id=@id`
  );
  const stmtInsert = db.prepare(
    `INSERT INTO kunden (name, restaurant, domain, landingpage_domain, email, telefon, adresse, notizen, favicon_url, logo_url, settings_snapshot)
     VALUES (@name, @restaurant, @domain, @landingpage_domain, @email, @telefon, @adresse, @notizen, @favicon_url, @logo_url, @settings_snapshot)`
  );
  const stmtMarkImported = db.prepare("UPDATE kunden SET settings_imported_at = datetime('now') WHERE id = ?");

  let template = null;
  let templateWarn = null;
  try {
    template = await ensureTemplateSnapshot();
  } catch (e) {
    templateWarn = e?.message || String(e);
  }

  for (const inst of cmsInstances) {
    const exists = stmtExisting.get(inst.domain);
    const shouldTryExport = !exists?.id || !exists.settings_snapshot;

    let exported = null;
    if (shouldTryExport) {
      try {
        exported = await fetchInstanceSettingsExport(inst.domain);
      } catch (_e) {
        // Fallback auf Template
      }
    }

    const snapshotSource = exported || template || null;
    const favicon_url = snapshotSource?.favicon || null;
    const logo_url = snapshotSource?.logo || null;
    const restaurantName = snapshotSource?.name || inst.name || "Restaurant";
    const settings_snapshot = snapshotSource ? JSON.stringify(snapshotSource) : null;

    if (!exists?.id) {
      stmtInsert.run({
        name: "",
        restaurant: restaurantName || "Restaurant",
        domain: inst.domain,
        landingpage_domain: null,
        email: "",
        telefon: "",
        adresse: "",
        notizen: "",
        favicon_url,
        logo_url,
        settings_snapshot,
      });
    } else if (!exists.settings_snapshot && settings_snapshot) {
      stmtUpdate.run({
        id: exists.id,
        restaurant: restaurantName || "Restaurant",
        favicon_url,
        logo_url,
        settings_snapshot,
      });
    }
  }

  // Wenn eine Instanz online ist und wir noch nie importiert haben: Settings automatisch importieren.
  for (const inst of cmsInstances) {
    const row = stmtExisting.get(inst.domain);
    if (!row?.id) continue;
    if (row.settings_imported_at) continue;
    if (!row.settings_snapshot) continue;

    try {
      const snapshot = JSON.parse(row.settings_snapshot);
      const imported = await importInstanceSettings(inst.domain, snapshot);
      if (imported?.success === true) {
        stmtMarkImported.run(row.id);
      }
    } catch (_e) {
      // Import wird beim nächsten Sync erneut versucht.
    }
  }

  return { ok: true, warning: templateWarn || null };
});

ipcMain.handle("crm:kunden-list", async () => {
  const rows = db
    .prepare(
      `SELECT id, name, restaurant, domain, landingpage_domain, email, telefon, adresse, notizen, favicon_url, logo_url, created_at
       FROM kunden
       ORDER BY created_at DESC`
    )
    .all();
  return rows;
});

ipcMain.handle("crm:kunde-create", async (_event, data) => {
  const domain = (data?.domain || "").trim();
  const name = (data?.name || "").trim();
  const restaurant = (data?.restaurant || "").trim();

  if (!domain) return { error: "Domain fehlt" };
  if (!name || !restaurant) return { error: "Name und Restaurant sind Pflichtfelder" };

  const stmt = db.prepare(
    `INSERT INTO kunden (name, restaurant, domain, landingpage_domain, email, telefon, adresse, notizen, favicon_url, logo_url, settings_snapshot)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  try {
    const result = stmt.run(
      name,
      restaurant,
      domain,
      data?.landingpage_domain || null,
      data?.email || null,
      data?.telefon || null,
      data?.adresse || null,
      data?.notizen || null,
      null,
      null,
      null
    );
    const newId = result.lastInsertRowid;
    db.prepare("INSERT INTO crm_activity (kunden_id, kind, message) VALUES (?, ?, ?)").run(
      newId,
      "kunde",
      `Kunde angelegt (CMS: ${domain})`
    );
    return { id: newId };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

ipcMain.handle("crm:kunde-get", async (_event, id) => {
  const row = db.prepare("SELECT * FROM kunden WHERE id = ?").get(id);
  if (!row) return null;
  let snapshot = null;
  try {
    snapshot = row.settings_snapshot ? JSON.parse(row.settings_snapshot) : null;
  } catch {
    snapshot = null;
  }
  return { ...row, settings_snapshot: snapshot };
});

ipcMain.handle("crm:kunde-update", async (_event, data) => {
  const id = Number(data?.id);
  if (!Number.isFinite(id) || id <= 0) return { error: "Ungültige ID" };
  const row = db.prepare("SELECT * FROM kunden WHERE id = ?").get(id);
  if (!row) return { error: "Kunde nicht gefunden" };

  const next = {
    name: (data?.name ?? "").toString().trim(),
    email: (data?.email ?? "").toString().trim(),
    telefon: (data?.telefon ?? "").toString().trim(),
    adresse: (data?.adresse ?? "").toString().trim(),
    notizen: (data?.notizen ?? "").toString().trim(),
  };

  let domain = row.domain;
  if (data?.domain !== undefined) {
    const d = String(data.domain).trim();
    if (!d) return { error: "Bestell-Domain darf nicht leer sein" };
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)) return { error: "Ungültige Bestell-Domain" };
    if (d !== row.domain) {
      const clash = db.prepare("SELECT id FROM kunden WHERE domain = ? AND id != ?").get(d, id);
      if (clash) return { error: "Domain bereits vergeben" };
      domain = d;
    }
  }

  let landingpage_domain = row.landingpage_domain;
  if (data?.landingpage_domain !== undefined) {
    const lp = String(data.landingpage_domain).trim();
    landingpage_domain = lp || null;
    if (landingpage_domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(landingpage_domain)) {
      return { error: "Ungültige Landing-Domain" };
    }
  }

  let restaurant = row.restaurant;
  if (data?.restaurant != null) {
    const r = String(data.restaurant).trim();
    if (r) restaurant = r;
  }

  db.prepare(
    `UPDATE kunden
     SET name=@name, email=@email, telefon=@telefon, adresse=@adresse, notizen=@notizen,
         domain=@domain, landingpage_domain=@landingpage_domain, restaurant=@restaurant
     WHERE id=@id`
  ).run({
    id,
    ...next,
    domain,
    landingpage_domain,
    restaurant
  });

  return { ok: true };
});

ipcMain.handle("crm:kunde-import-settings", async (_event, id) => {
  const row = db.prepare("SELECT domain, settings_snapshot FROM kunden WHERE id = ?").get(id);
  if (!row) return { error: "Kunde nicht gefunden" };
  if (!row.domain) return { error: "Domain fehlt" };
  let snapshot = null;
  if (!row.settings_snapshot) {
    // Fallback: Template Snapshot nachziehen (falls Sync noch nicht fertig / Routen nach Deploy erst live).
    try {
      snapshot = await ensureTemplateSnapshot();
    } catch (e) {
      return { error: e?.message || String(e) };
    }
  } else {
    try {
      snapshot = JSON.parse(row.settings_snapshot);
    } catch {
      return { error: "settings_snapshot ist ungültig (JSON)" };
    }
  }

  try {
    const imported = await importInstanceSettings(row.domain, snapshot);
    if (imported?.success === true) {
      db.prepare("UPDATE kunden SET settings_imported_at = datetime('now') WHERE id = ?").run(id);
    }
    return imported;
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

ipcMain.handle("crm:kunde-adopt-domain", async (_event, id) => {
  const row = db.prepare("SELECT id, domain, settings_snapshot FROM kunden WHERE id = ?").get(id);
  if (!row) return { error: "Kunde nicht gefunden" };
  if (!row.domain) return { error: "Domain fehlt" };

  let snapshot = null;
  if (!row.settings_snapshot) {
    try {
      snapshot = await ensureTemplateSnapshot();
    } catch (e) {
      return { error: e?.message || String(e) };
    }
  } else {
    try {
      snapshot = JSON.parse(row.settings_snapshot);
    } catch {
      return { error: "settings_snapshot ist ungültig (JSON)" };
    }
  }

  // Domain aus CRM (Instanz) als Restaurant-Domain in den Settings setzen.
  const next = { ...(snapshot || {}) };
  next.domain = row.domain;

  // Local Snapshot persistieren, damit UI sofort passt.
  db.prepare("UPDATE kunden SET settings_snapshot = ? WHERE id = ?").run(JSON.stringify(next), id);

  // Direkt in Instanz importieren
  try {
    const imported = await importInstanceSettings(row.domain, next);
    if (imported?.success === true) {
      db.prepare("UPDATE kunden SET settings_imported_at = datetime('now') WHERE id = ?").run(id);
    }
    return imported;
  } catch (e) {
    return { error: e?.message || String(e) };
  }
});

ipcMain.handle("crm:kunde-delete", async (_event, payload) => {
  const id = Number(payload?.id);
  const deleteInstances = payload?.deleteInstances !== false;
  if (!Number.isFinite(id) || id <= 0) return { error: "Ungültige ID" };
  const row = db.prepare("SELECT id, domain, landingpage_domain FROM kunden WHERE id = ?").get(id);
  if (!row) return { error: "Kunde nicht gefunden" };

  const warnings = [];
  if (deleteInstances) {
    const domains = [row.domain, row.landingpage_domain].filter(Boolean);
    for (const domain of domains) {
      const r = await apiPost("/delete", { domain });
      if (r?.error) {
        const e = String(r.error);
        if (/Nicht gefunden|not found/i.test(e)) {
          warnings.push(`Instanz ${domain} war bereits nicht vorhanden.`);
        } else {
          return { error: `Instanz ${domain} konnte nicht gelöscht werden: ${e}` };
        }
      }
    }
  }

  db.prepare("DELETE FROM crm_activity WHERE kunden_id = ?").run(id);
  db.prepare("DELETE FROM kunden WHERE id = ?").run(id);
  return { ok: true, warnings };
});
