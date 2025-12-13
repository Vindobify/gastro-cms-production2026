'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export default function UpdateModal({ isOpen, onClose, updateInfo }: UpdateModalProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [installMessage, setInstallMessage] = useState('');

  const handleInstall = async () => {
    if (!updateInfo) return;

    setIsInstalling(true);
    setInstallStatus('installing');
    setInstallMessage('Update wird installiert...');

    try {
      const response = await fetch('/api/updates/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: updateInfo.latestVersion
        })
      });

      const result = await response.json();

      if (result.success) {
        setInstallStatus('success');
        setInstallMessage('Update erfolgreich installiert! Die Seite wird neu geladen...');
        
        // Seite nach 3 Sekunden neu laden
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setInstallStatus('error');
        setInstallMessage(result.message || 'Update fehlgeschlagen');
      }
    } catch (error) {
      setInstallStatus('error');
      setInstallMessage('Netzwerkfehler beim Installieren des Updates');
      console.error('Update Install Error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReleaseNotes = (notes: string) => {
    return notes
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*]\s*/, '• '))
      .join('\n');
  };

  if (!updateInfo) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    🚀 Update verfügbar
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isInstalling}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Version Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Aktuelle Version: v{updateInfo.currentVersion}
                        </p>
                        <p className="text-sm text-blue-700">
                          Neue Version: v{updateInfo.latestVersion}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600">
                          Veröffentlicht: {formatDate(updateInfo.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Release Notes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Was ist neu?</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {formatReleaseNotes(updateInfo.releaseNotes)}
                      </pre>
                    </div>
                  </div>

                  {/* Install Status */}
                  {installStatus !== 'idle' && (
                    <div className={`border rounded-lg p-4 ${
                      installStatus === 'success' ? 'bg-green-50 border-green-200' :
                      installStatus === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {installStatus === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                        {installStatus === 'error' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                        {installStatus === 'installing' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                        )}
                        <p className={`text-sm font-medium ${
                          installStatus === 'success' ? 'text-green-900' :
                          installStatus === 'error' ? 'text-red-900' :
                          'text-yellow-900'
                        }`}>
                          {installMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isInstalling}
                    >
                      Später
                    </button>
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling || installStatus === 'success'}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInstalling ? 'Installiere...' : 'Jetzt updaten'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
