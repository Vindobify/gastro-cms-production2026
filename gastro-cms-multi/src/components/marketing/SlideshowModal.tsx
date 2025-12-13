'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import MediaLibraryModal from '@/components/media/MediaLibraryModal';

interface Slideshow {
  id?: number;
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
}

interface SlideshowItem {
  id?: number;
  itemType: 'PRODUCT' | 'COUPON';
  itemId: number;
  title?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface Coupon {
  id: number;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
}

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideshow: Slideshow | null;
  onSaved: () => void;
}

export default function SlideshowModal({
  isOpen,
  onClose,
  slideshow,
  onSaved
}: SlideshowModalProps) {
  const [formData, setFormData] = useState<Slideshow>({
    title: '',
    description: '',
    backgroundImage: '',
    headline: '',
    subheadline: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    sortOrder: 0,
    slideshowItems: []
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'background' | 'item'>('background');
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (slideshow) {
        setFormData(slideshow);
      } else {
        setFormData({
          title: '',
          description: '',
          backgroundImage: '',
          headline: '',
          subheadline: '',
          buttonText: '',
          buttonLink: '',
          isActive: true,
          sortOrder: 0,
          slideshowItems: []
        });
      }
    }
  }, [isOpen, slideshow]);

  const fetchData = async () => {
    try {
      const [productsRes, couponsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/coupons')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (field: keyof Slideshow, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    const newItem: SlideshowItem = {
      itemType: 'PRODUCT',
      itemId: 0,
      title: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: formData.slideshowItems.length
    };

    setFormData(prev => ({
      ...prev,
      slideshowItems: [...prev.slideshowItems, newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slideshowItems: prev.slideshowItems.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof SlideshowItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      slideshowItems: prev.slideshowItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.slideshowItems.length - 1)
    ) {
      return;
    }

    const newItems = [...formData.slideshowItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update sortOrder
    newItems.forEach((item, i) => {
      item.sortOrder = i;
    });

    setFormData(prev => ({
      ...prev,
      slideshowItems: newItems
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const url = slideshow ? `/api/slideshow/${slideshow.id}` : '/api/slideshow';
      const method = slideshow ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        console.error('Error saving slideshow:', errorData);
        alert(`Fehler beim Speichern: ${errorData.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Error saving slideshow:', error);
      alert('Netzwerkfehler beim Speichern der Slideshow');
    } finally {
      setLoading(false);
    }
  };

  const openMediaPicker = (type: 'background' | 'item', itemIndex?: number) => {
    setMediaPickerType(type);
    if (itemIndex !== undefined) {
      setEditingItemIndex(itemIndex);
    }
    setShowMediaPicker(true);
  };

  const handleMediaSelected = (asset: any) => {
    if (mediaPickerType === 'background') {
      handleInputChange('backgroundImage', asset.url);
    } else if (editingItemIndex >= 0) {
      handleItemChange(editingItemIndex, 'image', asset.url);
    }
    setShowMediaPicker(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold">
                  {slideshow ? 'Slideshow bearbeiten' : 'Neue Slideshow erstellen'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Settings */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Slideshow Titel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Beschreibung der Slideshow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hintergrundbild *
                    </label>
                    <div className="flex items-center space-x-3">
                      {formData.backgroundImage && (
                        <img
                          src={formData.backgroundImage}
                          alt="Background"
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openMediaPicker('background')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Bild auswählen
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hauptüberschrift *
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => handleInputChange('headline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Hauptüberschrift für die Slideshow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unterüberschrift
                    </label>
                    <input
                      type="text"
                      value={formData.subheadline}
                      onChange={(e) => handleInputChange('subheadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Unterüberschrift (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button-Text
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="z.B. Jetzt bestellen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button-Link
                      </label>
                      <input
                        type="text"
                        value={formData.buttonLink}
                        onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="z.B. /speisekarte"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sortierung
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="mr-2 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Aktiv</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Slideshow Items */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Slideshow Elemente</h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Element hinzufügen
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formData.slideshowItems.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            Element {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsUpDownIcon className="w-4 h-4 rotate-90" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(index, 'down')}
                              disabled={index === formData.slideshowItems.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsUpDownIcon className="w-4 h-4 -rotate-90" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Typ
                            </label>
                            <select
                              value={item.itemType}
                              onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="PRODUCT">Produkt</option>
                              <option value="COUPON">Gutschein</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Auswahl
                            </label>
                            <select
                              value={item.itemId}
                              onChange={(e) => handleItemChange(index, 'itemId', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value={0}>Bitte wählen...</option>
                              {item.itemType === 'PRODUCT' 
                                ? products.map(product => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} - €{product.price}
                                    </option>
                                  ))
                                : coupons.map(coupon => (
                                    <option key={coupon.id} value={coupon.id}>
                                      {coupon.name} - {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                                    </option>
                                  ))
                              }
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Titel (optional)
                            </label>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="Überschreibt Standard-Titel"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Beschreibung (optional)
                            </label>
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="Überschreibt Standard-Text"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Bild (optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            {item.image && (
                              <img
                                src={item.image}
                                alt="Item"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => openMediaPicker('item', index)}
                              className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                              Bild auswählen
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.slideshowItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Keine Elemente hinzugefügt</p>
                        <p className="text-sm">Fügen Sie Produkte oder Gutscheine hinzu</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="text-sm text-gray-600">
                * Pflichtfelder
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.title || !formData.backgroundImage || !formData.headline}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
                >
                  {loading ? 'Speichere...' : 'Speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaLibraryModal
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelected}
          acceptedTypes={['image']}
          title="Bild auswählen"
        />
      )}
    </>
  );
}
