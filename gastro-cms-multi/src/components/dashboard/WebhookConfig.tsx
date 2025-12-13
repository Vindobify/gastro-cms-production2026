'use client';

import { useState } from 'react';
import { 
  KeyIcon, 
  ClipboardDocumentIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface WebhookConfigProps {
  onSecretGenerated?: (secret: string, webhookUrl: string) => void;
}

export default function WebhookConfig({ onSecretGenerated }: WebhookConfigProps) {
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSecret = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/updates/generate-secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setSecret(data.secret);
        setWebhookUrl(data.webhookUrl);
        onSecretGenerated?.(data.secret, data.webhookUrl);
      } else {
        setError(data.message || 'Fehler beim Generieren des Secrets');
      }
    } catch (err) {
      setError('Netzwerkfehler beim Generieren des Secrets');
      console.error('Secret Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          GitHub Webhook Konfiguration
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Generieren Sie einen neuen Webhook Secret und konfigurieren Sie GitHub
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="space-y-4">
          {/* Generate Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Webhook Secret generieren
              </span>
            </div>
            <button
              onClick={generateSecret}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generiere...' : 'Neuen Secret generieren'}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {secret && webhookUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Webhook Secret erfolgreich generiert!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Der Secret wurde automatisch in die .env Datei gespeichert.
                    </p>
                  </div>
                </div>
              </div>

              {/* Secret Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret (für GitHub):
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-900">
                    {secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secret)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                    {copied ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
              </div>

              {/* Webhook URL Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (für GitHub):
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-900">
                    {webhookUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                    {copied ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
              </div>

              {/* GitHub Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  GitHub Webhook konfigurieren:
                </h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Gehen Sie zu: <code className="bg-blue-100 px-1 rounded">https://github.com/Vindobify/gastro-cms/settings/webhooks</code></li>
                  <li>Klicken Sie auf <strong>"Add webhook"</strong></li>
                  <li>Fügen Sie die <strong>Webhook URL</strong> ein</li>
                  <li>Fügen Sie den <strong>Webhook Secret</strong> ein</li>
                  <li>Wählen Sie <strong>"application/json"</strong> als Content type</li>
                  <li>Wählen Sie nur <strong>"Push"</strong> events</li>
                  <li>Klicken Sie auf <strong>"Add webhook"</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
