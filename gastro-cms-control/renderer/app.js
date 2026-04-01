const content = document.getElementById("content");
const navButtons = document.querySelectorAll(".nav-btn");
let logsSource = null;
let connectedLogsUrl = null;
const logsByDomain = {};
const logsByOperationId = {};
const globalLogs = [];
let activeConsoleDomain = null;
let activeOperationId = null;
let activeDeployOperationId = null;
let lastProvisionOperationId = null;
let provisionPollTimer = null;
let crmProvisionPollTimer = null;
let activePage = "dashboard";
/** 0=CONNECTING, 1=OPEN, 2=CLOSED (EventSource.readyState) */
let logsSseReadyState = 2;

const MAX_GLOBAL = 1000;
const MAX_PER_DOMAIN = 500;
const MAX_PER_OPERATION = 800;

const pages = {
  dashboard: renderDashboard,
  instanzen: renderInstanzen,
  deployment: renderDeployment,
  caddy: renderCaddy,
  crm: renderCrm,
  settings: renderSettings
};

function setActiveNav(page) {
  activePage = page;
  navButtons.forEach((btn) => {
    const active = btn.dataset.page === page;
    btn.className = active
      ? "nav-btn w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left text-sm font-semibold text-brand-700"
      : "nav-btn w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50";
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    setActiveNav(page);
    pages[page]();
  });
});

function handleResult(result) {
  if (!result) return "Unbekannter Fehler";
  if (result.error) return result.error;
  return null;
}

function showToast(message, type = "info") {
  const host = document.getElementById("toast-host");
  if (!host) {
    window.alert(message);
    return;
  }
  const el = document.createElement("div");
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-slate-200 bg-white text-slate-800";
  el.className = `pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${styles}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.classList.add("opacity-0", "transition", "duration-300");
    setTimeout(() => el.remove(), 320);
  }, 4200);
}

function topHeader(title, subtitle) {
  return `<div class="mb-1"><h2 class="text-2xl font-bold text-slate-900">${title}</h2><p class="mt-1 text-sm text-slate-500">${subtitle}</p></div>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortCommit(value) {
  if (!value) return "-";
  const v = String(value).trim();
  // Keep special docker status strings readable.
  if (v.startsWith("container-started:") || v.includes("@sha256:")) return v;
  if (/^[a-f0-9]{12,}$/i.test(v)) return v.slice(0, 8);
  return v;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("de-AT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function newOperationId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function appendLogEntry(data) {
  const entry = { ...data };
  globalLogs.push(entry);
  if (globalLogs.length > MAX_GLOBAL) globalLogs.shift();
  if (entry.domain) {
    if (!logsByDomain[entry.domain]) logsByDomain[entry.domain] = [];
    logsByDomain[entry.domain].push(entry);
    if (logsByDomain[entry.domain].length > MAX_PER_DOMAIN) logsByDomain[entry.domain].shift();
  }
  const oid = entry.operationId;
  if (oid) {
    if (!logsByOperationId[oid]) logsByOperationId[oid] = [];
    logsByOperationId[oid].push(entry);
    if (logsByOperationId[oid].length > MAX_PER_OPERATION) logsByOperationId[oid].shift();
  }
}

function formatLogLine(l) {
  const scope = l.scope != null && l.scope !== "" ? `[${l.scope}] ` : "";
  return `[${l.time || "-"}] ${scope}${l.msg || ""}`;
}

function updateDeploySseStatusEl() {
  const el = document.getElementById("deploy-sse-status");
  if (!el) return;
  const labels = { 0: "verbinde…", 1: "verbunden", 2: "getrennt" };
  const rs = logsSource ? logsSource.readyState : 2;
  logsSseReadyState = rs;
  const url = connectedLogsUrl || "";
  el.textContent = `Log-Stream (${url || "—"}): ${labels[rs] || rs}. Getrennt: URL prüfen. Verbunden aber kein Text: update-server neu deployen; PM2 nur 1 Instanz; Caddy \`flush_interval -1\` für /logs.`;
  el.className =
    rs === 1
      ? "mt-2 text-xs text-emerald-700"
      : rs === 0
        ? "mt-2 text-xs text-amber-700"
        : "mt-2 text-xs text-red-700";
}

async function ensureLogsStream() {
  const settings = await window.api.settingsGet();
  const baseUrl = (settings["vps-url"] || "https://updates.gastro-cms.at").replace(/\/$/, "");
  const url = `${baseUrl}/logs`;
  if (logsSource && connectedLogsUrl === url) {
    updateDeploySseStatusEl();
    return;
  }

  if (logsSource) {
    logsSource.close();
    logsSource = null;
  }
  connectedLogsUrl = url;
  logsSource = new EventSource(url);
  logsSource.onopen = () => {
    logsSseReadyState = logsSource.readyState;
    updateDeploySseStatusEl();
  };
  logsSource.onerror = () => {
    logsSseReadyState = logsSource ? logsSource.readyState : 2;
    updateDeploySseStatusEl();
  };
  logsSource.  onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      appendLogEntry(data);
      if (activePage === "instanzen") renderConsole();
      if (activePage === "deployment") renderDeployLog();
    } catch (_err) {
      // ignore malformed events
    }
  };
  updateDeploySseStatusEl();
}

async function reconnectLogsStream() {
  if (logsSource) {
    logsSource.close();
    logsSource = null;
    connectedLogsUrl = null;
  }
  await ensureLogsStream();
}

function versionRowsHtml(rows) {
  if (!rows || !rows.length) {
    return "<tr><td colspan='6' class='px-3 py-3 text-sm text-slate-500'>Keine Eintraege</td></tr>";
  }
  return rows
    .map(
      (i) => `
    <tr class="border-b border-slate-100 last:border-0">
      <td class="px-3 py-2 text-xs uppercase tracking-wide text-slate-500">${i.kind || "-"}</td>
      <td class="px-3 py-2 text-sm">${i.domain}</td>
      <td class="px-3 py-2 text-sm font-mono">${shortCommit(i.deployedCommit)}</td>
      <td class="px-3 py-2 text-sm font-mono">${shortCommit(i.stagingCommit)}</td>
      <td class="px-3 py-2 text-sm">${i.versionNote ? "n/a" : i.sameAsStaging ? "Ja" : "Nein"}</td>
      <td class="px-3 py-2 text-sm text-slate-500">${formatDateTime(i.deployedAt)}</td>
    </tr>
  `
    )
    .join("");
}

async function renderDashboard() {
  const status = await window.api.statusGet();
  const versions = await window.api.versionsStatus();
  const kpis = await window.api.dashboardKpis().catch(() => null);
  const cmsStaging = versions?.staging?.commit || "-";
  const landingStaging = versions?.landingStaging?.commit || "-";
  const all = versions?.instances || [];
  const cmsTable = all.filter((i) => (i.kind || "cms") !== "landingpage");
  const landingTable = all.filter((i) => (i.kind || "") === "landingpage");
  const fmtMoney = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "-";
    return n.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const top5 = (kpis?.perRestaurant || [])
    .filter((r) => !r?.error)
    .sort((a, b) => Number(b?.totalRevenue || 0) - Number(a?.totalRevenue || 0))
    .slice(0, 5);

  content.innerHTML = `
    ${topHeader("Dashboard", "Aktueller Status und Versionsvergleich")}
    <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
      <div class="card"><p class="text-xs uppercase tracking-wide text-slate-500">Rollout aktiv</p><p class="mt-2 text-2xl font-bold">${status.rolloutInProgress ? "Ja" : "Nein"}</p></div>
      <div class="card"><p class="text-xs uppercase tracking-wide text-slate-500">CMS Update</p><p class="mt-2 text-2xl font-bold">${status.channels?.cms?.updateAvailable ? "Verfuegbar" : "Kein Update"}</p></div>
      <div class="card"><p class="text-xs uppercase tracking-wide text-slate-500">LandingPage Update</p><p class="mt-2 text-2xl font-bold">${status.channels?.landingpage?.updateAvailable ? "Verfuegbar" : "Kein Update"}</p></div>
      <div class="card"><p class="text-xs uppercase tracking-wide text-slate-500">Gesamtumsatz (alle Restaurants)</p><p class="mt-2 text-2xl font-black">€ ${kpis ? fmtMoney(kpis.totalRevenue) : "—"}</p><p class="mt-1 text-xs text-slate-500">${kpis ? `${kpis.restaurantsReachable}/${kpis.restaurantsTotal} erreichbar` : "lädt…"}</p></div>
      <div class="card"><p class="text-xs uppercase tracking-wide text-slate-500">Provision (gesamt)</p><p class="mt-2 text-2xl font-black">€ ${kpis ? fmtMoney(kpis.totalCommission) : "—"}</p><p class="mt-1 text-xs text-slate-500">${kpis ? `Offline: ${kpis.restaurantsUnreachable}` : ""}</p></div>
    </div>
    <div class="card">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Top 5 Restaurants (Umsatz)</h3>
        <span class="text-xs text-slate-500">Basis: /api/admin/settings-export pro Domain</span>
      </div>
      ${
        !kpis
          ? `<div class="text-sm text-slate-500">Lade KPIs…</div>`
          : top5.length === 0
            ? `<div class="text-sm text-slate-500">Noch keine Umsatzdaten verfügbar (oder alle Domains offline).</div>`
            : `
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurant</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Domain</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Umsatz</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Provision</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${top5
                      .map(
                        (r, idx) => `
                      <tr class="border-b border-slate-100 last:border-0">
                        <td class="px-3 py-2 text-sm font-semibold text-slate-700">${idx + 1}</td>
                        <td class="px-3 py-2 text-sm font-semibold text-slate-900">${r.restaurant || "—"}</td>
                        <td class="px-3 py-2 text-sm text-slate-600">${r.domain || "—"}</td>
                        <td class="px-3 py-2 text-sm font-mono">€ ${fmtMoney(r.totalRevenue)}</td>
                        <td class="px-3 py-2 text-sm font-mono">€ ${fmtMoney(r.totalCommission)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
      }
    </div>
    <div class="card">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Gastro CMS &amp; Docker (Staging: ${shortCommit(cmsStaging)})</h3>
        <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">Referenz: /opt/gastro-cms/staging</span>
      </div>
      <p class="mb-2 text-xs text-slate-500">Hinweis: Zeilen mit kind=docker nutzen ein eigenes Repo (kein CMS-Staging-Vergleich).</p>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Kanal</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Domain</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Live Commit</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Staging Commit</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gleich</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Zuletzt deployed</th>
            </tr>
          </thead>
          <tbody>${versionRowsHtml(cmsTable)}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">LandingPage (Staging: ${shortCommit(landingStaging)})</h3>
        <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">Referenz: /opt/LandingPage/staging</span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Kanal</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Domain</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Live Commit</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Staging Commit</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gleich</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Zuletzt deployed</th>
            </tr>
          </thead>
          <tbody>${versionRowsHtml(landingTable)}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderInstanzen() {
  const instances = await window.api.instancesList();
  const status = await window.api.statusGet();
  const channels = status?.channels || {};
  if (instances.error) {
    content.innerHTML = `<div class="card text-red-600">${instances.error}</div>`;
    return;
  }

  const rows = instances
    .map((i) => {
      const kind = i.kind || "cms";
      const isLanding = kind === "landingpage";
      const isDocker = kind === "docker" || i.buildSource === "local";
      const updateAvailable = isDocker
        ? true
        : isLanding
          ? !!channels?.landingpage?.updateAvailable
          : !!channels?.cms?.updateAvailable;
      const updateLabel = isDocker ? "Rebuild" : "Update";
      const protectedDomain =
        i.domain === "bestellung.pizzeria1140.at" ||
        i.domain === "pizzeria1140.at" ||
        i.protected;
      const showDelete = isLanding ? false : isDocker ? !i.protected : !protectedDomain;
      const deleteBtn = showDelete
        ? `<button data-action="delete" data-domain="${i.domain}" class="btn-secondary">Delete</button>`
        : "";
      const actionButtons = isLanding
        ? `<div class="flex gap-2 items-center">
          ${updateAvailable ? `<button data-action="update" data-domain="${i.domain}" class="btn-primary">${updateLabel}</button>` : `<span class="text-xs text-slate-500">Kein Update verfuegbar</span>`}
          <button data-action="restart" data-domain="${i.domain}" class="btn-secondary">Restart</button>
        </div>`
        : `<div class="flex gap-2 items-center">
          ${updateAvailable ? `<button data-action="update" data-domain="${i.domain}" class="${isDocker ? "btn-secondary" : "btn-primary"}">${updateLabel}</button>` : `<span class="text-xs text-slate-500">Kein Update verfuegbar</span>`}
          <button data-action="restart" data-domain="${i.domain}" class="btn-secondary">Restart</button>
          ${deleteBtn}
        </div>`;
      return `
    <tr class="border-b border-slate-100 last:border-0">
      <td class="px-3 py-2 text-sm font-medium">${i.name || "-"}</td>
      <td class="px-3 py-2 text-xs uppercase tracking-wide text-slate-500">${i.kind || "cms"}</td>
      <td class="px-3 py-2 text-sm">${i.domain}</td>
      <td class="px-3 py-2 text-xs text-slate-500">${i.path || "-"}</td>
      <td class="px-3 py-2 text-sm">${i.port || "-"}</td>
      <td class="px-3 py-2">
        ${actionButtons}
      </td>
    </tr>
  `;
    })
    .join("");

  content.innerHTML = `
    ${topHeader("Instanzen", "Verwaltung und Live-Konsole")}
    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Kanal</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Domain</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pfad</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Port</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Aktion</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-slate-500">Protected: bestellung.pizzeria1140.at, pizzeria1140.at sowie Instanzen mit flag protected=true koennen nicht geloescht werden.</p>
    </div>
    <div class="card">
      <h3 class="text-lg font-semibold">Instanz Console</h3>
      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ansicht</label>
          <select id="console-mode" class="input">
            <option value="domain">Nur ausgewaehlte Domain</option>
            <option value="all">Alle Server-Logs</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Domain</label>
          <select id="console-domain" class="input">
            <option value="">Bitte waehlen</option>
            ${instances.map((i) => `<option value="${i.domain}">${i.domain}</option>`).join("")}
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
          <div id="console-meta" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">Kein aktiver Vorgang</div>
        </div>
      </div>
      <pre id="instance-console" class="mt-3 max-w-full min-h-0 min-w-0 h-72 overflow-x-auto overflow-y-auto whitespace-pre rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100"></pre>
    </div>
  `;

  await ensureLogsStream();

  const domainSelect = document.getElementById("console-domain");
  const modeSelect = document.getElementById("console-mode");
  if (activeConsoleDomain) domainSelect.value = activeConsoleDomain;

  function syncConsoleModeUi() {
    const mode = modeSelect.value;
    domainSelect.disabled = mode === "all";
  }

  modeSelect.addEventListener("change", () => {
    syncConsoleModeUi();
    renderConsole();
  });
  domainSelect.addEventListener("change", () => {
    activeConsoleDomain = domainSelect.value || null;
    renderConsole();
  });
  syncConsoleModeUi();

  content.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const domain = btn.dataset.domain;
      const action = btn.dataset.action;
      const operationId = newOperationId();

      activeConsoleDomain = domain;
      activeOperationId = operationId;
      domainSelect.value = domain;
      modeSelect.value = "domain";
      syncConsoleModeUi();
      renderConsole();

      let result;
      const payload = { domain, operationId };
      if (action === "update") result = await window.api.instanceUpdate(payload);
      if (action === "restart") result = await window.api.instanceRestart(payload);
      if (action === "delete") result = await window.api.instanceDelete(payload);
      const err = handleResult(result);
      if (err) showToast(`Fehler: ${err}`, "error");
      else showToast("Aktion gestartet", "success");
      if (!err) renderInstanzen();
    });
  });

  renderConsole();
}

function renderConsole() {
  const pre = document.getElementById("instance-console");
  const meta = document.getElementById("console-meta");
  const modeSelect = document.getElementById("console-mode");
  const domainSelect = document.getElementById("console-domain");
  if (!pre || !meta || !modeSelect) return;

  const mode = modeSelect.value;

  if (mode === "all") {
    meta.textContent = activeOperationId
      ? `Alle Logs | gefiltert nach Operation: ${activeOperationId}`
      : "Alle Server-Logs (Staging, Rollout, Instanzen)";
    const lines = activeOperationId
      ? globalLogs.filter((l) => l.operationId === activeOperationId)
      : globalLogs;
    pre.textContent = lines.map(formatLogLine).join("\n");
    pre.scrollTop = pre.scrollHeight;
    return;
  }

  if (!activeConsoleDomain) {
    meta.textContent = "Domain waehlen oder Aktion aus der Tabelle starten";
    pre.textContent = "";
    return;
  }

  const lines = logsByDomain[activeConsoleDomain] || [];
  const filtered = activeOperationId
    ? lines.filter((l) => !l.operationId || l.operationId === activeOperationId)
    : lines;

  meta.textContent = activeOperationId
    ? `Domain: ${activeConsoleDomain} | Operation: ${activeOperationId}`
    : `Domain: ${activeConsoleDomain}`;
  pre.textContent = filtered.map(formatLogLine).join("\n");
  pre.scrollTop = pre.scrollHeight;
}

function renderDeployLog() {
  const pre = document.getElementById("deploy-log");
  if (!pre) return;
  updateDeploySseStatusEl();
  if (!activeDeployOperationId) {
    pre.textContent =
      "(Nach „Staging deployen“ oder „Rollout starten“ erscheinen hier die Zeilen dieser Operation. Stream-Status siehe Zeile darüber.)";
    return;
  }
  let merged = logsByOperationId[activeDeployOperationId] || [];
  if (merged.length === 0) {
    merged = globalLogs.filter((l) => l.operationId === activeDeployOperationId);
  }
  if (merged.length === 0) {
    const tail = globalLogs.slice(-50);
    pre.textContent = [
      `Operation ${activeDeployOperationId.slice(0, 8)}… — keine Zeilen nur mit dieser operationId.`,
      logsSseReadyState !== 1
        ? "Stream-Status ist nicht OFFEN (siehe Zeile darüber)."
        : "Stream ist OFFEN: wenn unten auch keine „system“-Zeile erscheint, kommen keine data:-Events an (Proxy/alter Server) oder update-server laeuft als mehrere Prozesse (PM2 cluster).",
      tail.length ? "\n--- Letzte Logs (alle Operationen, Diagnose) ---\n" + tail.map(formatLogLine).join("\n") : "\n(Puffer leer = noch kein einziges data:-Event empfangen.)",
    ].join("\n");
    return;
  }
  pre.textContent = merged.map(formatLogLine).join("\n");
  pre.scrollTop = pre.scrollHeight;
}

async function renderDeployment() {
  if (provisionPollTimer) {
    clearInterval(provisionPollTimer);
    provisionPollTimer = null;
  }
  const status = await window.api.statusGet();
  const cms = status?.channels?.cms || {};
  const landing = status?.channels?.landingpage || {};

  content.innerHTML = `
    ${topHeader("Deployment", "Staging deployen und Rollout auf alle Live-Instanzen (Neukunden-Deploy liegt im CRM-Profil unter „Instanz & Deploy“)")}
    <div class="space-y-6">
    <div class="grid min-w-0 grid-cols-2 gap-4">
      <div class="card min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">CMS Kanal</h3>
          <span class="rounded-lg px-2 py-1 text-xs font-medium ${cms.updateAvailable ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}">${cms.updateAvailable ? "Update verfuegbar" : "Aktuell"}</span>
        </div>
        <p class="mt-2 text-xs text-slate-500">Latest: <span class="font-mono text-slate-700">${shortCommit(cms.latestCommit)}</span></p>
        <p class="text-xs text-slate-500">Staging: <span class="font-mono text-slate-700">${shortCommit(cms.stagingCommit)}</span></p>
        <p class="text-xs text-slate-500">Zuletzt deployt: ${formatDateTime(cms.lastDeployAt)}</p>
      </div>
      <div class="card min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">LandingPage Kanal</h3>
          <span class="rounded-lg px-2 py-1 text-xs font-medium ${landing.updateAvailable ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}">${landing.updateAvailable ? "Update verfuegbar" : "Aktuell"}</span>
        </div>
        <p class="mt-2 text-xs text-slate-500">Latest: <span class="font-mono text-slate-700">${shortCommit(landing.latestCommit)}</span></p>
        <p class="text-xs text-slate-500">Staging: <span class="font-mono text-slate-700">${shortCommit(landing.stagingCommit)}</span></p>
        <p class="text-xs text-slate-500">Zuletzt deployt: ${formatDateTime(landing.lastDeployAt)}</p>
      </div>
    </div>
    <div class="card max-w-xl">
      <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Target</label>
      <select id="target" class="input">
        <option value="cms">CMS</option>
        <option value="landingpage">LandingPage</option>
        <option value="both">Beides</option>
      </select>
      <label class="mt-3 flex items-start gap-2 text-xs text-slate-600">
        <input id="cms-seo-migration" type="checkbox" class="mt-0.5" checked />
        <span>
          Bei CMS-Staging-Deploy: Datenbank-Migration im Staging-Container (nach Neustart). Nutzt dasselbe Verfahren wie die Buttons unten inkl. automatischer Behebung von Prisma <strong>P3005</strong> (fehlende <code class="rounded bg-slate-100 px-1">_prisma_migrations</code> bei bestehendem Schema).
        </span>
      </label>
      <div class="mt-3 flex flex-wrap gap-2">
        <button id="staging-btn" class="btn-primary">Staging deployen</button>
        <button id="rollout-btn" class="btn-secondary">Rollout starten</button>
        <button id="refresh-btn" class="btn-secondary">Status aktualisieren</button>
      </div>
      <div class="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
        <p class="text-xs font-semibold text-indigo-900">DB-Schema nur migrieren (ohne Image-Rebuild)</p>
        <p class="mt-1 text-xs text-indigo-800/90">
          Führt im laufenden App-Container <code class="rounded bg-white px-1">npx prisma migrate deploy</code> aus (Staging bzw. je Instanz aus <code class="rounded bg-white px-1">instances.json</code>).
          <strong class="font-semibold">P3005-Automatik:</strong> Wenn die Datenbank schon Tabellen hat, aber keine Migrate-Historie (typisch nach älterem <code class="rounded bg-white px-1">db push</code> oder Restore), erkennt der Update-Server Prisma-Fehler <strong>P3005</strong> und markiert die Migrationen <strong>1…n−1</strong> als bereits angewendet, führt danach <code class="rounded bg-white px-1">migrate deploy</code> erneut aus (wendet normalerweise nur die <strong>neueste</strong> Migration an, z.&nbsp;B. neue Tabellen wie <code class="rounded bg-white px-1">flyers</code>). Schlägt das fehl, versucht er einmal eine <strong>volle</strong> Baseline (alle Migrationen als applied) – nur sinnvoll, wenn das Schema bereits vollständig passt.
        </p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button id="prisma-migrate-staging-btn" type="button" class="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-50">Prisma migrate: Staging</button>
          <button id="prisma-migrate-rollout-btn" type="button" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100">Prisma migrate: alle CMS (Rollout)</button>
        </div>
      </div>
      <p class="mt-3 text-xs text-slate-500">Rolling rollout pro Domain mit Health-Check. Logs unten sind an die jeweilige Operation gebunden.</p>
    </div>
    </div>
    <div class="card max-w-xl">
      <h3 class="text-base font-semibold">DNS/Mail Backfill (bestehende Instanzen)</h3>
      <p class="mt-1 text-xs text-slate-600">
        Legt DNS + Mailcow nachträglich für alle Domains aus <code class="rounded bg-slate-100 px-1">instances.json</code> und
        <code class="rounded bg-slate-100 px-1">landing-instances.json</code> an.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button id="backfill-existing-btn" class="btn-secondary">Für alle bestehenden Instanzen starten</button>
        <button id="backfill-refresh-btn" class="btn-secondary">Backfill-Status aktualisieren</button>
      </div>
      <p id="backfill-op" class="mt-2 text-xs text-slate-500"></p>
      <div id="backfill-summary" class="mt-2 text-xs text-slate-600"></div>
    </div>
    <div class="card min-w-0">
      <h3 class="text-lg font-semibold">Live-Log (SSE)</h3>
      <p id="deploy-sse-status" class="mt-2 text-xs text-slate-500">Log-Stream: …</p>
      <pre id="deploy-log" class="mt-2 max-w-full min-h-0 min-w-0 h-64 overflow-x-auto overflow-y-auto whitespace-pre rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100"></pre>
    </div>
  `;

  await ensureLogsStream();
  renderDeployLog();

  document.getElementById("staging-btn").addEventListener("click", async () => {
    const target = document.getElementById("target").value;
    const enforceSeoMigration = !!document.getElementById("cms-seo-migration")?.checked;
    const operationId = newOperationId();
    activeDeployOperationId = operationId;
    renderDeployLog();
    const result = await window.api.stagingDeploy({
      target,
      operationId,
      // Der Update-Server kann diese Flags direkt verwenden; falls nicht vorhanden, werden sie ignoriert.
      deployProfile: enforceSeoMigration && (target === "cms" || target === "both") ? "cms-seo-safe" : "default",
      runMigrations: enforceSeoMigration && (target === "cms" || target === "both"),
    });
    const err = handleResult(result);
    if (err) {
      activeDeployOperationId = null;
      renderDeployLog();
      showToast(`Fehler: ${err}`, "error");
    } else showToast(`Staging gestartet (${operationId.slice(0, 8)}…)`, "success");
  });
  document.getElementById("rollout-btn").addEventListener("click", async () => {
    const target = document.getElementById("target").value;
    const operationId = newOperationId();
    activeDeployOperationId = operationId;
    renderDeployLog();
    const result = await window.api.rolloutStart({ target, operationId });
    const err = handleResult(result);
    if (err) {
      activeDeployOperationId = null;
      renderDeployLog();
      showToast(`Fehler: ${err}`, "error");
    } else showToast(`Rollout gestartet (${operationId.slice(0, 8)}…)`, "success");
  });
  document.getElementById("refresh-btn").addEventListener("click", () => {
    renderDeployment();
  });

  document.getElementById("prisma-migrate-staging-btn").addEventListener("click", async () => {
    const operationId = newOperationId();
    activeDeployOperationId = operationId;
    renderDeployLog();
    const result = await window.api.cmsPrismaMigrateStaging({ operationId });
    const err = handleResult(result);
    if (err) {
      activeDeployOperationId = null;
      renderDeployLog();
      showToast(`Fehler: ${err}`, "error");
    } else showToast(`Prisma migrate Staging gestartet (${operationId.slice(0, 8)}…)`, "success");
  });

  document.getElementById("prisma-migrate-rollout-btn").addEventListener("click", async () => {
    if (
      !window.confirm(
        "Prisma migrate auf allen CMS-Instanzen ausführen? Je Instanz: migrate deploy im App-Container; bei P3005 automatische Baseline (siehe Beschreibung oben)."
      )
    ) {
      return;
    }
    const operationId = newOperationId();
    activeDeployOperationId = operationId;
    renderDeployLog();
    const result = await window.api.cmsPrismaMigrateRollout({ operationId });
    const err = handleResult(result);
    if (err) {
      activeDeployOperationId = null;
      renderDeployLog();
      showToast(`Fehler: ${err}`, "error");
    } else showToast(`Prisma migrate Rollout gestartet (${operationId.slice(0, 8)}…)`, "success");
  });

  document.getElementById("backfill-existing-btn").addEventListener("click", async () => {
    if (!window.confirm("DNS + Mailcow für alle bestehenden Instanzen nachträglich starten?")) return;
    const operationId = newOperationId();
    lastProvisionOperationId = operationId;
    activeDeployOperationId = operationId;
    renderDeployLog();
    if (provisionPollTimer) clearInterval(provisionPollTimer);
    const op = document.getElementById("backfill-op");
    const sum = document.getElementById("backfill-summary");
    if (op) op.textContent = `operationId: ${operationId}`;
    if (sum) sum.textContent = "Starte…";
    const r = await window.api.provisionBackfillExisting({ operationId });
    const err = handleResult(r);
    if (err) {
      showToast(`Fehler: ${err}`, "error");
      if (sum) sum.textContent = err;
      activeDeployOperationId = null;
      renderDeployLog();
      return;
    }
    showToast(`Backfill gestartet (${operationId.slice(0, 8)}…)`, "success");
    provisionPollTimer = setInterval(async () => {
      const st = await window.api.provisionStatusGet(operationId);
      if (st?.error && !st?.status) return;
      if (sum) {
        if (st.status === "running") sum.textContent = "Läuft…";
        else {
          const rr = st.result || {};
          sum.textContent = `Status: ${st.status} · verarbeitet: ${rr.processed ?? "-"} · ok: ${rr.success ?? "-"} · fehlgeschlagen: ${rr.failed ?? "-"}`;
        }
      }
      if (st.status === "ok" || st.status === "error") {
        clearInterval(provisionPollTimer);
        provisionPollTimer = null;
      }
    }, 2500);
  });

  document.getElementById("backfill-refresh-btn").addEventListener("click", async () => {
    if (!lastProvisionOperationId) {
      showToast("Noch kein Backfill gestartet", "error");
      return;
    }
    const st = await window.api.provisionStatusGet(lastProvisionOperationId);
    if (st?.error && !st?.status) {
      showToast(st.error, "error");
      return;
    }
    const op = document.getElementById("backfill-op");
    const sum = document.getElementById("backfill-summary");
    if (op) op.textContent = `operationId: ${lastProvisionOperationId}`;
    if (sum) {
      const rr = st.result || {};
      if (st.status === "running") sum.textContent = "Läuft…";
      else sum.textContent = `Status: ${st.status} · verarbeitet: ${rr.processed ?? "-"} · ok: ${rr.success ?? "-"} · fehlgeschlagen: ${rr.failed ?? "-"}`;
    }
  });
}

async function renderCrm() {
  let selectedId = null;

  function safe(v) {
    return v == null ? "" : String(v);
  }

  function fmtMoney(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return safe(v);
    return n.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function section(title, bodyHtml) {
    return `
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">${title}</h3>
        </div>
        <div class="mt-4">${bodyHtml}</div>
      </div>
    `;
  }

  function kv(label, value) {
    const v = value == null || value === "" ? "—" : String(value);
    return `<div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${label}</div>
      <div class="mt-0.5 text-sm text-slate-900 break-words">${v}</div>
    </div>`;
  }

  async function renderDetail(id) {
    if (crmProvisionPollTimer) {
      clearInterval(crmProvisionPollTimer);
      crmProvisionPollTimer = null;
    }

    const data = await window.api.kundeGet(id);
    if (!data) {
      showToast("Kunde nicht gefunden", "error");
      selectedId = null;
      await renderList();
      return;
    }
    const snap = data.settings_snapshot || null;
    const icon = data.favicon_url || data.logo_url || "/icon-192.png";
    const logo = data.logo_url || (snap && snap.logo) || null;
    const favicon = data.favicon_url || (snap && snap.favicon) || null;
    const domain = data.domain || "";
    const crmLandingDomain = (data.landingpage_domain || "").trim();

    function looksLikeDomain(v) {
      return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(v || "").trim());
    }

    function apexFromHost(host) {
      const h = String(host || "").trim().toLowerCase();
      if (!h) return "";
      if (h.startsWith("bestellung.")) return h.slice("bestellung.".length);
      if (h.startsWith("order.")) return h.slice("order.".length);
      const parts = h.split(".").filter(Boolean);
      if (parts.length <= 2) return h;
      return parts.slice(-2).join(".");
    }

    async function detectLandingDomain() {
      if (looksLikeDomain(crmLandingDomain)) return crmLandingDomain;

      const snapCustom = String(snap?.customDomain || "").trim().toLowerCase();
      if (looksLikeDomain(snapCustom) && snapCustom !== String(domain || "").trim().toLowerCase()) {
        return snapCustom;
      }

      const inferredApex = apexFromHost(domain);
      if (looksLikeDomain(inferredApex) && inferredApex !== String(domain || "").trim().toLowerCase()) {
        return inferredApex;
      }

      const inst = await window.api.instancesList();
      if (!inst?.error && Array.isArray(inst)) {
        const landingRows = inst.filter((i) => (i.kind || "") === "landingpage");
        const direct = landingRows.find((i) => String(i.domain || "").trim().toLowerCase() === inferredApex);
        if (direct?.domain) return String(direct.domain).trim();
      }

      return "";
    }

    const landingDomain = await detectLandingDomain();
    const caps = window.api.serverCapabilities
      ? await window.api.serverCapabilities().catch(() => ({ error: "capabilities nicht erreichbar" }))
      : { error: "capabilities API fehlt" };
    const hasInstanceBackupApi = !!(caps && !caps.error && caps.features && caps.features.instanceBackupApi);

    const openingHours = snap?.openingHours || [];
    const deliveryAreas = snap?.deliveryAreas || [];
    const specialDays = snap?.specialDays || [];
    const totalRevenue = snap?.totalRevenue;
    const totalCommission = snap?.totalCommission;

    function escHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function colorSwatch(hex) {
      const h = String(hex || "").trim();
      if (!/^#[0-9a-f]{3,8}$/i.test(h)) {
        const v = h || "—";
        return escHtml(v);
      }
      return `<span class="inline-flex items-center gap-2"><span class="h-6 w-6 shrink-0 rounded border border-slate-200" style="background:${h}"></span><span class="font-mono text-sm">${h}</span></span>`;
    }

    function fmtBytes(n) {
      if (n == null || !Number.isFinite(Number(n))) return "—";
      let v = Number(n);
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i += 1;
      }
      return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    }

    const actRes = await window.api.crmActivityList({ kundenId: id, limit: 120 });
    const activityRows = Array.isArray(actRes?.rows) ? actRes.rows : [];
    const activitiesHtml = activityRows.length
      ? activityRows
          .map(
            (r) => `
          <div class="border-b border-slate-100 py-3 last:border-0">
            <div class="text-xs text-slate-400">${escHtml(formatDateTime(r.created_at))}</div>
            <div class="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">${escHtml(r.kind)}</div>
            <div class="mt-1 text-sm text-slate-800 whitespace-pre-wrap">${escHtml(r.message)}</div>
          </div>`
          )
          .join("")
      : `<div class="text-sm text-slate-500">Noch keine Einträge.</div>`;

    async function appendAct(kind, message) {
      await window.api.crmActivityAppend({ kundenId: id, kind, message }).catch(() => {});
    }

    function kpi(label, value, hint) {
      const v = value == null || value === "" ? "—" : `€ ${fmtMoney(value)}`;
      return `
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">${label}</div>
          <div class="mt-1 text-2xl font-black text-slate-900">${v}</div>
          ${hint ? `<div class="mt-1 text-xs text-slate-500">${hint}</div>` : ``}
        </div>
      `;
    }

    function styleCrmTab(btn, active) {
      if (!btn) return;
      btn.className = active
        ? "crm-tab-btn rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 sm:text-sm"
        : "crm-tab-btn rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm";
    }

    content.innerHTML = `
      ${topHeader("CRM", "Restaurantprofil — Aktionen und Daten pro Kunde (Tabs)")}
      <div class="max-w-6xl space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-4 min-w-0">
              <img src="${icon}" class="h-12 w-12 rounded-2xl border border-slate-200 object-cover" alt="Icon">
              <div class="min-w-0">
                <div class="text-xl font-extrabold text-slate-900 truncate">${safe(data.restaurant) || "Restaurant"}</div>
                <div class="mt-1 text-sm text-slate-500 break-all">CMS: ${domain || "—"}${landingDomain ? ` · Landing: ${safe(landingDomain)}${crmLandingDomain ? "" : " (auto)"}` : ""}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button id="crm-back" type="button" class="btn-secondary">← Zurück</button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              ${logo ? `<div class="rounded-2xl border border-slate-200 bg-white p-3"><div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Logo</div><img src="${logo}" class="mt-2 h-10 w-28 object-contain" alt="Logo"></div>` : ""}
              ${favicon ? `<div class="rounded-2xl border border-slate-200 bg-white p-3"><div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Favicon</div><img src="${favicon}" class="mt-2 h-10 w-10 rounded-xl border border-slate-200 object-cover" alt="Favicon"></div>` : ""}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button type="button" class="crm-tab-btn" data-crm-tab="overview">Übersicht</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="instance">Instanz &amp; Deploy</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="database">Datenbank &amp; Backups</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="domain">Domain &amp; DNS</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="email">E-Mail &amp; Benachrichtigungen</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="finance">Finanzen</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="credentials">Zugangsdaten</button>
          <button type="button" class="crm-tab-btn" data-crm-tab="notes">Notizen &amp; Protokoll</button>
        </div>

        <div id="crm-panel-overview" class="crm-tab-panel space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <button id="crm-refresh-snap" type="button" class="btn-secondary">Snapshot aktualisieren</button>
            <button id="crm-import" type="button" class="btn-primary">Settings importieren</button>
            <span class="text-xs text-slate-500">${data.settings_imported_at ? `Letzter Import: ${formatDateTime(data.settings_imported_at)}` : "Noch nicht importiert."}</span>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            ${kpi("Umsatz (gesamt)", totalRevenue, "Summe aller Bestellungen (ohne STORNIERT)")}
            ${kpi("Meine Provision", totalCommission, "Aktuell: 10% vom Umsatz (gesamt)")}
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            ${section("Kontakt", `
            <div id="kontakt-view" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${kv("Ansprechpartner", data.name)}
              ${kv("E-Mail", data.email)}
              ${kv("Telefon", data.telefon)}
              ${kv("Adresse", data.adresse)}
              <div class="sm:col-span-2">${kv("Notizen", data.notizen)}</div>
              <div class="sm:col-span-2">
                <button id="kontakt-edit" type="button" class="btn-secondary">Kontakt bearbeiten</button>
              </div>
            </div>
            <div id="kontakt-edit-form" class="hidden space-y-3">
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ansprechpartner</label>
                  <input id="k-name" class="input" value="${safe(data.name)}" placeholder="Vor- und Nachname">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">E-Mail</label>
                  <input id="k-email" class="input" value="${safe(data.email)}" placeholder="office@example.at">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telefon</label>
                  <input id="k-telefon" class="input" value="${safe(data.telefon)}" placeholder="+43 ...">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</label>
                  <input id="k-adresse" class="input" value="${safe(data.adresse)}" placeholder="Straße, PLZ Ort">
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notizen</label>
                  <textarea id="k-notizen" class="input" rows="4" placeholder="Interne Notizen...">${safe(data.notizen)}</textarea>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button id="kontakt-save" type="button" class="btn-primary">Speichern</button>
                <button id="kontakt-cancel" type="button" class="btn-secondary">Abbrechen</button>
              </div>
              <p class="text-xs text-slate-500">Lokal im Control Center (CRM).</p>
            </div>
          `)}
            ${section("Restaurant &amp; Design (Settings)", `
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${kv("Name", snap?.name)}
              ${kv("Bestell-Domain (Instanz)", data.domain)}
              ${kv("Domain (Settings)", snap?.domain)}
              ${kv("Kontakt E-Mail", snap?.email)}
              ${kv("Telefon", snap?.phone)}
              <div class="sm:col-span-2">${kv("Adresse", snap?.address)}</div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primärfarbe</div>
                <div class="mt-1">${colorSwatch(snap?.primaryColor)}</div>
              </div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sekundärfarbe</div>
                <div class="mt-1">${colorSwatch(snap?.secondaryColor)}</div>
              </div>
              ${kv("Border Radius", snap?.borderRadius)}
              ${kv("Font Family", snap?.fontFamily)}
            </div>
            ${
              data.domain && snap?.domain && String(snap.domain).trim() && String(snap.domain).trim() !== String(data.domain).trim()
                ? `<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Hinweis: Settings-Domain <span class="font-mono">${safe(snap.domain)}</span> weicht von Instanz <span class="font-mono">${safe(data.domain)}</span> ab.
                    <div class="mt-2 flex flex-wrap gap-2">
                      <button id="crm-adopt-domain" type="button" class="btn-secondary">Domain in Settings übernehmen</button>
                    </div>
                  </div>`
                : ``
            }
          `)}
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            ${section("Öffnungszeiten", `
            ${openingHours.length ? `
              <div class="space-y-2">
                ${openingHours
                  .map(
                    (oh) => `
                  <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                    <span class="font-semibold">Tag ${safe(oh.dayOfWeek)}</span>
                    <span class="ml-2">${oh.isClosed ? "Geschlossen" : `${safe(oh.openTime)}–${safe(oh.closeTime)}`}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            ` : `<div class="text-sm text-slate-500">Keine Daten</div>`}
          `)}
            ${section("Liefergebiete", `
            ${deliveryAreas.length ? `
              <div class="space-y-2">
                ${deliveryAreas
                  .map(
                    (da) => `
                  <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div class="text-sm font-semibold text-slate-900">${safe(da.zipCode)} ${safe(da.city)}</div>
                    <div class="mt-1 text-xs text-slate-600">Mindestbestellwert: € ${fmtMoney(da.minOrderValue)} · Liefergebühr: € ${fmtMoney(da.deliveryFee)}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            ` : `<div class="text-sm text-slate-500">Keine Daten</div>`}
          `)}
            ${section("Sondertage", `
            ${specialDays.length ? `
              <div class="space-y-2">
                ${specialDays
                  .map(
                    (sd) => `
                  <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div class="text-sm font-semibold text-slate-900">${safe(sd.date)}</div>
                    <div class="mt-1 text-xs text-slate-600">${sd.isClosed ? "Geschlossen" : `${safe(sd.openTime)}–${safe(sd.closeTime)}`}</div>
                    ${sd.note ? `<div class="mt-1 text-xs text-slate-500">${safe(sd.note)}</div>` : ""}
                  </div>
                `
                  )
                  .join("")}
              </div>
            ` : `<div class="text-sm text-slate-500">Keine Daten</div>`}
          `)}
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <details>
              <summary class="cursor-pointer select-none text-sm font-extrabold uppercase tracking-wider text-slate-700">Rechtliches &amp; SEO (aufklappen)</summary>
              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                ${kv("Firmenname", snap?.companyName)}
                ${kv("UID", snap?.vatId)}
                ${kv("Rechtsform", snap?.legalForm)}
                ${kv("Custom Domain", snap?.customDomain)}
                ${kv("SEO Title", snap?.seoTitle)}
                <div class="sm:col-span-2">${kv("SEO Desc", snap?.seoDesc)}</div>
                <div class="sm:col-span-2">${kv("Impressum", snap?.imprint)}</div>
                <div class="sm:col-span-2">${kv("Datenschutz", snap?.privacyPolicy)}</div>
              </div>
            </details>
          </div>
        </div>

        <div id="crm-panel-instance" class="crm-tab-panel hidden space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Gastro CMS</h3>
              <p id="crm-health-cms" class="mt-2 text-sm text-slate-600">Lade…</p>
              <p id="crm-version-cms" class="mt-2 text-xs text-slate-500 font-mono"></p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">LandingPage</h3>
              <p id="crm-health-landing" class="mt-2 text-sm text-slate-600">${landingDomain ? "Lade…" : "Keine Landing-Domain im CRM."}</p>
              <p id="crm-version-landing" class="mt-2 text-xs text-slate-500 font-mono"></p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="crm-deploy-cms" type="button" class="btn-primary"${domain ? "" : " disabled"}>Deploy (nur CMS)</button>
            <button id="crm-restart-cms" type="button" class="btn-secondary"${domain ? "" : " disabled"}>Restart CMS</button>
            <button id="crm-rebuild-cms" type="button" class="btn-secondary"${domain ? "" : " disabled"} title="Entspricht Deploy (Image neu)">Rebuild CMS</button>
            ${landingDomain ? `<button id="crm-deploy-lp" type="button" class="btn-primary">Deploy Landing</button><button id="crm-restart-lp" type="button" class="btn-secondary">Restart Landing</button>` : ""}
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Caddyfile</h3>
            <p id="crm-caddy-status" class="mt-2 text-sm text-slate-600">Lade…</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 class="text-lg font-semibold">Neukunde — Voll-Deploy</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              DNS (Technitium), Mailcow, Docker-Instanzen, Caddy — Zugangsdaten stehen in der <code class="rounded bg-slate-100 px-1 text-[11px]">/opt/update-server/.env</code> auf dem Server.
            </p>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Was deployen?</label>
              <select id="crm-prov-target" class="input">
                <option value="both">LandingPage + Gastro CMS</option>
                <option value="cms">Nur Gastro CMS</option>
                <option value="landingpage">Nur LandingPage</option>
              </select>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Domain LandingPage</label>
                <input id="crm-prov-domain-landing" class="input" placeholder="restaurant.at" value="${safe(landingDomain)}" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Domain Gastro CMS</label>
                <input id="crm-prov-domain-cms" class="input" placeholder="bestellung.restaurant.at" value="${safe(domain)}" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurantname</label>
              <input id="crm-prov-restaurant" class="input" placeholder="Pizzeria …" value="${safe(data.restaurant)}" />
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mail-Apex (optional)</label>
                <input id="crm-prov-mail-apex" class="input" placeholder="restaurant.at" value="${safe(landingDomain || "")}" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mailbox lokaler Teil</label>
                <input id="crm-prov-mailbox-local" class="input" value="info" />
              </div>
            </div>
            <div class="flex flex-wrap gap-4 text-xs text-slate-600">
              <label class="flex items-center gap-2"><input type="checkbox" id="crm-prov-skip-dns" /> DNS überspringen</label>
              <label class="flex items-center gap-2"><input type="checkbox" id="crm-prov-skip-mailcow" /> Mailcow überspringen</label>
              <label class="flex items-center gap-2"><input type="checkbox" id="crm-prov-skip-caddy-reload" /> Caddy-Reload überspringen</label>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" id="crm-prov-start" class="btn-primary">Voll-Deploy starten</button>
              <button type="button" id="crm-prov-refresh" class="btn-secondary">Status aktualisieren</button>
              <button type="button" id="crm-prov-infra" class="btn-secondary">Nur DNS + Mailcow nachholen</button>
            </div>
            <p id="crm-prov-op-id" class="text-xs text-slate-500"></p>
            <div id="crm-prov-steps" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"></div>
            <div id="crm-prov-secrets" class="hidden rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"></div>
          </div>
        </div>

        <div id="crm-panel-database" class="crm-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">PostgreSQL (CMS)</h3>
            <p class="mt-2 text-sm text-slate-600">Geschätzte DB-Größe: <span id="crm-db-size" class="font-semibold">—</span></p>
            <p class="mt-1 text-xs text-slate-500">Nur wenn die Instanz auf dem Update-Server bekannt ist.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" id="crm-backup-now" class="btn-primary"${domain && hasInstanceBackupApi ? "" : " disabled"}>Backup jetzt erstellen</button>
            <button type="button" id="crm-backup-refresh" class="btn-secondary"${domain && hasInstanceBackupApi ? "" : " disabled"}>Liste aktualisieren</button>
          </div>
          <div id="crm-backup-list" class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Lade…</div>
        </div>

        <div id="crm-panel-domain" class="crm-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Domains im CRM ändern</h3>
            <p class="text-xs text-slate-500">Hier nur lokale CRM-Felder; DNS/Caddy passen sich nicht automatisch an.</p>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurantname</label>
              <input id="crm-dom-restaurant" class="input" value="${safe(data.restaurant)}" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Bestell-Domain (CMS)</label>
              <input id="crm-dom-cms" class="input" value="${safe(domain)}" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Landing-Domain</label>
              <input id="crm-dom-landing" class="input" value="${safe(landingDomain)}" placeholder="optional" />
            </div>
            <button type="button" id="crm-dom-save" class="btn-primary">Speichern</button>
            <div class="pt-2 border-t border-slate-200">
              <button type="button" id="crm-delete-restaurant" class="btn-secondary !border-red-300 !text-red-700 hover:!bg-red-50">
                Restaurant entfernen
              </button>
              <p class="mt-1 text-[11px] text-slate-500">Löscht den CRM-Eintrag und optional die laufenden Instanzen (CMS/Landing) am Server.</p>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">DNS prüfen</h3>
            <p class="text-xs text-slate-500">Externe Diagnose (MX, SPF, …).</p>
            ${domain ? `<a class="text-brand-700 underline" href="https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${encodeURIComponent(domain)}&run=toolpage" target="_blank" rel="noreferrer">MXToolbox für ${safe(domain)}</a>` : "—"}
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">SSL (HTTPS, Port 443)</h3>
            <p id="crm-ssl-cms" class="text-sm text-slate-600">—</p>
            ${landingDomain ? `<p id="crm-ssl-landing" class="text-sm text-slate-600">—</p>` : ""}
          </div>
        </div>

        <div id="crm-panel-email" class="crm-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 space-y-2">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Mailcow</h3>
            <p class="text-xs text-slate-500">Mailbox- und Domain-Status in der Mailcow-UI prüfen. Voll-Deploy legt Domain, DKIM und Postfach an (wenn Mailcow in der Server-.env konfiguriert ist).</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 space-y-2">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">DKIM / SPF / DMARC</h3>
            <p class="text-xs text-slate-500">Nach Deploy: DNS-TXT bei deinem DNS-Anbieter mit Mailcow/Technitium abgleichen.</p>
            ${domain ? `<a class="text-brand-700 underline" href="https://mxtoolbox.com/SuperTool.aspx?action=txt%3a${encodeURIComponent(domain)}&run=toolpage" target="_blank" rel="noreferrer">TXT-Records für ${safe(domain)}</a>` : ""}
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 space-y-2">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Brevo</h3>
            <p class="text-xs text-slate-500">Transaktionsmail / Marketing: API-Keys und Webhooks in der jeweiligen CMS-/Landing-Konfiguration hinterlegen (folgt als eigene API-Anbindung).</p>
          </div>
        </div>

        <div id="crm-panel-finance" class="crm-tab-panel hidden space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            ${kpi("Umsatz (gesamt)", totalRevenue, "Aus letztem Snapshot")}
            ${kpi("Meine Provision", totalCommission, "Aus letztem Snapshot")}
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Umsatz-Verlauf</h3>
            <p class="mt-2 text-xs text-slate-500">Monats-/Jahresverlauf: bitte Snapshot regelmäßig aktualisieren; Diagramm kann angebunden werden, sobald die API Zeitreihen liefert.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Offene Beträge / Stripe Connect</h3>
            <p class="mt-2 text-xs text-slate-500">Stripe Connect und offene Rechnungen: im CMS-Dashboard bzw. Stripe-Connect-Status prüfen (kein direkter Token im Control Center).</p>
          </div>
        </div>

        <div id="crm-panel-credentials" class="crm-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Admin-Benutzer anlegen</h3>
            <p class="text-xs text-slate-500">Lokal im Control Center gespeichert (pro Restaurant).</p>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">E-Mail</label>
                <input id="crm-admin-email" class="input" placeholder="admin@restaurant.at" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Rolle</label>
                <select id="crm-admin-role" class="input">
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Passwort</label>
              <input id="crm-admin-password" class="input" type="text" placeholder="mindestens 6 Zeichen" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notiz (optional)</label>
              <input id="crm-admin-note" class="input" placeholder="z. B. Inhaber, Filiale, ... " />
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" id="crm-admin-generate" class="btn-secondary">Passwort generieren</button>
              <button type="button" id="crm-admin-create" class="btn-primary">Admin erstellen</button>
              <button type="button" id="crm-admin-refresh" class="btn-secondary">Liste aktualisieren</button>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Admin-Benutzer</h3>
            <div id="crm-admin-list" class="mt-3 text-sm text-slate-600">Lade…</div>
          </div>
        </div>

        <div id="crm-panel-notes" class="crm-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Interne Notizen</h3>
            <textarea id="crm-notes-only" class="input" rows="6" placeholder="Freitext…">${safe(data.notizen)}</textarea>
            <button type="button" id="crm-notes-save" class="btn-primary">Notizen speichern</button>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Aktivitätsprotokoll</h3>
            <div id="crm-activity-list" class="mt-3 max-h-80 overflow-y-auto">${activitiesHtml}</div>
          </div>
        </div>
      </div>
    `;

    const panels = {
      overview: document.getElementById("crm-panel-overview"),
      instance: document.getElementById("crm-panel-instance"),
      database: document.getElementById("crm-panel-database"),
      domain: document.getElementById("crm-panel-domain"),
      email: document.getElementById("crm-panel-email"),
      finance: document.getElementById("crm-panel-finance"),
      credentials: document.getElementById("crm-panel-credentials"),
      notes: document.getElementById("crm-panel-notes")
    };

    function showCrmTab(which) {
      Object.keys(panels).forEach((k) => {
        if (panels[k]) panels[k].classList.toggle("hidden", k !== which);
      });
      document.querySelectorAll(".crm-tab-btn").forEach((b) => {
        styleCrmTab(b, b.getAttribute("data-crm-tab") === which);
      });
    }

    document.querySelectorAll(".crm-tab-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const tab = b.getAttribute("data-crm-tab");
        showCrmTab(tab);
        if (tab === "instance") refreshInstanceTab();
        if (tab === "database") refreshDatabaseTab();
        if (tab === "domain") refreshDomainSsl();
        if (tab === "credentials") refreshCredentialsTab();
        if (tab === "notes") refreshActivityDom();
      });
    });
    showCrmTab("overview");

    async function refreshActivityDom() {
      const res = await window.api.crmActivityList({ kundenId: id, limit: 120 });
      const rows = Array.isArray(res?.rows) ? res.rows : [];
      const el = document.getElementById("crm-activity-list");
      if (!el) return;
      el.innerHTML = rows.length
        ? rows
            .map(
              (r) => `
          <div class="border-b border-slate-100 py-3 last:border-0">
            <div class="text-xs text-slate-400">${escHtml(formatDateTime(r.created_at))}</div>
            <div class="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">${escHtml(r.kind)}</div>
            <div class="mt-1 text-sm text-slate-800 whitespace-pre-wrap">${escHtml(r.message)}</div>
          </div>`
            )
            .join("")
        : `<div class="text-sm text-slate-500">Noch keine Einträge.</div>`;
    }

    function renderCrmProvisionJob(job) {
      const stepsEl = document.getElementById("crm-prov-steps");
      const secretsEl = document.getElementById("crm-prov-secrets");
      const opEl = document.getElementById("crm-prov-op-id");
      if (!stepsEl) return;
      if (opEl && job?.operationId) opEl.textContent = `operationId: ${job.operationId}`;
      if (job?.status === "running") {
        stepsEl.innerHTML = `<p class="text-slate-600">Läuft auf dem Server…</p>`;
        return;
      }
      const result = job?.result;
      const steps = result?.steps || [];
      if (job?.status === "error") {
        stepsEl.innerHTML = `<p class="text-red-700 font-medium">Fehler: ${escHtml(job.error || "Unbekannt")}</p>`;
      } else if (steps.length) {
        stepsEl.innerHTML = steps
          .map(
            (s) =>
              `<div class="flex gap-2 border-b border-slate-200 py-1.5 last:border-0"><span class="shrink-0">${s.ok ? "✅" : "❌"}</span><div><div class="font-medium text-slate-800">${escHtml(s.label || s.id)}</div>${s.detail ? `<div class="text-xs text-slate-500">${escHtml(String(s.detail))}</div>` : ""}</div></div>`
          )
          .join("");
      } else {
        stepsEl.innerHTML = `<p class="text-slate-500">Noch kein Ergebnis.</p>`;
      }
      if (secretsEl && result?.generatedPasswords && Object.keys(result.generatedPasswords).length) {
        secretsEl.classList.remove("hidden");
        secretsEl.innerHTML =
          `<p class="font-semibold mb-2">Generierte Passwörter (lokal notieren)</p>` +
          Object.entries(result.generatedPasswords)
            .map(([k, v]) => `<div class="font-mono break-all"><strong>${escHtml(k)}:</strong> ${escHtml(String(v))}</div>`)
            .join("");
      } else if (secretsEl) {
        secretsEl.classList.add("hidden");
        secretsEl.innerHTML = "";
      }
      if (result?.warnings?.length) {
        stepsEl.innerHTML += `<div class="mt-3 text-amber-800 text-xs"><strong>Hinweise:</strong><ul class="list-disc pl-4 mt-1">${result.warnings.map((w) => `<li>${escHtml(String(w))}</li>`).join("")}</ul></div>`;
      }
    }

    async function pollCrmProvisionOnce(operationId) {
      const job = await window.api.provisionStatusGet(operationId);
      if (job?.error && !job.status) {
        showToast(job.error, "error");
        return;
      }
      job.operationId = operationId;
      renderCrmProvisionJob(job);
      if (job.status === "ok" || job.status === "error") {
        if (crmProvisionPollTimer) {
          clearInterval(crmProvisionPollTimer);
          crmProvisionPollTimer = null;
        }
        await appendAct("deploy", job.status === "ok" ? "Voll-Deploy abgeschlossen" : `Voll-Deploy fehlgeschlagen: ${job.error || ""}`);
        if (job.status === "ok") {
          showToast("Neukunden-Deploy abgeschlossen", "success");
          // Settings/Branding erst nach erfolgreichem Deploy aus der Zielinstanz holen.
          const refresh = await window.api.kundeRefreshSnapshot(id);
          if (!refresh?.error) {
            await appendAct("snapshot", "Snapshot nach Deploy automatisch geladen");
          }
        }
        else showToast("Neukunden-Deploy fehlgeschlagen", "error");
        await renderDetail(id);
      }
    }

    async function refreshInstanceTab() {
      const elCms = document.getElementById("crm-health-cms");
      const elLp = document.getElementById("crm-health-landing");
      const vCms = document.getElementById("crm-version-cms");
      const vLp = document.getElementById("crm-version-landing");
      const caddyEl = document.getElementById("crm-caddy-status");
      if (domain && elCms) elCms.textContent = "Prüfe…";
      if (landingDomain && elLp) elLp.textContent = "Prüfe…";
      if (caddyEl) caddyEl.textContent = "Lade…";

      if (domain) {
        const h = await window.api.utilityFetchHealth(`https://${domain}/api/health`);
        elCms.textContent = h.ok
          ? `Online (HTTP ${h.status})`
          : h.tlsError
            ? `TLS/Caddy Fehler: ${h.error || "Handshake fehlgeschlagen"}${h.httpFallbackStatus != null ? ` · HTTP-Test: ${h.httpFallbackOk ? "OK" : "Fehler"} (HTTP ${h.httpFallbackStatus})` : ""}`
            : `Offline / Fehler${h.status != null ? ` (HTTP ${h.status})` : ""}: ${h.error || ""}`;
      } else if (elCms) elCms.textContent = "Keine CMS-Domain.";

      if (landingDomain) {
        const h2 = await window.api.utilityFetchHealth(`https://${landingDomain}/`);
        elLp.textContent = h2.ok
          ? `Online (HTTP ${h2.status})`
          : h2.tlsError
            ? `TLS/Caddy Fehler: ${h2.error || "Handshake fehlgeschlagen"}${h2.httpFallbackStatus != null ? ` · HTTP-Test: ${h2.httpFallbackOk ? "OK" : "Fehler"} (HTTP ${h2.httpFallbackStatus})` : ""}`
            : `Offline / Fehler${h2.status != null ? ` (HTTP ${h2.status})` : ""}: ${h2.error || ""}`;
      } else if (elLp) elLp.textContent = "Keine Landing-Domain im CRM.";

      const vs = await window.api.versionsStatus();
      if (!vs?.error && Array.isArray(vs.instances)) {
        const cmsRow = vs.instances.find((i) => i.domain === domain && (i.kind || "cms") !== "landingpage");
        if (vCms) {
          if (cmsRow) {
            vCms.textContent = `Live: ${shortCommit(cmsRow.deployedCommit)} · Staging: ${shortCommit(cmsRow.stagingCommit)}${cmsRow.sameAsStaging ? " (gleich)" : ""}`;
          } else if (domain) {
            vCms.textContent = "Keine CMS-Instanz mit dieser Domain in instances.json (Voll-Deploy oder Eintrag prüfen).";
          }
        }
        const lpRow = landingDomain ? vs.instances.find((i) => i.domain === landingDomain) : null;
        if (vLp) {
          if (lpRow) {
            vLp.textContent = `Live: ${shortCommit(lpRow.deployedCommit)} · Staging: ${shortCommit(lpRow.stagingCommit)}${lpRow.sameAsStaging ? " (gleich)" : ""}`;
          } else if (landingDomain) {
            vLp.textContent = "Keine Landing-Instanz mit dieser Domain in landing-instances.json.";
          }
        }
      }

      const hosts = [domain, landingDomain].filter(Boolean);
      const ch = await window.api.caddyHasHosts(hosts);
      if (caddyEl) {
        if (ch?.error) caddyEl.textContent = `Caddyfile: ${ch.error}`;
        else if (ch?.presence) {
          const parts = hosts.map((h) => `${h}: ${ch.presence[h] ? "Eintrag gefunden" : "nicht im Caddyfile"}`);
          caddyEl.textContent = parts.join(" · ");
        } else caddyEl.textContent = "—";
      }
    }

    async function refreshDatabaseTab() {
      const sizeEl = document.getElementById("crm-db-size");
      const listEl = document.getElementById("crm-backup-list");
      const legacyHint =
        "Der Update-Server scheint noch ohne die neuen /instance-Endpunkte zu laufen. Bitte den update-server neu deployen/restarten.";
      if (!hasInstanceBackupApi) {
        if (sizeEl) sizeEl.textContent = legacyHint;
        if (listEl) listEl.textContent = legacyHint;
        return;
      }
      if (!domain) {
        if (sizeEl) sizeEl.textContent = "—";
        if (listEl) listEl.textContent = "Keine Domain.";
        return;
      }
      if (sizeEl) sizeEl.textContent = "Lade…";
      const ds = await window.api.instanceDbSize(domain);
      if (sizeEl) {
        if (ds?.error) {
          if (String(ds.error).includes("Cannot GET /instance/db-size")) {
            sizeEl.textContent = legacyHint;
          } else {
            sizeEl.textContent = ds.error;
          }
        }
        else sizeEl.textContent = fmtBytes(ds.bytes);
      }
      if (listEl) listEl.innerHTML = "Lade…";
      const bl = await window.api.instanceBackupsList(domain);
      if (!listEl) return;
      if (bl?.error) {
        if (String(bl.error).includes("Cannot GET /instance/backups")) {
          listEl.textContent = legacyHint;
        } else {
          listEl.textContent = bl.error;
        }
        return;
      }
      const files = Array.isArray(bl.files) ? bl.files : [];
      if (!files.length) {
        listEl.innerHTML = `<p class="text-slate-500">Noch keine Backups.</p>`;
        return;
      }
      listEl.innerHTML = `<div class="space-y-2">${files
        .map(
          (f) => `
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <div class="font-mono text-xs">${escHtml(f.name)}</div>
            <div class="text-xs text-slate-500">${formatDateTime(f.mtime)} · ${fmtBytes(f.size)}</div>
          </div>
          <button type="button" class="btn-secondary text-xs crm-dl-backup" data-file="${escHtml(f.name)}">Herunterladen</button>
        </div>`
        )
        .join("")}</div>`;
      listEl.querySelectorAll(".crm-dl-backup").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const file = btn.getAttribute("data-file");
          const r = await window.api.instanceBackupDownload({ domain, file });
          if (r?.error) showToast(r.error, "error");
          else if (r?.cancelled) showToast("Abgebrochen", "info");
          else {
            showToast("Backup gespeichert", "success");
            await appendAct("backup", `Download: ${file}`);
            await refreshActivityDom();
          }
        });
      });
    }

    async function refreshDomainSsl() {
      const a = document.getElementById("crm-ssl-cms");
      const b = document.getElementById("crm-ssl-landing");
      if (domain && a) {
        a.textContent = "Lade…";
        const t = await window.api.utilityTlsExpiry(domain);
        a.textContent = t.validTo ? `CMS: Zertifikat gültig bis ${t.validTo}` : `CMS: ${t.error || "—"}`;
      }
      if (landingDomain && b) {
        b.textContent = "Lade…";
        const t2 = await window.api.utilityTlsExpiry(landingDomain);
        b.textContent = t2.validTo ? `Landing: Zertifikat gültig bis ${t2.validTo}` : `Landing: ${t2.error || "—"}`;
      }
    }

    function generatePassword(len = 14) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*+-_";
      let out = "";
      for (let i = 0; i < len; i += 1) {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
      return out;
    }

    async function refreshCredentialsTab() {
      const listEl = document.getElementById("crm-admin-list");
      if (!listEl) return;
      listEl.innerHTML = `<p class="text-slate-500">Lade…</p>`;
      const res = await window.api.crmAdminUsersList({ kundenId: id });
      if (res?.error) {
        listEl.innerHTML = `<p class="text-red-700">${escHtml(res.error)}</p>`;
        return;
      }
      const rows = Array.isArray(res?.rows) ? res.rows : [];
      const liveAdminEmail = String(snap?.email || "").trim().toLowerCase();
      const hasLiveInLocal = liveAdminEmail && rows.some((u) => String(u.email || "").trim().toLowerCase() === liveAdminEmail);
      if (!rows.length && !liveAdminEmail) {
        listEl.innerHTML = `<p class="text-slate-500">Noch keine Admin-Benutzer hinterlegt.</p>`;
        return;
      }
      const mergedRows = [...rows];
      if (liveAdminEmail && !hasLiveInLocal) {
        mergedRows.unshift({
          id: `live-${liveAdminEmail}`,
          email: liveAdminEmail,
          role: "ADMIN",
          note: "Aus Live-Instanz (Settings Snapshot)",
          updated_at: new Date().toISOString(),
          isSystemLive: true
        });
      }
      listEl.innerHTML = mergedRows
        .map(
          (u) => `
          <div class="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-semibold text-slate-900 break-all">${escHtml(u.email || "—")}</div>
                <div class="text-xs text-slate-500">Rolle: ${escHtml(u.role || "ADMIN")} · Zuletzt geändert: ${escHtml(formatDateTime(u.updated_at))}</div>
                ${u.note ? `<div class="mt-1 text-xs text-slate-600">${escHtml(u.note)}</div>` : ""}
              </div>
              ${
                u.isSystemLive
                  ? `<button type="button" class="btn-secondary crm-admin-adopt" data-email="${escHtml(u.email)}">Als lokalen Eintrag übernehmen</button>`
                  : `<button type="button" class="btn-secondary !border-red-300 !text-red-700 hover:!bg-red-50 crm-admin-delete" data-id="${u.id}">Löschen</button>`
              }
            </div>
            ${
              u.isSystemLive
                ? `<div class="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Passwortänderung direkt für Live-Instanz folgt als API-Anbindung. Aktuell bitte im CMS selbst ändern oder als lokalen Eintrag übernehmen.</div>`
                : `<div class="mt-3 flex flex-wrap items-center gap-2">
                    <input class="input !h-9 !py-1.5 text-sm crm-admin-new-pass" data-id="${u.id}" placeholder="Neues Passwort" />
                    <button type="button" class="btn-secondary crm-admin-pass-generate" data-id="${u.id}">Generieren</button>
                    <button type="button" class="btn-primary crm-admin-pass-save" data-id="${u.id}">Passwort ändern</button>
                  </div>`
            }
          </div>
        `
        )
        .join("");

      listEl.querySelectorAll(".crm-admin-adopt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const email = btn.getAttribute("data-email") || "";
          const emailInput = document.getElementById("crm-admin-email");
          if (emailInput) emailInput.value = email;
          const pwInput = document.getElementById("crm-admin-password");
          if (pwInput && !pwInput.value) pwInput.value = generatePassword();
          const noteInput = document.getElementById("crm-admin-note");
          if (noteInput && !noteInput.value) noteInput.value = "Aus Live-Instanz übernommen";
          showToast("E-Mail ins Formular übernommen", "info");
        });
      });

      listEl.querySelectorAll(".crm-admin-pass-generate").forEach((btn) => {
        btn.addEventListener("click", () => {
          const uid = btn.getAttribute("data-id");
          const input = listEl.querySelector(`.crm-admin-new-pass[data-id="${uid}"]`);
          if (input) input.value = generatePassword();
        });
      });
      listEl.querySelectorAll(".crm-admin-pass-save").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const uid = Number(btn.getAttribute("data-id"));
          const input = listEl.querySelector(`.crm-admin-new-pass[data-id="${uid}"]`);
          const newPass = (input?.value || "").trim();
          if (!newPass) {
            showToast("Bitte neues Passwort eingeben", "error");
            return;
          }
          btn.disabled = true;
          const r = await window.api.crmAdminUserPasswordSet({ id: uid, password: newPass });
          btn.disabled = false;
          if (r?.error) {
            showToast(`Fehler: ${r.error}`, "error");
            return;
          }
          showToast("Passwort aktualisiert", "success");
          await appendAct("zugang", `Admin-Passwort geändert (${uid})`);
          await refreshActivityDom();
          await refreshCredentialsTab();
        });
      });
      listEl.querySelectorAll(".crm-admin-delete").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const uid = Number(btn.getAttribute("data-id"));
          if (!window.confirm("Admin-Benutzer wirklich löschen?")) return;
          btn.disabled = true;
          const r = await window.api.crmAdminUserDelete({ id: uid });
          btn.disabled = false;
          if (r?.error) {
            showToast(`Fehler: ${r.error}`, "error");
            return;
          }
          showToast("Admin-Benutzer gelöscht", "success");
          await appendAct("zugang", `Admin-Benutzer gelöscht (${uid})`);
          await refreshActivityDom();
          await refreshCredentialsTab();
        });
      });
    }

    document.getElementById("crm-back").addEventListener("click", async () => {
      if (crmProvisionPollTimer) {
        clearInterval(crmProvisionPollTimer);
        crmProvisionPollTimer = null;
      }
      selectedId = null;
      await renderList();
    });

    document.getElementById("crm-refresh-snap").addEventListener("click", async () => {
      const btn = document.getElementById("crm-refresh-snap");
      btn.disabled = true;
      const r = await window.api.kundeRefreshSnapshot(id);
      btn.disabled = false;
      if (r?.error) showToast(`Fehler: ${r.error}`, "error");
      else {
        showToast("Snapshot aktualisiert", "success");
        await appendAct("snapshot", "Snapshot aus Instanz aktualisiert");
        await renderDetail(id);
      }
    });

    document.getElementById("crm-import").addEventListener("click", async () => {
      const btn = document.getElementById("crm-import");
      btn.disabled = true;
      const r = await window.api.kundeImportSettings(id);
      btn.disabled = false;
      if (r?.error) showToast(`Fehler: ${r.error}`, "error");
      else if (r?.success) showToast("Settings importiert", "success");
      else showToast("Import abgeschlossen", "success");
      await appendAct("import", "Settings in Instanz importiert");
      await renderDetail(id);
    });

    const adoptBtn = document.getElementById("crm-adopt-domain");
    if (adoptBtn) {
      adoptBtn.addEventListener("click", async () => {
        adoptBtn.disabled = true;
        const r = await window.api.kundeAdoptDomainToSettings(id);
        adoptBtn.disabled = false;
        if (r?.error) showToast(`Fehler: ${r.error}`, "error");
        else if (r?.success) showToast("Domain übernommen und importiert", "success");
        else showToast("Domain übernommen", "success");
        await appendAct("domain", "CRM-Domain in Restaurant-Settings übernommen");
        await renderDetail(id);
      });
    }

    const viewEl = document.getElementById("kontakt-view");
    const formEl = document.getElementById("kontakt-edit-form");
    const editBtn = document.getElementById("kontakt-edit");
    if (editBtn && viewEl && formEl) {
      editBtn.addEventListener("click", () => {
        viewEl.classList.add("hidden");
        formEl.classList.remove("hidden");
      });
      document.getElementById("kontakt-cancel").addEventListener("click", () => {
        formEl.classList.add("hidden");
        viewEl.classList.remove("hidden");
      });
      document.getElementById("kontakt-save").addEventListener("click", async () => {
        const payload = {
          id,
          name: document.getElementById("k-name").value,
          email: document.getElementById("k-email").value,
          telefon: document.getElementById("k-telefon").value,
          adresse: document.getElementById("k-adresse").value,
          notizen: document.getElementById("k-notizen").value
        };
        const btn = document.getElementById("kontakt-save");
        btn.disabled = true;
        const r = await window.api.kundeUpdate(payload);
        btn.disabled = false;
        if (r?.error) showToast(`Fehler: ${r.error}`, "error");
        else {
          showToast("Kontaktdaten gespeichert", "success");
          await appendAct("kontakt", "Kontaktdaten geändert");
          await renderDetail(id);
        }
      });
    }

    document.getElementById("crm-notes-save")?.addEventListener("click", async () => {
      const txt = document.getElementById("crm-notes-only")?.value ?? "";
      const btn = document.getElementById("crm-notes-save");
      btn.disabled = true;
      const r = await window.api.kundeUpdate({ id, notizen: txt });
      btn.disabled = false;
      if (r?.error) showToast(`Fehler: ${r.error}`, "error");
      else {
        showToast("Notizen gespeichert", "success");
        await appendAct("notizen", "Notizen aktualisiert");
        await renderDetail(id);
      }
    });

    document.getElementById("crm-admin-generate")?.addEventListener("click", () => {
      const input = document.getElementById("crm-admin-password");
      if (input) input.value = generatePassword();
    });

    document.getElementById("crm-admin-refresh")?.addEventListener("click", async () => {
      await refreshCredentialsTab();
    });

    document.getElementById("crm-admin-create")?.addEventListener("click", async () => {
      const email = document.getElementById("crm-admin-email")?.value?.trim() || "";
      const password = document.getElementById("crm-admin-password")?.value?.trim() || "";
      const role = document.getElementById("crm-admin-role")?.value?.trim() || "ADMIN";
      const note = document.getElementById("crm-admin-note")?.value?.trim() || "";
      if (!email || !password) {
        showToast("E-Mail und Passwort sind Pflichtfelder", "error");
        return;
      }
      const btn = document.getElementById("crm-admin-create");
      btn.disabled = true;
      const r = await window.api.crmAdminUserCreate({ kundenId: id, email, password, role, note });
      btn.disabled = false;
      if (r?.error) {
        showToast(`Fehler: ${r.error}`, "error");
        return;
      }
      showToast("Admin-Benutzer erstellt", "success");
      await appendAct("zugang", `Admin-Benutzer erstellt (${email})`);
      await refreshActivityDom();
      document.getElementById("crm-admin-email").value = "";
      document.getElementById("crm-admin-password").value = "";
      document.getElementById("crm-admin-note").value = "";
      await refreshCredentialsTab();
    });

    document.getElementById("crm-dom-save")?.addEventListener("click", async () => {
      const payload = {
        id,
        restaurant: document.getElementById("crm-dom-restaurant")?.value?.trim(),
        domain: document.getElementById("crm-dom-cms")?.value?.trim(),
        landingpage_domain: document.getElementById("crm-dom-landing")?.value?.trim() || ""
      };
      const btn = document.getElementById("crm-dom-save");
      btn.disabled = true;
      const r = await window.api.kundeUpdate(payload);
      btn.disabled = false;
      if (r?.error) showToast(`Fehler: ${r.error}`, "error");
      else {
        showToast("Domains gespeichert", "success");
        await appendAct("domain", "CRM-Domains/Restaurantname geändert");
        await renderDetail(id);
      }
    });

    document.getElementById("crm-delete-restaurant")?.addEventListener("click", async () => {
      const withInstances = window.confirm(
        "Sollen zusätzlich die Instanzen am Server gelöscht werden?\n\nOK = CRM + Instanzen löschen\nAbbrechen = nur CRM-Eintrag löschen"
      );
      const finalConfirm = window.confirm(
        withInstances
          ? "Wirklich endgültig löschen? (CRM-Eintrag + Instanzen)"
          : "Wirklich endgültig löschen? (nur CRM-Eintrag)"
      );
      if (!finalConfirm) return;

      const btn = document.getElementById("crm-delete-restaurant");
      btn.disabled = true;
      const r = await window.api.kundeDelete({ id, deleteInstances: withInstances });
      btn.disabled = false;
      if (r?.error) {
        showToast(`Fehler: ${r.error}`, "error");
        return;
      }
      if (Array.isArray(r?.warnings) && r.warnings.length) {
        showToast(`Gelöscht (mit Hinweis): ${r.warnings[0]}`, "info");
      } else {
        showToast("Restaurant entfernt", "success");
      }
      selectedId = null;
      await renderList();
    });

    async function runInstanceAction(kind, dom) {
      if (!dom) return;
      const operationId = newOperationId();
      activeDeployOperationId = operationId;
      renderDeployLog();
      if (kind === "restart") {
        const r = await window.api.instanceRestart({ domain: dom, operationId });
        const err = handleResult(r);
        if (err) {
          showToast(`Fehler: ${err}`, "error");
          activeDeployOperationId = null;
          renderDeployLog();
          await appendAct(kind, `${kind} ${dom}: Fehler ${err}`);
        } else {
          showToast(`Restart für ${dom} abgeschlossen`, "success");
          await appendAct(kind, `${kind} ${dom} (operationId ${operationId.slice(0, 8)}…)`);
        }
        await refreshActivityDom();
        return;
      }

      const list = await window.api.instancesList();
      const rows = Array.isArray(list) ? list : [];
      const exists = rows.some((i) => String(i.domain || "").trim() === dom);

      if (exists) {
        const r = await window.api.instanceUpdate({ domain: dom, operationId });
        const err = handleResult(r);
        if (err) {
          showToast(`Fehler: ${err}`, "error");
          activeDeployOperationId = null;
          renderDeployLog();
          await appendAct(kind, `${kind} ${dom}: Fehler ${err}`);
        } else {
          showToast(`Deploy/Update für ${dom} abgeschlossen`, "success");
          await appendAct(kind, `${kind} ${dom} (operationId ${operationId.slice(0, 8)}…)`);
        }
        await refreshActivityDom();
        return;
      }

      // Keine vorhandene Instanz: Provisionierung (echte Neuinstallation inkl. Caddy/DNS/Mailcow).
      const isLanding = dom === landingDomain;
      const payload = {
        target: isLanding ? "landingpage" : "cms",
        operationId,
        domainCms: isLanding ? undefined : domain,
        domainLanding: isLanding ? landingDomain : undefined,
        restaurantName: (data.restaurant || "").trim() || undefined,
        mailApex: (document.getElementById("crm-prov-mail-apex")?.value || "").trim() || undefined,
        mailboxLocalPart: (document.getElementById("crm-prov-mailbox-local")?.value || "info").trim() || "info",
        skipDns: false,
        skipMailcow: false,
        skipCaddyReload: false
      };
      const r = await window.api.provisionDeploy(payload);
      const err = handleResult(r);
      if (err) {
        showToast(`Provision-Fehler: ${err}`, "error");
        activeDeployOperationId = null;
        renderDeployLog();
        await appendAct("provision", `Neuinstallation ${dom}: Fehler ${err}`);
        await refreshActivityDom();
        return;
      }
      lastProvisionOperationId = operationId;
      showToast(`Neuinstallation für ${dom} gestartet`, "success");
      await appendAct("provision", `Neuinstallation ${dom} gestartet (${operationId.slice(0, 8)}…)`);
      await refreshActivityDom();
      if (crmProvisionPollTimer) clearInterval(crmProvisionPollTimer);
      crmProvisionPollTimer = setInterval(() => pollCrmProvisionOnce(operationId), 2500);
      pollCrmProvisionOnce(operationId);
    }

    document.getElementById("crm-deploy-cms")?.addEventListener("click", async () => {
      if (!domain || !window.confirm(`CMS-Update für ${domain} starten?`)) return;
      await runInstanceAction("deploy", domain);
    });
    document.getElementById("crm-restart-cms")?.addEventListener("click", async () => {
      if (!domain || !window.confirm(`CMS-Restart für ${domain}?`)) return;
      await runInstanceAction("restart", domain);
    });
    document.getElementById("crm-rebuild-cms")?.addEventListener("click", async () => {
      if (!domain || !window.confirm(`CMS-Rebuild/Deploy für ${domain}?`)) return;
      await runInstanceAction("deploy", domain);
    });
    document.getElementById("crm-deploy-lp")?.addEventListener("click", async () => {
      if (!landingDomain || !window.confirm(`Landing-Deploy für ${landingDomain}?`)) return;
      await runInstanceAction("deploy", landingDomain);
    });
    document.getElementById("crm-restart-lp")?.addEventListener("click", async () => {
      if (!landingDomain || !window.confirm(`Landing-Restart für ${landingDomain}?`)) return;
      await runInstanceAction("restart", landingDomain);
    });

    document.getElementById("crm-prov-start")?.addEventListener("click", async () => {
      const target = document.getElementById("crm-prov-target")?.value || "both";
      const domainCms = document.getElementById("crm-prov-domain-cms")?.value?.trim() || "";
      const domainLanding = document.getElementById("crm-prov-domain-landing")?.value?.trim() || "";
      const restaurantName = document.getElementById("crm-prov-restaurant")?.value?.trim() || "";
      const mailApex = document.getElementById("crm-prov-mail-apex")?.value?.trim() || "";
      const mailboxLocalPart = document.getElementById("crm-prov-mailbox-local")?.value?.trim() || "info";
      if ((target === "cms" || target === "both") && !domainCms) {
        showToast("Domain Gastro CMS fehlt", "error");
        return;
      }
      if ((target === "landingpage" || target === "both") && !domainLanding) {
        showToast("Domain LandingPage fehlt", "error");
        return;
      }
      if (!window.confirm("Neukunden-Deploy auf dem Server starten? DNS/Mail/Container/Caddy werden geändert.")) return;

      const operationId = newOperationId();
      lastProvisionOperationId = operationId;
      activeDeployOperationId = operationId;
      renderDeployLog();
      if (crmProvisionPollTimer) clearInterval(crmProvisionPollTimer);
      const stepsEl = document.getElementById("crm-prov-steps");
      if (stepsEl) stepsEl.innerHTML = `<p class="text-slate-600">Starte…</p>`;
      document.getElementById("crm-prov-op-id").textContent = `operationId: ${operationId}`;

      const payload = {
        target,
        operationId,
        domainCms: domainCms || undefined,
        domainLanding: domainLanding || undefined,
        restaurantName: restaurantName || undefined,
        mailApex: mailApex || undefined,
        mailboxLocalPart,
        skipDns: !!document.getElementById("crm-prov-skip-dns")?.checked,
        skipMailcow: !!document.getElementById("crm-prov-skip-mailcow")?.checked,
        skipCaddyReload: !!document.getElementById("crm-prov-skip-caddy-reload")?.checked
      };
      const result = await window.api.provisionDeploy(payload);
      const err = handleResult(result);
      if (err) {
        showToast(`Fehler: ${err}`, "error");
        activeDeployOperationId = null;
        renderDeployLog();
        return;
      }
      await appendAct("deploy", `Voll-Deploy gestartet (${operationId.slice(0, 8)}…)`);
      await refreshActivityDom();
      showToast(`Deploy gestartet (${operationId.slice(0, 8)}…)`, "success");
      crmProvisionPollTimer = setInterval(() => pollCrmProvisionOnce(operationId), 2500);
      pollCrmProvisionOnce(operationId);
    });

    document.getElementById("crm-prov-refresh")?.addEventListener("click", async () => {
      if (!lastProvisionOperationId) {
        showToast("Noch kein Voll-Deploy gestartet", "error");
        return;
      }
      await pollCrmProvisionOnce(lastProvisionOperationId);
    });

    document.getElementById("crm-prov-infra")?.addEventListener("click", async () => {
      const domainCms = document.getElementById("crm-prov-domain-cms")?.value?.trim() || "";
      const domainLanding = document.getElementById("crm-prov-domain-landing")?.value?.trim() || "";
      const restaurantName = document.getElementById("crm-prov-restaurant")?.value?.trim() || "";
      const mailApex = document.getElementById("crm-prov-mail-apex")?.value?.trim() || "";
      const mailboxLocalPart = document.getElementById("crm-prov-mailbox-local")?.value?.trim() || "info";
      if (!domainCms && !domainLanding) {
        showToast("Mindestens eine Domain (CMS oder Landing) angeben", "error");
        return;
      }
      if (!window.confirm("DNS + Mailcow für diesen Kunden nachträglich anlegen/aktualisieren? (ohne Instanz-Neudeploy)")) return;

      const operationId = newOperationId();
      lastProvisionOperationId = operationId;
      activeDeployOperationId = operationId;
      renderDeployLog();
      if (crmProvisionPollTimer) clearInterval(crmProvisionPollTimer);
      const stepsEl = document.getElementById("crm-prov-steps");
      if (stepsEl) stepsEl.innerHTML = `<p class="text-slate-600">Starte DNS/Mail-Backfill…</p>`;
      document.getElementById("crm-prov-op-id").textContent = `operationId: ${operationId}`;

      const payload = {
        target: "infra",
        operationId,
        domainCms: domainCms || undefined,
        domainLanding: domainLanding || undefined,
        restaurantName: restaurantName || undefined,
        mailApex: mailApex || undefined,
        mailboxLocalPart,
        skipDns: !!document.getElementById("crm-prov-skip-dns")?.checked,
        skipMailcow: !!document.getElementById("crm-prov-skip-mailcow")?.checked,
        skipCaddyReload: true
      };
      const result = await window.api.provisionDeploy(payload);
      const err = handleResult(result);
      if (err) {
        showToast(`Fehler: ${err}`, "error");
        activeDeployOperationId = null;
        renderDeployLog();
        return;
      }
      await appendAct("infra", `DNS/Mail-Backfill gestartet (${operationId.slice(0, 8)}…)`);
      await refreshActivityDom();
      showToast(`DNS/Mail-Backfill gestartet (${operationId.slice(0, 8)}…)`, "success");
      crmProvisionPollTimer = setInterval(() => pollCrmProvisionOnce(operationId), 2500);
      pollCrmProvisionOnce(operationId);
    });

    document.getElementById("crm-backup-now")?.addEventListener("click", async () => {
      if (!domain) return;
      const btn = document.getElementById("crm-backup-now");
      btn.disabled = true;
      const r = await window.api.instanceBackupCreate({ domain });
      btn.disabled = false;
      const err = handleResult(r);
      if (err) showToast(err, "error");
      else {
        showToast("Backup erstellt", "success");
        await appendAct("backup", `Backup erstellt: ${r.file || "ok"}`);
        await refreshDatabaseTab();
        await refreshActivityDom();
      }
    });

    document.getElementById("crm-backup-refresh")?.addEventListener("click", () => refreshDatabaseTab());
  }

  async function renderStagingProfile() {
    const settings = await window.api.settingsGet();
    const stagingUrl = (settings?.["staging-url"] || "https://test.restaurant-lieferservice.online").replace(/\/$/, "");
    const [versions, status] = await Promise.all([window.api.versionsStatus(), window.api.statusGet()]);
    const staging = versions?.staging || {};
    const landingStaging = versions?.landingStaging || {};

    content.innerHTML = `
      ${topHeader("CRM", "Staging-Profil — wie Restaurantprofil")}
      <div class="max-w-6xl space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-4 min-w-0">
              <div class="h-12 w-12 rounded-2xl border border-brand-200 bg-brand-50 text-brand-700 font-black flex items-center justify-center">ST</div>
              <div class="min-w-0">
                <div class="text-xl font-extrabold text-slate-900 truncate">Staging Umgebung</div>
                <div class="mt-1 text-sm text-slate-500 break-all">${safe(stagingUrl)}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button id="crm-staging-back" type="button" class="btn-secondary">← Zurück</button>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Rollout aktiv: <span class="font-semibold">${status?.rolloutInProgress ? "Ja" : "Nein"}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button type="button" class="crm-tab-btn" data-staging-tab="overview">Übersicht</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="instance">Instanz &amp; Deploy</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="database">Datenbank &amp; Backups</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="email">E-Mail &amp; Benachrichtigungen</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="finance">Finanzen</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="credentials">Zugangsdaten</button>
          <button type="button" class="crm-tab-btn" data-staging-tab="notes">Notizen &amp; Protokoll</button>
        </div>

        <div id="staging-panel-overview" class="staging-tab-panel space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">CMS Staging</h3>
              <div class="mt-3 space-y-2 text-sm">
                <div><span class="text-slate-500">Branch:</span> <span class="font-mono">${safe(staging?.branch || "—")}</span></div>
                <div><span class="text-slate-500">Commit:</span> <span class="font-mono">${safe(staging?.commit || "—")}</span></div>
                <div><span class="text-slate-500">Deploy-Zeit:</span> ${safe(formatDateTime(staging?.deployedAt))}</div>
                <div><span class="text-slate-500">Container:</span> ${staging?.containerRunning ? "Läuft" : "Unbekannt/steht"}</div>
              </div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Landing Staging</h3>
              <div class="mt-3 space-y-2 text-sm">
                <div><span class="text-slate-500">Branch:</span> <span class="font-mono">${safe(landingStaging?.branch || "—")}</span></div>
                <div><span class="text-slate-500">Commit:</span> <span class="font-mono">${safe(landingStaging?.commit || "—")}</span></div>
                <div><span class="text-slate-500">Deploy-Zeit:</span> ${safe(formatDateTime(landingStaging?.deployedAt))}</div>
                <div><span class="text-slate-500">Container:</span> ${landingStaging?.containerRunning ? "Läuft" : "Unbekannt/steht"}</div>
              </div>
            </div>
          </div>
        </div>

        <div id="staging-panel-instance" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Deploy Aktionen</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <button id="crm-staging-deploy-cms" type="button" class="btn-primary">Staging Deploy CMS</button>
              <button id="crm-staging-deploy-both" type="button" class="btn-secondary">Staging Deploy Beide</button>
              <button id="crm-staging-migrate" type="button" class="btn-secondary">Prisma migrate Staging</button>
            </div>
            <p class="mt-2 text-xs text-slate-500">Wie im Restaurantprofil, aber auf Staging bezogen.</p>
          </div>
        </div>

        <div id="staging-panel-database" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Datenbank &amp; Backups</h3>
            <p>Staging-DB Operationen über Update-Server.</p>
            <div class="flex flex-wrap gap-2">
              <button id="crm-staging-migrate-2" type="button" class="btn-primary">Prisma migrate Staging</button>
              <button id="crm-staging-deploy-migrate-cms" type="button" class="btn-secondary">Deploy CMS + Migrations</button>
              <button id="crm-staging-deploy-migrate-both" type="button" class="btn-secondary">Deploy Beide + CMS Migrations</button>
            </div>
          </div>
        </div>

        <div id="staging-panel-email" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">E-Mail &amp; Benachrichtigungen</h3>
            <p>Lokale Konfiguration für Staging-Mails im Control Center.</p>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">SMTP Host</label>
                <input id="stg-smtp-host" class="input" value="${safe(settings?.["staging-smtp-host"] || "")}" placeholder="mail.example.at" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">SMTP User</label>
                <input id="stg-smtp-user" class="input" value="${safe(settings?.["staging-smtp-user"] || "")}" placeholder="info@example.at" />
              </div>
            </div>
            <button id="stg-smtp-save" type="button" class="btn-primary">E-Mail Einstellungen speichern</button>
          </div>
        </div>

        <div id="staging-panel-finance" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Finanzen</h3>
            <p class="mt-2">Gesamtüberblick aus CRM-Dashboard (nur Referenz):</p>
            <p id="stg-finance-kpis" class="mt-2 text-slate-800">Lade…</p>
          </div>
        </div>

        <div id="staging-panel-credentials" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Zugangsdaten</h3>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">E-Mail</label>
                <input id="stg-cred-email" class="input" placeholder="admin@staging.local" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Rolle</label>
                <select id="stg-cred-role" class="input">
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                </select>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Passwort</label>
              <input id="stg-cred-password" class="input" placeholder="mindestens 6 Zeichen" />
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="stg-cred-generate" type="button" class="btn-secondary">Passwort generieren</button>
              <button id="stg-cred-create" type="button" class="btn-primary">Zugang anlegen</button>
              <button id="stg-cred-refresh" type="button" class="btn-secondary">Liste aktualisieren</button>
            </div>
            <div id="stg-cred-list" class="rounded-xl border border-slate-200 bg-slate-50 p-3">Lade…</div>
          </div>
        </div>

        <div id="staging-panel-notes" class="staging-tab-panel hidden space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700">Notizen &amp; Protokoll</h3>
            <textarea id="stg-notes" class="input" rows="5" placeholder="Staging-Notizen..."></textarea>
            <div class="flex flex-wrap gap-2">
              <button id="stg-notes-save" type="button" class="btn-primary">Notizen speichern</button>
              <button id="stg-activity-refresh" type="button" class="btn-secondary">Protokoll aktualisieren</button>
            </div>
            <div id="stg-activity-list" class="rounded-xl border border-slate-200 bg-slate-50 p-3">Lade…</div>
          </div>
        </div>
      </div>
    `;

    function styleStagingTab(btn, active) {
      if (!btn) return;
      btn.className = active
        ? "crm-tab-btn rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 sm:text-sm"
        : "crm-tab-btn rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm";
    }
    const panels = {
      overview: document.getElementById("staging-panel-overview"),
      instance: document.getElementById("staging-panel-instance"),
      database: document.getElementById("staging-panel-database"),
      email: document.getElementById("staging-panel-email"),
      finance: document.getElementById("staging-panel-finance"),
      credentials: document.getElementById("staging-panel-credentials"),
      notes: document.getElementById("staging-panel-notes")
    };
    function showStagingTab(which) {
      Object.keys(panels).forEach((k) => {
        if (panels[k]) panels[k].classList.toggle("hidden", k !== which);
      });
      document.querySelectorAll(".crm-tab-btn[data-staging-tab]").forEach((b) => {
        styleStagingTab(b, b.getAttribute("data-staging-tab") === which);
      });
    }
    document.querySelectorAll(".crm-tab-btn[data-staging-tab]").forEach((b) => {
      b.addEventListener("click", () => showStagingTab(b.getAttribute("data-staging-tab")));
    });
    showStagingTab("overview");

    function generateStagingPassword(len = 14) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*+-_";
      let out = "";
      for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    }

    async function appendStagingActivity(kind, message) {
      await window.api.stagingActivityAppend({ kind, message }).catch(() => {});
    }

    async function refreshStagingActivity() {
      const el = document.getElementById("stg-activity-list");
      if (!el) return;
      const res = await window.api.stagingActivityList();
      const rows = Array.isArray(res?.rows) ? res.rows : [];
      el.innerHTML = rows.length
        ? rows
            .map(
              (r) => `<div class="border-b border-slate-200 py-2 last:border-0">
                <div class="text-[11px] text-slate-400">${escHtml(formatDateTime(r.created_at))}</div>
                <div class="text-[11px] font-bold uppercase tracking-wide text-slate-500">${escHtml(r.kind)}</div>
                <div class="text-sm text-slate-800 whitespace-pre-wrap">${escHtml(r.message)}</div>
              </div>`
            )
            .join("")
        : `<p class="text-slate-500 text-sm">Noch keine Einträge.</p>`;
    }

    async function refreshStagingCredentials() {
      const listEl = document.getElementById("stg-cred-list");
      if (!listEl) return;
      listEl.innerHTML = "Lade…";
      const withTimeout = (promise, ms, label) =>
        Promise.race([
          promise,
          new Promise((resolve) => setTimeout(() => resolve({ error: `${label} Timeout` }), ms))
        ]);
      const renderCredentialsList = (res, liveRes = {}) => {
        if (res?.error && !liveRes?.profile?.email) {
          listEl.innerHTML = `<p class="text-red-700">${escHtml(res.error)}</p>`;
          return;
        }
        const rows = Array.isArray(res?.rows) ? res.rows : [];
        const liveEmail = String(liveRes?.profile?.email || "").trim().toLowerCase();
        const hasLive = liveEmail && rows.some((r) => String(r.email || "").trim().toLowerCase() === liveEmail);
        const merged = [...rows];
        if (liveEmail && !hasLive) {
          merged.unshift({
            id: `live-${liveEmail}`,
            email: liveEmail,
            role: "ADMIN",
            note: `Live aus Staging (${liveRes?.source || "source unbekannt"})`,
            isLive: true
          });
        }
        if (!merged.length) {
          listEl.innerHTML = `<p class="text-slate-500 text-sm">Noch keine Zugänge hinterlegt.</p>`;
          return;
        }
        listEl.innerHTML = merged
          .map(
            (u) => {
              const isProtected = !!u.isLive || !!u.isMainAdmin || String(u.id || "") === "main";
              return `<div class="mb-2 rounded-lg border border-slate-200 bg-white p-2">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div class="font-semibold text-slate-900 break-all">${escHtml(u.email)}</div>
                <div class="text-xs text-slate-500">Rolle: ${escHtml(u.role || "ADMIN")}${u.isLive ? " · Live-Instanz" : ""}</div>
                ${u.note ? `<div class="text-xs text-slate-500">${escHtml(u.note)}</div>` : ""}
              </div>
              ${
                isProtected
                  ? `<button class="btn-secondary stg-cred-adopt" data-email="${escHtml(u.email)}">${u.isLive ? "Übernehmen" : "Geschützt"}</button>`
                  : `<button class="btn-secondary !border-red-300 !text-red-700 stg-cred-delete" data-id="${escHtml(u.id)}" data-email="${escHtml(u.email)}">Löschen</button>`
              }
            </div>
            ${
              isProtected
                ? `<div class="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">${u.isLive ? "Live-User erkannt. Passwort lokal übernehmen oder direkt in Staging ändern." : "Hauptadmin ist geschützt und kann nicht gelöscht werden."}</div>`
                : `<div class="mt-2 flex flex-wrap gap-2">
                    <input class="input !h-9 !py-1.5 text-sm stg-cred-new-pass" data-id="${escHtml(u.id)}" data-email="${escHtml(u.email)}" placeholder="Neues Passwort" />
                    <button class="btn-secondary stg-cred-pass-gen" data-id="${escHtml(u.id)}" data-email="${escHtml(u.email)}">Generieren</button>
                    <button class="btn-primary stg-cred-pass-save" data-id="${escHtml(u.id)}" data-email="${escHtml(u.email)}">Passwort ändern</button>
                  </div>`
            }
          </div>`;
            }
          )
          .join("");

        listEl.querySelectorAll(".stg-cred-adopt").forEach((btn) => {
          btn.addEventListener("click", () => {
            const email = btn.getAttribute("data-email") || "";
            const emailEl = document.getElementById("stg-cred-email");
            if (emailEl) emailEl.value = email;
            const passEl = document.getElementById("stg-cred-password");
            if (passEl && !passEl.value) passEl.value = generateStagingPassword();
            showToast("Live-Admin ins Formular übernommen", "info");
          });
        });

        listEl.querySelectorAll(".stg-cred-pass-gen").forEach((btn) => {
          btn.addEventListener("click", () => {
            const uid = btn.getAttribute("data-id");
            const input = listEl.querySelector(`.stg-cred-new-pass[data-id="${uid}"]`);
            if (input) input.value = generateStagingPassword();
          });
        });
        listEl.querySelectorAll(".stg-cred-pass-save").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const uid = btn.getAttribute("data-id");
            const email = btn.getAttribute("data-email") || "";
            const input = listEl.querySelector(`.stg-cred-new-pass[data-id="${uid}"]`);
            const password = (input?.value || "").trim();
            if (!password) return showToast("Neues Passwort eingeben", "error");
            const r = await window.api.stagingCredentialsUpdatePassword({ id: uid, email, password });
            if (r?.error) return showToast(`Fehler: ${r.error}`, "error");
            showToast("Passwort geändert", "success");
            await appendStagingActivity("zugang", `Passwort geändert: ${uid}`);
            await refreshStagingActivity();
            await refreshStagingCredentials();
          });
        });
        listEl.querySelectorAll(".stg-cred-delete").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const uid = btn.getAttribute("data-id");
            const email = btn.getAttribute("data-email") || "";
            if (!window.confirm("Zugang wirklich löschen?")) return;
            const r = await window.api.stagingCredentialsDelete({ id: uid, email });
            if (r?.error) return showToast(`Fehler: ${r.error}`, "error");
            showToast("Zugang gelöscht", "success");
            await appendStagingActivity("zugang", `Zugang gelöscht: ${uid}`);
            await refreshStagingActivity();
            await refreshStagingCredentials();
          });
        });
      };

      // Fast local render first: avoids permanent "Lade..." on slow/hanging network paths.
      try {
        const local = await withTimeout(window.api.stagingCredentialsListLocal(), 2500, "Lokaler Cache");
        if (local && !local.error) renderCredentialsList(local, {});
      } catch (_e) {
        // continue with remote refresh below
      }
      let res = {};
      let liveRes = {};
      try {
        const [credResult, profileResult] = await Promise.allSettled([
          withTimeout(window.api.stagingCredentialsList(), 12000, "Zugangsdaten"),
          withTimeout(window.api.stagingProfile(), 12000, "Staging-Profil")
        ]);
        res = credResult.status === "fulfilled" ? credResult.value || {} : { error: "Zugangsdaten konnten nicht geladen werden" };
        liveRes = profileResult.status === "fulfilled" ? profileResult.value || {} : {};
      } catch (_err) {
        listEl.innerHTML = `<p class="text-red-700">Fehler beim Laden der Zugangsdaten.</p>`;
        return;
      }
      try {
        renderCredentialsList(res, liveRes);
      } catch (_err) {
        listEl.innerHTML = `<p class="text-red-700">Darstellung der Zugangsdaten fehlgeschlagen.</p>`;
      }
    }

    document.getElementById("crm-staging-back")?.addEventListener("click", async () => {
      await renderList();
    });
    document.getElementById("crm-staging-deploy-cms")?.addEventListener("click", async () => {
      if (!window.confirm("Staging Deploy für CMS starten?")) return;
      const r = await window.api.stagingDeploy({ target: "cms", operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else showToast("Staging Deploy (CMS) gestartet", "success");
    });
    document.getElementById("crm-staging-deploy-both")?.addEventListener("click", async () => {
      if (!window.confirm("Staging Deploy für CMS + Landing starten?")) return;
      const r = await window.api.stagingDeploy({ target: "both", operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else showToast("Staging Deploy (beide) gestartet", "success");
    });
    document.getElementById("crm-staging-migrate")?.addEventListener("click", async () => {
      if (!window.confirm("Prisma migrate im Staging starten?")) return;
      const r = await window.api.cmsPrismaMigrateStaging({ operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else {
        showToast("Prisma migrate (Staging) gestartet", "success");
        await appendStagingActivity("database", "Prisma migrate staging gestartet");
        await refreshStagingActivity();
      }
    });
    document.getElementById("crm-staging-migrate-2")?.addEventListener("click", async () => {
      if (!window.confirm("Prisma migrate im Staging starten?")) return;
      const r = await window.api.cmsPrismaMigrateStaging({ operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else {
        showToast("Prisma migrate (Staging) gestartet", "success");
        await appendStagingActivity("database", "Prisma migrate staging gestartet");
        await refreshStagingActivity();
      }
    });
    document.getElementById("crm-staging-deploy-migrate-cms")?.addEventListener("click", async () => {
      if (!window.confirm("Staging Deploy CMS inkl. Migration starten?")) return;
      const r = await window.api.stagingDeploy({ target: "cms", runMigrations: true, operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else {
        showToast("Deploy+Migrations (CMS) gestartet", "success");
        await appendStagingActivity("database", "Staging deploy cms + migrations gestartet");
        await refreshStagingActivity();
      }
    });
    document.getElementById("crm-staging-deploy-migrate-both")?.addEventListener("click", async () => {
      if (!window.confirm("Staging Deploy beider Targets inkl. CMS-Migration starten?")) return;
      const r = await window.api.stagingDeploy({ target: "both", runMigrations: true, operationId: newOperationId() });
      const err = handleResult(r);
      if (err) showToast(`Fehler: ${err}`, "error");
      else {
        showToast("Deploy+Migrations (beide) gestartet", "success");
        await appendStagingActivity("database", "Staging deploy both + migrations gestartet");
        await refreshStagingActivity();
      }
    });
    document.getElementById("stg-smtp-save")?.addEventListener("click", async () => {
      const host = document.getElementById("stg-smtp-host")?.value || "";
      const user = document.getElementById("stg-smtp-user")?.value || "";
      await window.api.settingsSet("staging-smtp-host", host);
      await window.api.settingsSet("staging-smtp-user", user);
      showToast("Staging E-Mail Einstellungen gespeichert", "success");
      await appendStagingActivity("email", `SMTP gespeichert (${host || "ohne Host"})`);
      await refreshStagingActivity();
    });
    document.getElementById("stg-cred-generate")?.addEventListener("click", () => {
      const el = document.getElementById("stg-cred-password");
      if (el) el.value = generateStagingPassword();
    });
    document.getElementById("stg-cred-refresh")?.addEventListener("click", () => refreshStagingCredentials());
    document.getElementById("stg-cred-create")?.addEventListener("click", async () => {
      const email = document.getElementById("stg-cred-email")?.value?.trim() || "";
      const role = document.getElementById("stg-cred-role")?.value?.trim() || "ADMIN";
      const password = document.getElementById("stg-cred-password")?.value?.trim() || "";
      if (!email || !password) return showToast("E-Mail und Passwort sind Pflichtfelder", "error");
      const r = await window.api.stagingCredentialsCreate({ email, role, password });
      if (r?.error) return showToast(`Fehler: ${r.error}`, "error");
      showToast("Staging-Zugang erstellt", "success");
      await appendStagingActivity("zugang", `Zugang erstellt: ${email}`);
      await refreshStagingActivity();
      document.getElementById("stg-cred-email").value = "";
      document.getElementById("stg-cred-password").value = "";
      await refreshStagingCredentials();
    });
    document.getElementById("stg-notes-save")?.addEventListener("click", async () => {
      const text = document.getElementById("stg-notes")?.value || "";
      const r = await window.api.stagingNotesSet({ text });
      if (r?.error) return showToast(`Fehler: ${r.error}`, "error");
      showToast("Staging-Notizen gespeichert", "success");
      await appendStagingActivity("notizen", "Notizen aktualisiert");
      await refreshStagingActivity();
    });
    document.getElementById("stg-activity-refresh")?.addEventListener("click", () => refreshStagingActivity());

    const financeKpiEl = document.getElementById("stg-finance-kpis");
    if (financeKpiEl) {
      try {
        const kpis = await window.api.dashboardKpis();
        if (kpis?.restaurantsTotal != null) {
          financeKpiEl.textContent = `Umsatz gesamt: € ${fmtMoney(kpis.totalRevenue || 0)} · Provision gesamt: € ${fmtMoney(
            kpis.totalCommission || 0
          )} · Restaurants erreichbar: ${kpis.restaurantsReachable}/${kpis.restaurantsTotal}`;
        } else {
          financeKpiEl.textContent = "Keine KPI-Daten verfügbar.";
        }
      } catch (_err) {
        financeKpiEl.textContent = "KPI-Daten konnten nicht geladen werden.";
      }
    }

    try {
      const notesRes = await window.api.stagingNotesGet();
      const notesEl = document.getElementById("stg-notes");
      if (notesEl) notesEl.value = notesRes?.text || "";
    } catch (_err) {
      // Notes are optional for initial render.
    }
    await refreshStagingActivity().catch(() => {});
    await refreshStagingCredentials().catch(() => {});
  }

  async function renderList() {
  content.innerHTML = `
    ${topHeader("CRM", "Kundenverwaltung (ohne Vertrag)")}
    <div class="card max-w-5xl">
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <div class="min-w-[240px]">
          <button id="crm-sync" class="btn-primary">Sync mit bestehenden Instanzen</button>
          <span class="ml-3 text-xs text-slate-500">Erkennt z.B. bestellung.pizzeria1140.at automatisch.</span>
        </div>
        <div id="crm-status" class="text-xs text-slate-500"></div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-5xl">
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Neuen Kunden anlegen</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ansprechpartner *</label>
            <input id="crm-f-name" class="input" placeholder="Vor- und Nachname">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurantname *</label>
            <input id="crm-f-restaurant" class="input" placeholder="z.B. Pizzeria Da Corrado">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Bestell-Domain *</label>
            <input id="crm-f-domain" class="input" placeholder="bestellung.example.at">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">LandingPage-Domain</label>
            <input id="crm-f-landingpage-domain" class="input" placeholder="restaurant.example.at (optional)">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">E-Mail</label>
            <input id="crm-f-email" class="input" placeholder="office@example.at">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telefon</label>
            <input id="crm-f-telefon" class="input" placeholder="+43 ...">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</label>
            <input id="crm-f-adresse" class="input" placeholder="Straße, PLZ Ort">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notizen</label>
            <textarea id="crm-f-notizen" class="input" rows="3" placeholder="Interne Notizen..."></textarea>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="crm-save" class="btn-primary">Kunde speichern</button>
            <button id="crm-refresh" class="btn-secondary">Liste aktualisieren</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Kunden</h3>
        <div id="crm-list" class="space-y-3">
          <div id="crm-list-loading" class="text-xs text-slate-500">Lade Kunden...</div>
        </div>
      </div>
    </div>
  `;

  async function loadCustomers() {
    const res = await window.api.kundenList();
    const list = document.getElementById("crm-list");
    const loading = document.getElementById("crm-list-loading");
    if (loading) loading.remove();
    list.innerHTML = "";

    const customers = Array.isArray(res) ? res : [];
    const stagingCard = `
      <button data-open-staging="1" class="w-full text-left rounded-2xl border border-brand-200 bg-brand-50 p-4 hover:bg-brand-100 transition">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <div class="w-10 h-10 rounded-2xl border border-brand-200 bg-white flex items-center justify-center text-brand-700 font-black">ST</div>
            <div class="min-w-0">
              <div class="font-extrabold text-slate-900 truncate">Staging Umgebung</div>
              <div class="text-xs text-slate-600 break-all">gastro-cms staging profil</div>
              <div class="text-xs text-slate-500">Deploy/Migration/Test direkt aus CRM</div>
            </div>
          </div>
          <div class="text-xs text-slate-500">→</div>
        </div>
      </button>
    `;

    if (!customers.length) {
      list.innerHTML = `${stagingCard}<div class="text-xs text-slate-500">Noch keine Kunden angelegt.</div>`;
      list.querySelectorAll("button[data-open-staging]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          selectedId = "staging";
          await renderStagingProfile();
        });
      });
      return res;
    }

    list.innerHTML = stagingCard + customers.map((k) => {
      const iconSrc = k.favicon_url || k.logo_url || "/icon-192.png";
      const domainLabel = k.domain || "—";
      return `
        <button data-open="${k.id}" class="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <img src="${iconSrc}" alt="Favicon" class="w-10 h-10 rounded-2xl object-cover border border-slate-200">
              <div class="min-w-0">
                <div class="font-extrabold text-slate-900 truncate">${k.restaurant || "Restaurant"}</div>
                <div class="text-xs text-slate-500 break-all">${domainLabel}</div>
                ${k.name ? `<div class="text-xs text-slate-600">${k.name}</div>` : ""}
              </div>
            </div>
            <div class="text-xs text-slate-500">→</div>
          </div>
        </button>
      `;
    }).join("");

    list.querySelectorAll("button[data-open-staging]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        selectedId = "staging";
        await renderStagingProfile();
      });
    });

    list.querySelectorAll("button[data-open]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-open");
        if (!id) return;
        selectedId = Number(id);
        try {
          await renderDetail(selectedId);
        } catch (e) {
          showToast(`Detailansicht konnte nicht geöffnet werden: ${e?.message || e}`, "error");
        }
      });
    });

    return res;
  }

  const syncBtn = document.getElementById("crm-sync");
  syncBtn.addEventListener("click", async () => {
    const st = document.getElementById("crm-status");
    st.textContent = "Sync läuft...";
    const r = await window.api.crmSyncFromInstances();
    if (r?.error) {
      st.textContent = "Sync fehlgeschlagen";
      showToast(`Fehler: ${r.error}`, "error");
    } else if (r?.warning) {
      st.textContent = "Sync ok (Warnung)";
      showToast(`Warnung: ${r.warning}`, "error");
    } else {
      st.textContent = "Sync ok";
      showToast("Instanzen erkannt und Kunden angelegt", "success");
    }
    await loadCustomers();
  });

  document.getElementById("crm-refresh").addEventListener("click", () => loadCustomers());
  document.getElementById("crm-save").addEventListener("click", async () => {
    const data = {
      name: document.getElementById("crm-f-name").value.trim(),
      restaurant: document.getElementById("crm-f-restaurant").value.trim(),
      domain: document.getElementById("crm-f-domain").value.trim(),
      landingpage_domain: document.getElementById("crm-f-landingpage-domain").value.trim(),
      email: document.getElementById("crm-f-email").value.trim(),
      telefon: document.getElementById("crm-f-telefon").value.trim(),
      adresse: document.getElementById("crm-f-adresse").value.trim(),
      notizen: document.getElementById("crm-f-notizen").value.trim(),
    };
    if (!data.name || !data.restaurant || !data.domain) {
      showToast("Name, Restaurant und Domain sind Pflichtfelder", "error");
      return;
    }
    const r = await window.api.kundeCreate(data);
    if (r?.error) showToast(`Fehler: ${r.error}`, "error");
    else {
      showToast("Kunde angelegt", "success");
      // Felder leeren
      document.getElementById("crm-f-name").value = "";
      document.getElementById("crm-f-restaurant").value = "";
      document.getElementById("crm-f-domain").value = "";
      document.getElementById("crm-f-landingpage-domain").value = "";
      document.getElementById("crm-f-email").value = "";
      document.getElementById("crm-f-telefon").value = "";
      document.getElementById("crm-f-adresse").value = "";
      document.getElementById("crm-f-notizen").value = "";
      await loadCustomers();
    }
  });

  await loadCustomers();
  const r = await window.api.crmSyncFromInstances();
  if (r?.error) showToast(`Sync fehlgeschlagen: ${r.error}`, "error");
  await loadCustomers();
  }

  await renderList();
}

async function renderCaddy() {
  const result = await window.api.caddyGet();
  content.innerHTML = `
    ${topHeader("Caddy", "Live Caddyfile einsehen und verwalten")}
    <div class="card">
      <textarea id="caddy-text" rows="24" class="input font-mono text-xs leading-6"></textarea>
      <div class="mt-3 flex gap-2">
        <button id="save-caddy" class="btn-primary">Speichern</button>
        <button id="reload-caddy" class="btn-secondary">Caddy neu laden</button>
      </div>
    </div>
  `;
  document.getElementById("caddy-text").value = result.content || "";
  document.getElementById("save-caddy").addEventListener("click", async () => {
    const contentText = document.getElementById("caddy-text").value;
    const saveRes = await window.api.caddySave(contentText);
    const err = handleResult(saveRes);
    if (err) showToast(`Fehler: ${err}`, "error");
    else showToast("Caddyfile gespeichert", "success");
  });
  document.getElementById("reload-caddy").addEventListener("click", async () => {
    const reloadRes = await window.api.caddyReload();
    const err = handleResult(reloadRes);
    if (err) showToast(`Fehler: ${err}`, "error");
    else showToast("Caddy reload ausgeloest", "success");
  });
}

async function renderSettings() {
  const settings = await window.api.settingsGet();
  content.innerHTML = `
    ${topHeader("Einstellungen", "Verbindung und Zugangsdaten")}
    <div class="card max-w-2xl">
      <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">VPS URL</label>
      <input id="vps-url" class="input" value="${settings["vps-url"] || "https://updates.gastro-cms.at"}">
      <label class="mb-1 mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Auth User</label>
      <input id="vps-user" class="input" value="${settings["vps-user"] || "mario"}">
      <label class="mb-1 mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Auth Passwort</label>
      <input id="vps-pass" type="password" class="input" value="${settings["vps-pass"] || ""}">
      <label class="mb-1 mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Token</label>
      <input id="admin-token" type="password" class="input" value="${settings["admin-token"] || ""}">
      <label class="mb-1 mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Staging URL (Anzeige)</label>
      <input id="staging-url" class="input" value="${settings["staging-url"] || "https://test.restaurant-lieferservice.online"}">
      <div class="mt-4 flex flex-wrap gap-2">
        <button id="save-settings" class="btn-primary">Speichern</button>
        <button id="test-connection" type="button" class="btn-secondary">Verbindung testen</button>
      </div>
      <p class="mt-2 text-xs text-slate-500">Verbindung testen nutzt die gespeicherten Werte; bei geaenderter URL zuerst Speichern.</p>
      <p class="mt-3 text-xs text-slate-600 leading-relaxed rounded-xl border border-slate-200 bg-slate-50 p-3">
        <strong class="text-slate-800">Voll-Deploy (aus dem CRM-Profil):</strong> Die tatsächlichen Schritte laufen serverseitig auf dem VPS. Die benötigten
        Zugangsdaten/URLs bleiben weiterhin in
        <code class="rounded bg-white px-1">/opt/update-server/.env</code> u. a.
        <code class="rounded bg-white px-1">TECHNITIUM_API_URL</code> (z. B. <code class="rounded bg-white px-1">http://127.0.0.1:5380</code>),
        <code class="rounded bg-white px-1">TECHNITIUM_API_TOKEN</code>,
        <code class="rounded bg-white px-1">MAILCOW_API_URL</code>,
        <code class="rounded bg-white px-1">MAILCOW_API_KEY</code>,
        optional <code class="rounded bg-white px-1">SERVER_PUBLIC_IP</code>,
        <code class="rounded bg-white px-1">MAIL_HOSTNAME</code> (Standard <code class="rounded bg-white px-1">mail.gastro-cms.online</code>),
        <code class="rounded bg-white px-1">PROVISION_S3_ENDPOINT</code> setzen.
      </p>
      <div id="connection-test-result" class="mt-3 hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"></div>
    </div>
  `;
  document.getElementById("save-settings").addEventListener("click", async () => {
    const fields = ["vps-url", "vps-user", "vps-pass", "admin-token", "staging-url"];
    for (const key of fields) {
      const value = document.getElementById(key).value.trim();
      if (value) await window.api.settingsSet(key, value);
    }
    await reconnectLogsStream();
    showToast("Gespeichert (Log-Stream neu verbunden)", "success");
  });
  document.getElementById("test-connection").addEventListener("click", async () => {
    const box = document.getElementById("connection-test-result");
    box.classList.remove("hidden");
    box.textContent = "Teste…";
    const res = await window.api.connectionTest();
    const capsOk = !!res.capabilities?.ok;
    const capsData = res.capabilities?.data || null;
    const lines = [
      `Basis-URL: ${res.baseUrl || "-"}`,
      `Health: ${res.health?.ok ? "OK" : "Fehler"} ${res.health?.status != null ? `(HTTP ${res.health.status})` : ""} ${res.health?.error || ""}`,
      `Status (Basic Auth): ${res.status?.ok ? "OK" : "Fehler"} ${res.status?.status != null ? `(HTTP ${res.status.status})` : ""} ${res.status?.error || ""}`,
      `Capabilities: ${capsOk ? "OK" : "Fehler"} ${res.capabilities?.status != null ? `(HTTP ${res.capabilities.status})` : ""} ${res.capabilities?.error || ""}`,
      capsData?.apiVersion ? `API Version: ${capsData.apiVersion}` : "",
      capsData?.features?.instanceBackupApi ? "Feature instanceBackupApi: Ja" : "Feature instanceBackupApi: Nein",
      res.status?.rolloutInProgress != null ? `Rollout aktiv: ${res.status.rolloutInProgress ? "Ja" : "Nein"}` : "",
      `Gesamt: ${res.ok ? "Erfolg" : "Nicht in Ordnung"}`
    ].filter(Boolean);
    box.textContent = lines.join("\n");
    box.className = `mt-3 rounded-xl border p-3 text-xs ${
      res.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-800"
    }`;
    if (!res.ok) showToast("Verbindungstest fehlgeschlagen", "error");
    else showToast("Verbindung in Ordnung", "success");
  });
}

setActiveNav("dashboard");
renderDashboard();
