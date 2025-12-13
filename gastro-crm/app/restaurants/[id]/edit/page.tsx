'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RESTAURANT_CATEGORIES } from '@/lib/restaurantCategories';

export default function EditRestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    domain: string;
    subdomain: string;
    plan: string;
    ownerName: string;
    email: string;
    phone: string;
    isActive: boolean;
    commissionRate: number;
    settings: {
      restaurantName: string;
      address: string;
      city: string;
      postalCode: string;
      phone: string;
      email: string;
      coverImage: string;
      category: string;
    };
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadRestaurant();
    }
  }, [params.id]);

  const loadRestaurant = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${params.id}`);
      if (!res.ok) {
        setError('Restaurant konnte nicht geladen werden');
        return;
      }
      const data = await res.json();
      setFormData({
        id: data.id,
        name: data.name || '',
        domain: data.domain || '',
        subdomain: data.subdomain || '',
        plan: data.plan || 'STANDARD',
        ownerName: data.ownerName || '',
        email: data.email || '',
        phone: data.phone || '',
        isActive: data.isActive,
        commissionRate: data.commissionRate ?? 0.1,
        settings: {
          restaurantName: data.settings?.restaurantName || data.name || '',
          address: data.settings?.address || '',
          city: data.settings?.city || '',
          postalCode: data.settings?.postalCode || '',
          phone: data.settings?.phone || data.phone || '',
          email: data.settings?.email || data.email || '',
          coverImage: data.settings?.coverImage || '',
          category: data.settings?.category || '',
        },
      });
    } catch (err) {
      setError('Fehler beim Laden des Restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurants/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          domain: formData.domain || null,
          subdomain: formData.subdomain || null,
          plan: formData.plan,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone || null,
          isActive: formData.isActive,
          commissionRate: Number(formData.commissionRate) || 0,
          settings: formData.settings,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler beim Speichern');
        return;
      }
      router.push(`/restaurants/${formData.id}`);
    } catch (err) {
      setError('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    if (!confirm('Restaurant wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/restaurants/${formData.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler beim Löschen');
        return;
      }
      router.push('/'); // zurück zur Liste (Dashboard)
    } catch (err) {
      setError('Fehler beim Löschen');
    }
  };

  const toggleActive = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isActive: !formData.isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler beim Aktualisieren');
        return;
      }
      setFormData({ ...formData, isActive: !formData.isActive });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/restaurants/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          settings: { ...formData.settings, coverImage: data.url },
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler beim Hochladen');
      }
    } catch (error) {
      setError('Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !formData) {
    return (
      <DashboardLayout title="Restaurant bearbeiten">
        <div className="py-8 text-center text-gray-500">Lade...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Restaurant bearbeiten">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {formData.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
                <button
                  type="button"
                  onClick={toggleActive}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={saving}
                >
                  {formData.isActive ? 'Deaktivieren' : 'Aktivieren'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={saving}
              >
                Löschen
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurant Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="pizzeria1140.at"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subdomain</label>
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  placeholder="mario.gastro-cms.io"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inhaber</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-Mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provision %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant-Einstellungen</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Anzeigename</label>
                  <input
                    type="text"
                    value={formData.settings.restaurantName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, restaurantName: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={formData.settings.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, address: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stadt</label>
                  <input
                    type="text"
                    value={formData.settings.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, city: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postleitzahl</label>
                  <input
                    type="text"
                    value={formData.settings.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, postalCode: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restaurant Telefon</label>
                  <input
                    type="text"
                    value={formData.settings.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, phone: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restaurant E-Mail</label>
                  <input
                    type="email"
                    value={formData.settings.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, email: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                  <select
                    value={formData.settings.category || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, category: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Keine Kategorie</option>
                    {RESTAURANT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant-Bild (für Landing Page)
                  </label>
                  {formData.settings.coverImage ? (
                    <div className="mt-2">
                      <Image
                        src={formData.settings.coverImage}
                        alt="Restaurant Cover"
                        width={300}
                        height={200}
                        className="rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            settings: { ...formData.settings, coverImage: '' },
                          })
                        }
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Bild entfernen
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && <p className="mt-2 text-sm text-gray-500">Wird hochgeladen...</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

