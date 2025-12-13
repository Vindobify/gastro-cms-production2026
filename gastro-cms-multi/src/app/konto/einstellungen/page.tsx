'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  ArrowLeftIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function EinstellungenPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: false,
    twoFactorAuth: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/frontend/login?redirect=/konto/einstellungen');
    }
  }, [isAuthenticated, loading, router]);

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Einstellungen gespeichert', 'success');
    } catch (error) {
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Konto wurde gelöscht', 'success');
      logout();
      router.push('/');
    } catch (error) {
      addToast('Fehler beim Löschen des Kontos', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Einstellungen...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/konto"
              className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Zurück zum Konto
            </Link>
            <h1 className="text-3xl font-display font-semibold text-gray-900">
              Einstellungen
            </h1>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-6">
          <div className="flex items-center mb-6">
            <BellIcon className="w-6 h-6 text-gray-400 mr-3" />
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Benachrichtigungen
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">E-Mail Benachrichtigungen</h3>
                <p className="text-sm text-gray-500">Erhalten Sie wichtige Updates per E-Mail</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">SMS Benachrichtigungen</h3>
                <p className="text-sm text-gray-500">Erhalten Sie Updates per SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleSettingChange('smsNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Bestellupdates</h3>
                <p className="text-sm text-gray-500">Benachrichtigungen über Bestellstatus</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={() => handleSettingChange('orderUpdates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Werbung & Angebote</h3>
                <p className="text-sm text-gray-500">Informationen über Aktionen und Rabatte</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promotionalEmails}
                  onChange={() => handleSettingChange('promotionalEmails')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Newsletter</h3>
                <p className="text-sm text-gray-500">Monatlicher Newsletter mit Neuigkeiten</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={() => handleSettingChange('newsletter')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {isSaving ? 'Speichern...' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-gray-400 mr-3" />
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Sicherheit
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Zwei-Faktor-Authentifizierung</h3>
                <p className="text-sm text-gray-500">Zusätzliche Sicherheit für Ihr Konto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleSettingChange('twoFactorAuth')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="pt-4 border-t">
              <Link
                href="/konto/profil"
                className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium"
              >
                Passwort ändern
              </Link>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-card p-8 border border-red-200">
          <div className="flex items-center mb-6">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-display font-semibold text-red-900">
              Gefahrenbereich
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Konto löschen</h3>
              <p className="text-sm text-gray-500 mb-4">
                Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten, Bestellungen und Einstellungen werden permanent gelöscht.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Konto löschen
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800 mb-4">
                    <strong>Sind Sie sicher?</strong> Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Ja, Konto löschen
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
