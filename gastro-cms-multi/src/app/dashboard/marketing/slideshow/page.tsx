'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import SlideshowModal from '@/components/marketing/SlideshowModal';

interface Slideshow {
  id: number;
  title: string;
  description?: string;
  backgroundImage: string;
  headline: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  slideshowItems: SlideshowItem[];
  createdAt: string;
  updatedAt: string;
}

interface SlideshowItem {
  id: number;
  itemType: 'PRODUCT' | 'COUPON';
  itemId: number;
  title?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function SlideshowPage() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlideshow, setEditingSlideshow] = useState<Slideshow | null>(null);

  useEffect(() => {
    fetchSlideshows();
  }, []);

  const fetchSlideshows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/slideshow');
      if (response.ok) {
        const data = await response.json();
        setSlideshows(data);
      }
    } catch (error) {
      console.error('Error fetching slideshows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slideshow: Slideshow) => {
    setEditingSlideshow(slideshow);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSlideshow(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diese Slideshow wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/slideshow/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSlideshows(slideshows.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting slideshow:', error);
    }
  };

  const handleToggleActive = async (slideshow: Slideshow) => {
    try {
      const response = await fetch(`/api/slideshow/${slideshow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slideshow,
          isActive: !slideshow.isActive
        })
      });

      if (response.ok) {
        setSlideshows(slideshows.map(s => 
          s.id === slideshow.id ? { ...s, isActive: !s.isActive } : s
        ));
      }
    } catch (error) {
      console.error('Error updating slideshow:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSlideshow(null);
  };

  const handleSlideshowSaved = () => {
    fetchSlideshows();
    handleModalClose();
  };

  if (loading) {
    return (
      <DashboardLayout title="Marketing" subtitle="Slideshow verwalten">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Slideshows...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Marketing" subtitle="Slideshow verwalten">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Slideshows ({slideshows.length})
            </h3>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Neue Slideshow
            </button>
          </div>

          {slideshows.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <PresentationChartLineIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Slideshows</h3>
              <p className="mt-1 text-sm text-gray-500">
                Erstellen Sie Ihre erste Slideshow für das Marketing.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                  style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Slideshow erstellen
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {slideshows.map((slideshow) => (
                <div key={slideshow.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Background Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    {slideshow.backgroundImage ? (
                      <img
                        src={slideshow.backgroundImage}
                        alt={slideshow.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <PresentationChartLineIcon className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slideshow.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slideshow.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    
                    {/* Content Preview */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      <h3 className="text-lg font-semibold mb-2">{slideshow.headline}</h3>
                      {slideshow.subheadline && (
                        <p className="text-sm opacity-90">{slideshow.subheadline}</p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{slideshow.title}</h4>
                    {slideshow.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{slideshow.description}</p>
                    )}

                    {/* Items Count */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{slideshow.slideshowItems.length} Elemente</span>
                      <span>Sortierung: {slideshow.sortOrder}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(slideshow)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                          <PencilIcon className="w-3 h-3 mr-1" />
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleToggleActive(slideshow)}
                          className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                            slideshow.isActive
                              ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                              : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {slideshow.isActive ? (
                            <>
                              <EyeSlashIcon className="w-3 h-3 mr-1" />
                              Deaktivieren
                            </>
                          ) : (
                            <>
                              <EyeIcon className="w-3 h-3 mr-1" />
                              Aktivieren
                            </>
                          )}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(slideshow.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="w-3 h-3 mr-1" />
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SlideshowModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          slideshow={editingSlideshow}
          onSaved={handleSlideshowSaved}
        />
      )}
    </DashboardLayout>
  );
}
