'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '@/lib/url';

interface AssetVariant {
  id: string;
  storedPath: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

interface Asset {
  id: string;
  storedPath: string;
  originalName: string;
  mime: string; // Geändert von mimeType zu mime
  size: number;
  url: string;
  alt?: string;
  title?: string;
  description?: string;
  folderId?: string;
  createdAt: string;
  variants: AssetVariant[];
}

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSave: (updatedAsset: Asset) => void;
}

export default function AssetEditModal({
  isOpen,
  onClose,
  asset,
  onSave
}: AssetEditModalProps) {
  const [formData, setFormData] = useState({
    alt: '',
    title: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        alt: asset.alt || '',
        title: asset.title || '',
        description: asset.description || ''
      });
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/media/${asset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedAsset = await response.json();
        onSave(updatedAsset);
        onClose();
      } else {
        const error = await response.json();
        alert(`Fehler beim Speichern: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Fehler beim Speichern der Änderungen');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Datei bearbeiten</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex space-x-6">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {asset.mime.startsWith('image/') ? (
                    <img
                      src={getMediaUrl(asset.url)}
                      alt={asset.alt || asset.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">{asset.mime}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  <p className="font-medium">{asset.originalName}</p>
                  <p>{new Date(asset.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Titel
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Titel der Datei"
                    />
                  </div>

                  <div>
                    <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                      Alt-Text
                    </label>
                    <input
                      type="text"
                      name="alt"
                      id="alt"
                      value={formData.alt}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Beschreibung für Screenreader"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Beschreibung
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Detaillierte Beschreibung der Datei"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Speichern...' : 'Speichern'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
