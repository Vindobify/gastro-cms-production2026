'use client';

import { useState, useEffect } from 'react';
import { PhotoIcon, FolderIcon, PlusIcon, DocumentIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import MediaLibraryModal from '@/components/media/MediaLibraryModal';
import AssetEditModal from '@/components/media/AssetEditModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { getMediaUrl } from '@/lib/url';

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

interface AssetVariant {
  id: string;
  storedPath: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

interface AssetFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: AssetFolder[];
  _count: {
    assets: number;
  };
}

export default function MediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAssets();
    loadFolders();
  }, [currentFolder]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const url = currentFolder 
        ? `/api/media/list?folderId=${currentFolder}`
        : '/api/media/list';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      } else {
        console.error('Error loading assets:', response.statusText);
        setAssets([]);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const url = currentFolder 
        ? `/api/media/folders?parentId=${currentFolder}`
        : '/api/media/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      } else {
        console.error('Error loading folders:', response.statusText);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mime: string) => mime.startsWith('image/');

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Datei löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/delete/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Reload assets after deletion
        loadAssets();
      } else {
        const error = await response.json();
        alert(`Fehler beim Löschen: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Fehler beim Löschen der Datei');
    }
  };

  const handleAssetSave = (updatedAsset: Asset) => {
    // Update the asset in the local state
    setAssets(prev => prev.map(asset => 
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Mediathek</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Verwalten Sie Ihre Bilder, Dokumente und andere Medien-Dateien.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Datei hochladen
                </button>
              </div>
            </div>

      {/* Search Bar */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="Medien durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Media Library Content */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Lade Medien...</p>
              </div>
            ) : folders.length === 0 && filteredAssets.length === 0 ? (
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Keine Medien</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Laden Sie Ihre erste Datei hoch, um zu beginnen.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Datei hochladen
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Folders */}
                {folders.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Ordner</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="relative group cursor-pointer"
                          onClick={() => setCurrentFolder(folder.id)}
                        >
                          <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <FolderIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="mt-2 text-xs font-medium text-gray-900 truncate">
                            {folder.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {folder._count.assets} Dateien
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assets */}
                {filteredAssets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Dateien</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredAssets.map((asset) => (
                        <div key={asset.id} className="relative group">
                          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                            {isImage(asset.mime) ? (
                              <>
                                <img
                                  src={getMediaUrl(asset.url)}
                                  alt={asset.alt || asset.originalName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback für fehlende Bilder
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 hidden">
                                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <DocumentIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Action buttons overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAsset(asset)}
                                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                title="Bearbeiten"
                              >
                                <PencilIcon className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                title="Löschen"
                              >
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="mt-2 text-xs font-medium text-gray-900 truncate">
                            {asset.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(asset.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                // Reload assets after upload
                loadAssets();
                loadFolders();
              }}
              onSelect={() => {}} // No selection needed for management view
              allowMultiple={false}
            />

            {/* Asset Edit Modal */}
            <AssetEditModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedAsset(null);
              }}
              asset={selectedAsset}
              onSave={handleAssetSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
