'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
}

export default function UpdateBadge() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verwende die neue Update-API
      const response = await fetch('/api/updates/status');
      const data = await response.json();
      
      if (response.ok) {
        setUpdateInfo(data);
      } else {
        setError(data.error || 'Fehler beim Prüfen der Updates');
      }
    } catch (err) {
      setError('Netzwerkfehler beim Prüfen der Updates');
      console.error('Update Check Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        <span className="text-sm">Prüfe Updates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span className="text-sm">Update-Check fehlgeschlagen</span>
      </div>
    );
  }

  if (!updateInfo?.hasUpdate) {
    return (
      <div className="flex items-center space-x-2 text-green-500">
        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        <span className="text-sm">Auf dem neuesten Stand</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></div>
      </div>
      <span className="text-sm font-medium text-red-600">
        Update verfügbar!
      </span>
      <span className="text-xs text-gray-500">
        v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
      </span>
    </div>
  );
}
