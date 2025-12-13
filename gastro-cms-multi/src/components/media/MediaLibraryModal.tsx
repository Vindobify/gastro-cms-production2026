'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, FolderIcon, PhotoIcon, DocumentIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  filename: string;
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

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: Asset) => void;
  allowMultiple?: boolean;
  acceptedTypes?: string[];
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false,
  acceptedTypes = [],
  title = 'Mediathek'
}: MediaLibraryModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load folders on mount
  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadAssets();
    }
  }, [isOpen, currentFolder, searchQuery]);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/media/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolder) params.set('folderId', currentFolder);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '50');

      const response = await fetch(`/api/media/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append('file', file);
      });
      
      if (currentFolder) {
        formData.append('folderId', currentFolder);
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Reload assets to show new uploads
        loadAssets();
        setShowUpload(false);
        setUploadFiles(null);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    if (allowMultiple) {
      const isSelected = selectedAssets.find(a => a.id === asset.id);
      if (isSelected) {
        setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id));
      } else {
        setSelectedAssets([...selectedAssets, asset]);
      }
    } else {
      if (onSelect) {
        onSelect(asset);
        onClose();
      }
    }
  };

  const handleConfirmSelection = () => {
    if (onSelect && selectedAssets.length > 0) {
      if (allowMultiple) {
        // For multiple selection, we'd need to modify the interface
        onSelect(selectedAssets[0]); // For now, just select the first one
      }
      onClose();
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAssets = assets.filter(asset => {
    if (acceptedTypes.length > 0) {
      return acceptedTypes.some(type => asset.mime.startsWith(type));
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowUpload(!showUpload)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
              >
                Upload
              </button>
              
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`p-2 rounded ${view === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {showUpload && (
            <div className="p-4 border-b bg-blue-50">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept={acceptedTypes.length > 0 ? acceptedTypes.map(type => `${type}/*`).join(',') : undefined}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <PhotoIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-blue-600">
                    {isUploading ? 'Uploading...' : 'Click to upload files'}
                  </p>
                  <p className="text-sm text-blue-500">or drag and drop</p>
                </label>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Folders */}
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Ordner</h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(null)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-2 ${
                      !currentFolder ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FolderIcon className="w-5 h-5" />
                    <span>Alle Dateien</span>
                  </button>
                  
                  {folders.map((folder) => (
                    <button
                      type="button"
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder.id)}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-2 ${
                        currentFolder === folder.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FolderIcon className="w-5 h-5" />
                      <span>{folder.name}</span>
                      <span className="text-xs text-gray-500">({folder._count.assets})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <div className="p-4">
                  {view === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {filteredAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => handleAssetSelect(asset)}
                          className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                            selectedAssets.find(a => a.id === asset.id) 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            {asset.mime.startsWith('image/') ? (
                              <img
                                src={getMediaUrl(asset.url)}
                                alt={asset.alt || asset.originalName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getFileIcon(asset.mime)
                            )}
                          </div>
                          
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {asset.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(asset.size)}
                            </p>
                          </div>

                          {selectedAssets.find(a => a.id === asset.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => handleAssetSelect(asset)}
                          className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer ${
                            selectedAssets.find(a => a.id === asset.id)
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {asset.mime.startsWith('image/') ? (
                              <img
                                src={getMediaUrl(asset.url)}
                                alt={asset.alt || asset.originalName}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              getFileIcon(asset.mime)
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {asset.originalName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(asset.size)} • {new Date(asset.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {selectedAssets.find(a => a.id === asset.id) && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredAssets.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchQuery ? 'Keine Dateien gefunden' : 'Keine Dateien vorhanden'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {allowMultiple && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                {selectedAssets.length} Datei(en) ausgewählt
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={selectedAssets.length === 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Auswählen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
