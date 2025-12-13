'use client';

import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MediaLibraryModal from './MediaLibraryModal';
import { getMediaUrl } from '@/lib/url';

interface Asset {
  id: string;
  storedPath: string;
  originalName: string;
  mime: string;
  size: number;
  url: string;
  alt?: string;
  title?: string;
  description?: string;
  folderId?: string;
  createdAt: string;
  variants: any[];
}

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  acceptedTypes?: string[];
  placeholder?: string;
  className?: string;
  label?: string;
  preview?: boolean;
}

export default function MediaPicker({
  value,
  onChange,
  onClear,
  acceptedTypes = ['image'],
  placeholder = 'Datei auswählen',
  className = '',
  label,
  preview = true
}: MediaPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetSelect = (asset: Asset) => {
    onChange(asset.url);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const isImage = value && (
    value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
    acceptedTypes.includes('image')
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Preview */}
        {value && preview && (
          <div className="relative inline-block">
            {isImage ? (
              <div className="relative">
                <img
                  src={getMediaUrl(value)}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  onClick={handleClear}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {value.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">Datei ausgewählt</p>
                </div>
                <button
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <PhotoIcon className="w-5 h-5" />
            <span>{value ? 'Ändern' : placeholder}</span>
          </button>
          
          {value && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Entfernen
            </button>
          )}
        </div>

        {/* Current URL display */}
        {value && (
          <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border">
            {value}
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAssetSelect}
        acceptedTypes={acceptedTypes}
        title="Datei auswählen"
      />
    </div>
  );
}
