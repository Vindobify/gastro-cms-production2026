'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  PERMISSION_PRESETS,
  ApiPermission
} from '@/lib/apiKeyManagement.client';

interface ApiKeyWithStats {
  id: number;
  name: string;
  keyPrefix: string;
  permissions: ApiPermission[];
  isActive: boolean;
  expiresAt?: Date | null;
  lastUsed?: Date | null;
  requestsPerHour: number;
  requestsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
  apiUserId: number;
  assignedUserId?: string; // For compatibility with existing code
  apiUser?: {
    id: number;
    name: string;
    email: string;
    company?: string | null;
  };
  stats?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsLast24h: number;
  };
}

export default function ApiControlCenter() {
  const { user, isAdmin } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKeyWithStats[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    preset: 'POS_SYSTEM',
    customPermissions: [] as ApiPermission[],
    expiresInDays: 365,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    assignedUserId: ''
  });
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    company: '',
    description: ''
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [apiUsers, setApiUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadApiKeys();
      loadApiUsers();
    }
  }, [isAdmin]);

  const loadApiUsers = async () => {
    try {
      const response = await fetch('/api/external-users');
      if (response.ok) {
        const data = await response.json();
        setApiUsers(data.users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        })));
      }
    } catch (error) {
      console.error('Error loading API users:', error);
    }
  };

  // Nur Admins haben Zugriff
  if (!isAdmin) {
    return (
      <DashboardLayout title="Zugriff verweigert" subtitle="Keine Berechtigung">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600">Nur Administratoren haben Zugriff auf das API Control Center.</p>
        </div>
      </DashboardLayout>
    );
  }

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleCreateKey = async () => {
    if (!user) return;
    
    const permissions = newKeyData.preset === 'CUSTOM' 
      ? newKeyData.customPermissions 
      : PERMISSION_PRESETS[newKeyData.preset as keyof typeof PERMISSION_PRESETS];

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyData.name,
          preset: newKeyData.preset,
          customPermissions: newKeyData.customPermissions,
          expiresInDays: newKeyData.expiresInDays,
          requestsPerHour: newKeyData.requestsPerHour,
          requestsPerDay: newKeyData.requestsPerDay,
          assignedUserId: newKeyData.assignedUserId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
        return;
      }

      const apiKey = await response.json();

      // PDF generieren falls Benutzer zugewiesen
      if (newKeyData.assignedUserId) {
        const assignedUser = apiUsers.find(u => u.id === newKeyData.assignedUserId);
        if (assignedUser) {
          try {
            const pdfResponse = await fetch('/api/generate-api-docs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                apiKey,
                apiUser: assignedUser,
                domain: window.location.origin
              }),
            });

            if (pdfResponse.ok) {
              const result = await pdfResponse.json();
              // Direct download via window.open for better compatibility
              window.open(result.downloadUrl, '_blank');
            }
          } catch (error) {
            console.error('Error generating PDF:', error);
          }
        }
      }

      setCreatedKey(apiKey.key);
      setShowCreateForm(false);
      setNewKeyData({
        name: '',
        preset: 'POS_SYSTEM',
        customPermissions: [],
        expiresInDays: 365,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        assignedUserId: ''
      });
      loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Fehler beim Erstellen des API-Schlüssels');
    }
  };

  const handleDeactivateKey = async (keyId: string) => {
    if (!user) return;
    
    if (confirm('Sind Sie sicher, dass Sie diesen API-Schlüssel deaktivieren möchten?')) {
      try {
        const response = await fetch(`/api/api-keys?id=${keyId}&action=deactivate`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadApiKeys();
        } else {
          alert('Fehler beim Deaktivieren des API-Schlüssels');
        }
      } catch (error) {
        console.error('Error deactivating API key:', error);
        alert('Fehler beim Deaktivieren des API-Schlüssels');
      }
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!user) return;
    
    if (confirm('Sind Sie sicher, dass Sie diesen API-Schlüssel PERMANENT löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      try {
        const response = await fetch(`/api/api-keys?id=${keyId}&action=delete`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadApiKeys();
        } else {
          alert('Fehler beim Löschen des API-Schlüssels');
        }
      } catch (error) {
        console.error('Error deleting API key:', error);
        alert('Fehler beim Löschen des API-Schlüssels');
      }
    }
  };

  const handleCreateApiUser = async () => {
    if (!newUserData.name || !newUserData.email) return;

    try {
      const response = await fetch('/api/external-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setApiUsers(prev => [...prev, {
          ...newUser,
          createdAt: new Date(newUser.createdAt)
        }]);
        setShowCreateUserForm(false);
        setNewUserData({
          name: '',
          email: '',
          company: '',
          description: ''
        });
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating API user:', error);
      alert('Fehler beim Erstellen des API-Benutzers');
    }
  };

  const generatePDFForUser = async (apiKey: any, apiUser: any) => {
    try {
      const response = await fetch('/api/generate-api-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          apiUser,
          domain: window.location.origin
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `api-docs-${apiUser.name}.pdf`;
        link.click();
      } else {
        alert('Fehler beim Generieren der PDF-Dokumentation');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fehler beim Generieren der PDF-Dokumentation');
    }
  };

  const handleGeneratePDF = async (apiKey: ApiKeyWithStats) => {
    if (!apiKey.apiUser) return;
    
    const assignedUser = apiKey.apiUser;

    try {
      const response = await fetch('/api/generate-api-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          apiUser: assignedUser,
          domain: window.location.origin
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Direct download via window.open for better compatibility
        window.open(result.downloadUrl, '_blank');
      } else {
        alert('Fehler beim Generieren der PDF-Dokumentation');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fehler beim Generieren der PDF-Dokumentation');
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Ungültiges Datum';
      }
      return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  return (
    <DashboardLayout title="API Control Center (ACC)" subtitle="Verwalten Sie API-Schlüssel für externe Integrationen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Control Center (ACC)</h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie API-Schlüssel für externe Integrationen wie POS-Systeme, Buchhaltung und Lieferdienste.
          </p>
        </div>

        {/* Statistiken Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Aktive API-Schlüssel</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {apiKeys.filter(key => key.isActive).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Requests (24h)</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {apiKeys.reduce((sum, key) => sum + (key.stats?.requestsLast24h || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Erfolgsrate</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {apiKeys.length > 0 ? Math.round(
                apiKeys.reduce((sum, key) => {
                  const total = key.stats?.totalRequests || 0;
                  const successful = key.stats?.successfulRequests || 0;
                  return sum + (total > 0 ? (successful / total) * 100 : 0);
                }, 0) / apiKeys.length
              ) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Ø Antwortzeit</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {apiKeys.length > 0 ? Math.round(
                apiKeys.reduce((sum, key) => sum + (key.stats?.averageResponseTime || 0), 0) / apiKeys.length
              ) : 0}ms
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">API-Benutzer</h2>
            <button
              onClick={() => setShowCreateUserForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Neuen API-Benutzer erstellen
            </button>
          </div>

          {/* API Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unternehmen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API-Schlüssel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Noch keine API-Benutzer erstellt
                    </td>
                  </tr>
                ) : (
                  apiUsers.map((apiUser) => (
                    <tr key={apiUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{apiUser.name}</div>
                          <div className="text-sm text-gray-500">{apiUser.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {apiUser.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {apiUser.apiKeysCount} Schlüssel
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apiUser.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {apiUser.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(apiUser.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">API-Schlüssel</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Neuen Schlüssel erstellen
          </button>
        </div>


        {/* Neuer API-Benutzer Modal */}
        {showCreateUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Neuen API-Benutzer erstellen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Benutzername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="benutzer@unternehmen.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unternehmen
                  </label>
                  <input
                    type="text"
                    value={newUserData.company}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Firmenname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={newUserData.description}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Zweck der API-Nutzung..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateUserForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateApiUser}
                  disabled={!newUserData.name || !newUserData.email}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Benutzer erstellen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Neuer API-Schlüssel Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Neuen API-Schlüssel erstellen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="z.B. POS System Hauptfiliale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berechtigungsvorlage
                  </label>
                  <select
                    value={newKeyData.preset}
                    onChange={(e) => setNewKeyData({...newKeyData, preset: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="POS_SYSTEM">POS System (Produkte lesen, Bestellungen schreiben)</option>
                    <option value="ACCOUNTING">Buchhaltung (Bestellungen & Analytics lesen)</option>
                    <option value="INVENTORY_MANAGEMENT">Lagerverwaltung (Produkte verwalten)</option>
                    <option value="DELIVERY_SERVICE">Lieferdienst (Bestellungen & Kunden lesen)</option>
                    <option value="FULL_ACCESS">Vollzugriff (Alle Bereiche)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gültigkeitsdauer (Tage)
                    </label>
                    <input
                      type="number"
                      value={newKeyData.expiresInDays}
                      onChange={(e) => setNewKeyData({...newKeyData, expiresInDays: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requests/Stunde
                    </label>
                    <input
                      type="number"
                      value={newKeyData.requestsPerHour}
                      onChange={(e) => setNewKeyData({...newKeyData, requestsPerHour: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benutzer zuweisen
                  </label>
                  <select
                    value={newKeyData.assignedUserId}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, assignedUserId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Keinen Benutzer zuweisen</option>
                    {apiUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Bei Zuweisung wird automatisch eine PDF-Dokumentation generiert
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Erstellen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Neuer Schlüssel anzeigen */}
        {createdKey && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">API-Schlüssel erfolgreich erstellt!</h3>
            <p className="text-sm text-green-700 mb-2">
              Bitte kopieren Sie den Schlüssel jetzt. Er wird nicht mehr angezeigt.
            </p>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all">
              {createdKey}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
                alert('API-Schlüssel in Zwischenablage kopiert!');
              }}
              className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Kopieren
            </button>
            <button
              onClick={() => setCreatedKey(null)}
              className="mt-2 ml-2 text-sm text-green-600 hover:text-green-800"
            >
              Schließen
            </button>
          </div>
        )}

        {/* API-Schlüssel Tabelle */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">API-Schlüssel</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Berechtigungen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nutzung (24h)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt / Läuft ab
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {key.isActive ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </div>
                        {key.apiUser && (
                          <div className="text-xs text-gray-500">
                            Zugewiesen: {key.apiUser.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {key.permissions.map((perm: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{perm.resource}:</span> {perm.actions.join(', ')}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{key.stats?.requestsLast24h || 0} Requests</div>
                      <div className="text-xs text-gray-500">
                        {key.stats?.successfulRequests || 0} erfolgreich
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Erstellt: {formatDate(key.createdAt)}</div>
                      {key.expiresAt && (
                        <div>Läuft ab: {formatDate(key.expiresAt)}</div>
                      )}
                      {key.lastUsed && (
                        <div>Zuletzt: {formatDate(key.lastUsed)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {key.apiUser && (
                          <button
                            onClick={() => handleGeneratePDF(key)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            PDF Download
                          </button>
                        )}
                        {key.isActive ? (
                          <button
                            onClick={() => handleDeactivateKey(key.id.toString())}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Deaktivieren
                          </button>
                        ) : (
                          <span className="text-gray-400">Inaktiv</span>
                        )}
                        <button
                          onClick={() => handleDeleteKey(key.id.toString())}
                          className="text-red-600 hover:text-red-900"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Dokumentation Link */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">API Dokumentation</h3>
          <p className="text-sm text-blue-700 mb-3">
            Vollständige Dokumentation aller verfügbaren API-Endpunkte und Beispiele.
          </p>
          <a
            href="/dashboard/api-docs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Dokumentation öffnen
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
