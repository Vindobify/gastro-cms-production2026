'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import MediaPicker from '@/components/media/MediaPicker';
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  GlobeAltIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
  robotsTxt: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  structuredDataEnabled: boolean;
  sitemapEnabled: boolean;
}

export default function SEOPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SEOSettings>({
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    favicon: '',
    robotsTxt: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    structuredDataEnabled: true,
    sitemapEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const response = await fetch('/api/seo-settings');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result; // Handle both wrapped and direct responses
        setSettings({
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || '',
          favicon: data.favicon || '',
          robotsTxt: data.robotsTxt || '',
          googleAnalyticsId: data.googleAnalyticsId || '',
          googleTagManagerId: data.googleTagManagerId || '',
          facebookPixelId: data.facebookPixelId || '',
          structuredDataEnabled: data.structuredDataEnabled ?? true,
          sitemapEnabled: data.sitemapEnabled ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/seo-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        addToast('SEO-Einstellungen erfolgreich gespeichert', 'success');
      } else {
        addToast('Fehler beim Speichern der SEO-Einstellungen', 'error');
      }
    } catch (error) {
      addToast('Fehler beim Speichern der SEO-Einstellungen', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SEOSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SEO-Einstellungen</h1>
                <p className="text-gray-600 mt-1">
                  Optimieren Sie Ihre Website für Suchmaschinen
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Grundeinstellungen */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Grundeinstellungen</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title (max. 60 Zeichen)
                    </label>
                    <input
                      type="text"
                      value={settings.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      maxLength={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ihr Restaurant Name - Frische Küche mit Lieferservice"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.metaTitle?.length || 0}/60 Zeichen
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description (max. 160 Zeichen)
                    </label>
                    <textarea
                      value={settings.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      maxLength={160}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Bestellen Sie bei uns frische Küche mit schneller Lieferung. Jetzt online bestellen!"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.metaDescription?.length || 0}/160 Zeichen
                    </p>
                  </div>
                </div>
              </div>

              {/* Bilder */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <PhotoIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Bilder & Icons</h2>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <MediaPicker
                      label="Open Graph Image (1200x630px)"
                      value={settings.ogImage}
                      onChange={(url) => handleInputChange('ogImage', url)}
                      acceptedTypes={['image']}
                      placeholder="OG-Image auswählen"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wird in sozialen Medien angezeigt
                    </p>
                  </div>

                  <div>
                    <MediaPicker
                      label="Favicon (32x32px)"
                      value={settings.favicon}
                      onChange={(url) => handleInputChange('favicon', url)}
                      acceptedTypes={['image']}
                      placeholder="Favicon auswählen"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Browser-Tab Icon
                    </p>
                  </div>
                </div>
              </div>

          {/* Tracking & Analytics */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Tracking & Analytics</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={settings.googleTagManagerId}
                  onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="GTM-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={settings.facebookPixelId}
                  onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="123456789012345"
                />
              </div>
            </div>
          </div>

          {/* Erweiterte Einstellungen */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Erweiterte Einstellungen</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Structured Data (Schema.org)</h3>
                  <p className="text-sm text-gray-500">
                    Automatische Generierung von strukturierten Daten für bessere Suchergebnisse
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.structuredDataEnabled}
                    onChange={(e) => handleInputChange('structuredDataEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sitemap.xml</h3>
                  <p className="text-sm text-gray-500">
                    Automatische Generierung der Sitemap für Suchmaschinen
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sitemapEnabled}
                    onChange={(e) => handleInputChange('sitemapEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom robots.txt
                </label>
                <textarea
                  value={settings.robotsTxt}
                  onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder={`User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml

Disallow: /dashboard
Disallow: /api/`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leer lassen für automatische Generierung
                </p>
              </div>
            </div>
          </div>

          {/* SEO Tools */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">SEO Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <DocumentTextIcon className="w-8 h-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sitemap anzeigen</h3>
                  <p className="text-sm text-gray-500">XML-Sitemap öffnen</p>
                </div>
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <DocumentTextIcon className="w-8 h-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Robots.txt anzeigen</h3>
                  <p className="text-sm text-gray-500">Robots-Datei öffnen</p>
                </div>
              </a>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
