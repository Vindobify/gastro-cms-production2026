'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  KeyIcon,
  ServerIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

type StripeSettings = {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  stripeClientId: string;
  nextPublicAppUrl: string;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    stripeClientId: '',
    nextPublicAppUrl: '',
  });
  const [apiKey, setApiKey] = useState('');
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/stripe');
      if (response.ok) {
        const data = await response.json();
        // If values are masked, show empty fields (user needs to enter them)
        setStripeSettings({
          stripeSecretKey: data.stripeSecretKey?.includes('...') ? '' : data.stripeSecretKey || '',
          stripePublishableKey: data.stripePublishableKey?.includes('...') ? '' : data.stripePublishableKey || '',
          stripeWebhookSecret: data.stripeWebhookSecret?.includes('...') ? '' : data.stripeWebhookSecret || '',
          stripeClientId: data.stripeClientId || '',
          nextPublicAppUrl: data.nextPublicAppUrl || '',
        });
      }
      // Load API Key and Database URL from env (read-only)
      setApiKey(process.env.NEXT_PUBLIC_CRM_INTERNAL_API_KEY || '');
      setDatabaseUrl(process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeSettings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Einstellungen erfolgreich gespeichert' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Speichern' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateStripeKey = (key: string, type: 'secret' | 'publishable' | 'webhook' | 'client'): boolean => {
    if (!key) return true; // Optional fields
    if (type === 'secret') return key.startsWith('sk_');
    if (type === 'publishable') return key.startsWith('pk_');
    if (type === 'webhook') return key.startsWith('whsec_');
    if (type === 'client') return key.length > 0; // Client ID format varies
    return true;
  };

  if (loading) {
    return (
      <DashboardLayout title="Einstellungen">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Lade Einstellungen...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Einstellungen">
      <div className="space-y-8">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`rounded-lg p-4 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* API Configuration */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <KeyIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">API-Konfiguration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Externe API-Zugriffe verwalten</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API Key (für externe Zugriffe)
              </label>
              <input
                type="text"
                value={apiKey || 'Nicht konfiguriert'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Wird aus der Umgebungsvariable CRM_INTERNAL_API_KEY gelesen
              </p>
            </div>
          </div>
        </div>

        {/* Database Configuration */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ServerIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Datenbank-Konfiguration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Datenbankverbindung verwalten</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                DATABASE_URL
              </label>
              <input
                type="text"
                value={databaseUrl || 'Nicht konfiguriert'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Wird aus der Umgebungsvariable DATABASE_URL gelesen
              </p>
            </div>
          </div>
        </div>

        {/* Stripe Configuration */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Stripe-Konfiguration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Zahlungsabwicklung und Connect-Onboarding</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Stripe Secret Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stripe Secret Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.secretKey ? 'text' : 'password'}
                  value={stripeSettings.stripeSecretKey}
                  onChange={(e) =>
                    setStripeSettings({ ...stripeSettings, stripeSecretKey: e.target.value })
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    stripeSettings.stripeSecretKey && !validateStripeKey(stripeSettings.stripeSecretKey, 'secret')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="sk_live_... oder sk_test_..."
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('secretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecrets.secretKey ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {stripeSettings.stripeSecretKey && !validateStripeKey(stripeSettings.stripeSecretKey, 'secret') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  Secret Key muss mit "sk_" beginnen
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Platform Secret Key für Stripe API-Zugriffe (aus Stripe Dashboard)
              </p>
            </div>

            {/* Stripe Publishable Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stripe Publishable Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.publishableKey ? 'text' : 'password'}
                  value={stripeSettings.stripePublishableKey}
                  onChange={(e) =>
                    setStripeSettings({ ...stripeSettings, stripePublishableKey: e.target.value })
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    stripeSettings.stripePublishableKey && !validateStripeKey(stripeSettings.stripePublishableKey, 'publishable')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="pk_live_... oder pk_test_..."
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('publishableKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecrets.publishableKey ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {stripeSettings.stripePublishableKey && !validateStripeKey(stripeSettings.stripePublishableKey, 'publishable') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  Publishable Key muss mit "pk_" beginnen
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Platform Publishable Key für Frontend-Integration (optional)
              </p>
            </div>

            {/* Stripe Webhook Secret */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stripe Webhook Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.webhookSecret ? 'text' : 'password'}
                  value={stripeSettings.stripeWebhookSecret}
                  onChange={(e) =>
                    setStripeSettings({ ...stripeSettings, stripeWebhookSecret: e.target.value })
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    stripeSettings.stripeWebhookSecret && !validateStripeKey(stripeSettings.stripeWebhookSecret, 'webhook')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="whsec_..."
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('webhookSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecrets.webhookSecret ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {stripeSettings.stripeWebhookSecret && !validateStripeKey(stripeSettings.stripeWebhookSecret, 'webhook') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  Webhook Secret muss mit "whsec_" beginnen
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Webhook Signing Secret für sichere Webhook-Verarbeitung
              </p>
            </div>

            {/* Stripe Client ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stripe Client ID (für Connect OAuth)
              </label>
              <input
                type="text"
                value={stripeSettings.stripeClientId}
                onChange={(e) =>
                  setStripeSettings({ ...stripeSettings, stripeClientId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                placeholder="ca_... oder oauth:..."
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Client ID für Stripe Connect OAuth (optional, für erweiterte Connect-Features)
              </p>
            </div>

            {/* Next Public App URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                App URL (für Redirects) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={stripeSettings.nextPublicAppUrl}
                onChange={(e) =>
                  setStripeSettings({ ...stripeSettings, nextPublicAppUrl: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                placeholder="http://crm.gastro-cms.local"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Basis-URL für Stripe Connect Redirects und Webhooks
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving || !stripeSettings.stripeSecretKey || !stripeSettings.stripeWebhookSecret || !stripeSettings.nextPublicAppUrl}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Speichere...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Stripe-Einstellungen speichern
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 mb-2">
                Wichtige Hinweise zur Stripe-Konfiguration
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    <strong>Secret Key & Webhook Secret:</strong> Diese werden in der <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> Datei gespeichert und sind für die Stripe Connect-Funktionalität erforderlich.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    <strong>App URL:</strong> Muss die vollständige URL deines CRM-Systems sein (z.B. <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">http://crm.gastro-cms.local</code>). Wird für Stripe Connect Redirects verwendet.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    <strong>Nach dem Speichern:</strong> Der Server muss neu gestartet werden, damit die Änderungen wirksam werden. Die Restaurants können dann das Stripe Onboarding in ihren Einstellungen durchführen.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    <strong>Stripe Connect:</strong> Ermöglicht es Restaurants, ihre eigenen Stripe-Accounts zu verbinden und Zahlungen direkt zu erhalten.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
