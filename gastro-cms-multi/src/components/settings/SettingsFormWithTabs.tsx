'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, ShieldCheckIcon, ScaleIcon, PhotoIcon, WrenchScrewdriverIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import LegalContentEditor from './LegalContentEditor';
import MediaPicker from '../media/MediaPicker';
import MaintenanceSettings from './MaintenanceSettings';
import { useToast } from '@/contexts/ToastContext';

interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  atuNumber: string;
  fnNumber: string;
  logo?: string;
  favicon?: string;
  orderDeadline: string;
  deliveryDistricts: string;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  defaultTaxRate: number;
  currency: string;
  timezone: string;
  impressumContent?: string;
  agbContent?: string;
  datenschutzContent?: string;
  impressumLastUpdated?: string | null;
  agbLastUpdated?: string | null;
  datenschutzLastUpdated?: string | null;
}

interface LegalContent {
  impressumContent: string;
  agbContent: string;
  datenschutzContent: string;
  impressumLastUpdated: string | null;
  agbLastUpdated: string | null;
  datenschutzLastUpdated: string | null;
}

type TabType = 'restaurant' | 'delivery' | 'business' | 'maintenance' | 'impressum' | 'agb' | 'datenschutz';

export default function SettingsFormWithTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('restaurant');
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    atuNumber: '',
    fnNumber: '',
    orderDeadline: '',
    deliveryDistricts: '',
    minOrderAmount: 0,
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    defaultTaxRate: 19,
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  });
  const [legalContent, setLegalContent] = useState<LegalContent>({
    impressumContent: '',
    agbContent: '',
    datenschutzContent: '',
    impressumLastUpdated: null,
    agbLastUpdated: null,
    datenschutzLastUpdated: null,
  });
  const [openingHoursData, setOpeningHoursData] = useState({
    montag: { start: '11:00', end: '23:00' },
    dienstag: { start: '11:00', end: '23:00' },
    mittwoch: { start: '11:00', end: '23:00' },
    donnerstag: { start: '11:00', end: '23:00' },
    freitag: { start: '11:00', end: '23:00' },
    samstag: { start: '11:00', end: '23:00' },
    sonntag: { start: '11:00', end: '23:00' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchLegalContent();
    fetchStripeStatus();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect');
      if (response.ok) {
        const data = await response.json();
        setStripeStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    }
  };

  const handleStripeConnect = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        addToast('Fehler beim Verbinden mit Stripe', 'error');
      }
    } catch (error) {
      addToast('Fehler beim Verbinden mit Stripe', 'error');
    } finally {
      setStripeLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSettings(data);
          
          // Parse opening hours if available
          if (data.openingHoursData) {
            setOpeningHoursData(data.openingHoursData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLegalContent = async () => {
    try {
      const response = await fetch('/api/settings/legal');
      if (response.ok) {
        const data = await response.json();
        setLegalContent(data);
      }
    } catch (error) {
      console.error('Error fetching legal content:', error);
    }
  };

  const handleGeneralSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const settingsToSave = {
        ...settings,
        openingHoursData: openingHoursData
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Einstellungen erfolgreich gespeichert!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Fehler: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const handleLegalContentSave = async (type: 'impressum' | 'agb' | 'datenschutz', content: string) => {
    try {
      const response = await fetch('/api/settings/legal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          [`${type}Content`]: content
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLegalContent(prev => ({
          ...prev,
          [`${type}Content`]: content,
          [`${type}LastUpdated`]: result.data[`${type}LastUpdated`]
        }));
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} erfolgreich gespeichert!`);
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving legal content:', error);
      alert('Fehler beim Speichern der rechtlichen Inhalte');
    }
  };

  const updateOpeningHours = (day: string, field: 'start' | 'end', value: string) => {
    setOpeningHoursData(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'restaurant', name: 'Restaurant', icon: DocumentTextIcon },
    { id: 'delivery', name: 'Lieferung', icon: DocumentTextIcon },
    { id: 'business', name: 'Geschäft', icon: DocumentTextIcon },
    { id: 'maintenance', name: 'Wartung', icon: WrenchScrewdriverIcon },
    { id: 'impressum', name: 'Impressum', icon: DocumentTextIcon },
    { id: 'agb', name: 'AGB', icon: ScaleIcon },
    { id: 'datenschutz', name: 'Datenschutz', icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg" data-component="SettingsFormWithTabs">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group inline-flex items-center py-4 px-3 border-b-2 font-medium text-sm rounded-t-lg
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {/* Restaurant Tab */}
        {activeTab === 'restaurant' && (
          <form onSubmit={handleGeneralSettingsSave} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant-Informationen</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                    Restaurant-Name *
                  </label>
                  <input
                    type="text"
                    id="restaurantName"
                    required
                    autoComplete="organization"
                    value={settings?.restaurantName || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefon *
                  </label>
                  <input
                    type="text"
                    id="phone"
                    required
                    autoComplete="tel"
                    value={settings?.phone || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    autoComplete="email"
                    value={settings?.email || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    autoComplete="street-address"
                    value={settings?.address || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Stadt *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    autoComplete="address-level2"
                    value={settings?.city || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    required
                    autoComplete="postal-code"
                    value={settings?.postalCode || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="atuNumber" className="block text-sm font-medium text-gray-700">
                    ATU-Nummer
                  </label>
                  <input
                    type="text"
                    id="atuNumber"
                    autoComplete="off"
                    value={settings?.atuNumber || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, atuNumber: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="fnNumber" className="block text-sm font-medium text-gray-700">
                    FN-Nummer
                  </label>
                  <input
                    type="text"
                    id="fnNumber"
                    autoComplete="off"
                    value={settings?.fnNumber || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, fnNumber: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Logo und Favicon */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <PhotoIcon className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Logo & Favicon</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <MediaPicker
                    label="Restaurant Logo"
                    value={settings?.logo || ''}
                    onChange={(url) => setSettings(prev => ({ ...prev, logo: url }))}
                    acceptedTypes={['image']}
                    placeholder="Logo auswählen"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wird im Header der Website angezeigt
                  </p>
                </div>

                <div>
                  <MediaPicker
                    label="Favicon (32x32px)"
                    value={settings?.favicon || ''}
                    onChange={(url) => setSettings(prev => ({ ...prev, favicon: url }))}
                    acceptedTypes={['image']}
                    placeholder="Favicon auswählen"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Browser-Tab Icon
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours - Only once */}
            <div data-debug="opening-hours-section">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Öffnungszeiten</h3>
              <div className="space-y-4">
                {Object.entries(openingHoursData).map(([day, hours]) => (
                  <div key={`${day}-${hours.start}-${hours.end}`} className="flex items-center space-x-4" data-debug={`day-${day}`}>
                    <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        autoComplete="off"
                        value={hours.start}
                        onChange={(e) => updateOpeningHours(day, 'start', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">bis</span>
                      <input
                        type="time"
                        autoComplete="off"
                        value={hours.end}
                        onChange={(e) => updateOpeningHours(day, 'end', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
              </button>
            </div>
          </form>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <form onSubmit={handleGeneralSettingsSave} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lieferung</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="deliveryDistricts" className="block text-sm font-medium text-gray-700">
                    Liefergebiete (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    id="deliveryDistricts"
                    autoComplete="off"
                    value={settings?.deliveryDistricts || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, deliveryDistricts: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. Innenstadt, Bahnhof, Universität"
                  />
                </div>

                <div>
                  <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700">
                    Mindestbestellwert (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="minOrderAmount"
                    autoComplete="off"
                    value={settings?.minOrderAmount || 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700">
                    Liefergebühr (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="deliveryFee"
                    autoComplete="off"
                    value={settings?.deliveryFee || 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="freeDeliveryThreshold" className="block text-sm font-medium text-gray-700">
                    Kostenlose Lieferung ab (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="freeDeliveryThreshold"
                    autoComplete="off"
                    value={settings?.freeDeliveryThreshold || 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
              </button>
            </div>
          </form>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <form onSubmit={handleGeneralSettingsSave} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geschäftseinstellungen</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700">
                    Standard-MwSt-Satz (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="defaultTaxRate"
                    autoComplete="off"
                    value={settings?.defaultTaxRate || 0.20}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Währung
                  </label>
                  <select
                    id="currency"
                    autoComplete="off"
                    value={settings?.currency || 'EUR'}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="CHF">CHF (CHF)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Zeitzone
                  </label>
                  <select
                    id="timezone"
                    autoComplete="off"
                    value={settings?.timezone || 'Europe/Vienna'}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Europe/Berlin">Europa/Berlin</option>
                    <option value="Europe/Vienna">Europa/Wien</option>
                    <option value="Europe/Zurich">Europa/Zürich</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="orderDeadline" className="block text-sm font-medium text-gray-700">
                    Bestellschluss (HH:MM)
                  </label>
                  <input
                    type="time"
                    id="orderDeadline"
                    autoComplete="off"
                    value={settings?.orderDeadline || '22:00'}
                    onChange={(e) => setSettings(prev => ({ ...prev, orderDeadline: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Stripe Connect Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                Stripe Zahlungen
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {stripeStatus?.connected ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Stripe ist verbunden
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Account ID: {stripeStatus.accountId}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verbunden
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Stripe Connect einrichten
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Verbinden Sie Ihr Stripe-Konto, um Online-Zahlungen zu akzeptieren
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStripeConnect}
                      disabled={stripeLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {stripeLoading ? 'Verbinde...' : 'Stripe verbinden'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
              </button>
            </div>
          </form>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <MaintenanceSettings />
        )}


        {/* Legal Content Tabs */}
        {activeTab === 'impressum' && (
          <LegalContentEditor
            title="Impressum"
            content={legalContent.impressumContent || ''}
            lastUpdated={legalContent.impressumLastUpdated}
            onSave={(content) => handleLegalContentSave('impressum', content)}
          />
        )}

        {activeTab === 'agb' && (
          <LegalContentEditor
            title="Allgemeine Geschäftsbedingungen"
            content={legalContent.agbContent || ''}
            lastUpdated={legalContent.agbLastUpdated}
            onSave={(content) => handleLegalContentSave('agb', content)}
          />
        )}

        {activeTab === 'datenschutz' && (
          <LegalContentEditor
            title="Datenschutzerklärung"
            content={legalContent.datenschutzContent || ''}
            lastUpdated={legalContent.datenschutzLastUpdated}
            onSave={(content) => handleLegalContentSave('datenschutz', content)}
          />
        )}
      </div>
    </div>
  );
}