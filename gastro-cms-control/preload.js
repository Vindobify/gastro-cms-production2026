const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  settingsGet: () => ipcRenderer.invoke("settings:get"),
  settingsSet: (key, value) => ipcRenderer.invoke("settings:set", key, value),

  statusGet: () => ipcRenderer.invoke("status:get"),
  serverCapabilities: () => ipcRenderer.invoke("server:capabilities"),
  versionsStatus: () => ipcRenderer.invoke("versions:status"),
  stagingProfile: () => ipcRenderer.invoke("staging:profile"),
  dashboardKpis: () => ipcRenderer.invoke("dashboard:kpis"),
  instancesList: () => ipcRenderer.invoke("instances:list"),
  instanceUpdate: (payload) => ipcRenderer.invoke("instance:update", payload),
  instanceRestart: (payload) => ipcRenderer.invoke("instance:restart", payload),
  instanceDelete: (payload) => ipcRenderer.invoke("instance:delete", payload),

  stagingDeploy: (payload) => ipcRenderer.invoke("staging:deploy", payload),
  rolloutStart: (payload) => ipcRenderer.invoke("rollout:start", payload),
  cmsPrismaMigrateStaging: (payload) => ipcRenderer.invoke("cms:prisma-migrate-staging", payload),
  cmsPrismaMigrateRollout: (payload) => ipcRenderer.invoke("cms:prisma-migrate-rollout", payload),
  connectionTest: () => ipcRenderer.invoke("connection:test"),

  caddyGet: () => ipcRenderer.invoke("caddy:get"),
  caddySave: (content) => ipcRenderer.invoke("caddy:save", content),
  caddyReload: () => ipcRenderer.invoke("caddy:reload"),

  provisionDeploy: (payload) => ipcRenderer.invoke("provision:deploy", payload),
  provisionBackfillExisting: (payload) => ipcRenderer.invoke("provision:backfill-existing", payload),
  provisionStatusGet: (operationId) => ipcRenderer.invoke("provision:status", operationId),

  utilityFetchHealth: (url) => ipcRenderer.invoke("utility:fetch-health", url),
  utilityTlsExpiry: (hostname) => ipcRenderer.invoke("utility:tls-expiry", hostname),
  caddyHasHosts: (hostnames) => ipcRenderer.invoke("crm:caddy-has-domain", hostnames),

  instanceBackupCreate: (payload) => ipcRenderer.invoke("instance:backup-create", payload),
  instanceBackupsList: (domain) => ipcRenderer.invoke("instance:backups-list", domain),
  instanceDbSize: (domain) => ipcRenderer.invoke("instance:db-size", domain),
  instanceBackupDownload: (payload) => ipcRenderer.invoke("instance:backup-download", payload),

  // CRM
  crmActivityAppend: (payload) => ipcRenderer.invoke("crm:activity-append", payload),
  crmActivityList: (payload) => ipcRenderer.invoke("crm:activity-list", payload),
  crmSyncFromInstances: () => ipcRenderer.invoke("crm:sync-from-instances"),
  crmAdminUsersList: (payload) => ipcRenderer.invoke("crm:admin-users-list", payload),
  crmAdminUserCreate: (payload) => ipcRenderer.invoke("crm:admin-user-create", payload),
  crmAdminUserPasswordSet: (payload) => ipcRenderer.invoke("crm:admin-user-password-set", payload),
  crmAdminUserDelete: (payload) => ipcRenderer.invoke("crm:admin-user-delete", payload),
  kundenList: () => ipcRenderer.invoke("crm:kunden-list"),
  kundeGet: (id) => ipcRenderer.invoke("crm:kunde-get", id),
  kundeCreate: (data) => ipcRenderer.invoke("crm:kunde-create", data),
  kundeUpdate: (data) => ipcRenderer.invoke("crm:kunde-update", data),
  kundeDelete: (payload) => ipcRenderer.invoke("crm:kunde-delete", payload),
  kundeRefreshSnapshot: (id) => ipcRenderer.invoke("crm:kunde-refresh-snapshot", id),
  kundeAdoptDomainToSettings: (id) => ipcRenderer.invoke("crm:kunde-adopt-domain", id),
  kundeImportSettings: (id) => ipcRenderer.invoke("crm:kunde-import-settings", id)
  ,
  stagingCredentialsList: () => ipcRenderer.invoke("staging:credentials:list"),
  stagingCredentialsListLocal: () => ipcRenderer.invoke("staging:credentials:list-local"),
  stagingCredentialsCreate: (payload) => ipcRenderer.invoke("staging:credentials:create", payload),
  stagingCredentialsUpdatePassword: (payload) => ipcRenderer.invoke("staging:credentials:update-password", payload),
  stagingCredentialsDelete: (payload) => ipcRenderer.invoke("staging:credentials:delete", payload),
  stagingNotesGet: () => ipcRenderer.invoke("staging:notes:get"),
  stagingNotesSet: (payload) => ipcRenderer.invoke("staging:notes:set", payload),
  stagingActivityList: () => ipcRenderer.invoke("staging:activity:list"),
  stagingActivityAppend: (payload) => ipcRenderer.invoke("staging:activity:append", payload)
});
