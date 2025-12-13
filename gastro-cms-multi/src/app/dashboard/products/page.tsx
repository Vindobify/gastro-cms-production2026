'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  Bars3Icon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
  id: number;
  articleNumber: string;
  name: string;
  description?: string;
  price?: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  allergens?: string;
  taxRate: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  isActive: boolean;
}

// Sortable Product Row Component
function SortableProductRow({ product, index, onDelete, onToggleSelect, isSelected, bulkDeleteMode }: {
  product: Product;
  index: number;
  onDelete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  isSelected: boolean;
  bulkDeleteMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const parseAllergens = (allergens?: string) => {
    if (!allergens) return [];
    try {
      const parsed = JSON.parse(allergens);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return allergens.split(',').map(a => a.trim()).filter(Boolean);
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'z-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(product.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            #{index + 1}
          </span>
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            title="Ziehen zum Sortieren"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.articleNumber || '-'}
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          {product.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {product.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.price ? `€${product.price.toFixed(2)}` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.taxRate === 0.20 ? 'bg-blue-100 text-blue-800' :
          product.taxRate === 0.10 ? 'bg-green-100 text-green-800' :
          product.taxRate === 0.00 ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {(product.taxRate * 100).toFixed(0)}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.category?.name || 'Keine Kategorie'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {parseAllergens(product.allergens)
            .filter((allergen: string) => allergen !== 'NONE')
            .map((allergen: string, index: number) => (
            <span
              key={`${product.id}-${allergen}-${index}`}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {allergen}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.isActive ? 'Aktiv' : 'Inaktiv'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <a
            href={`/products/edit/${product.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Bearbeiten"
          >
            <PencilIcon className="h-5 w-5" />
          </a>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-900"
            title="Löschen"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [bulkTaxMode, setBulkTaxMode] = useState(false);
  const [bulkTaxRate, setBulkTaxRate] = useState('0.20'); // Standard: 20% MwSt.
  const [showTaxModal, setShowTaxModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data.sort((a: Product, b: Product) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      error(err.message || 'Fehler beim Laden der Produkte');
    }
  }, [error]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      error(err.message || 'Fehler beim Laden der Kategorien');
    }
  }, [error]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadCategories()]);
      setLoading(false);
    };
    loadData();
  }, [loadProducts, loadCategories]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      product.category?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle product selection
  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    if (!confirm(`${selectedProducts.size} Produkte wirklich löschen?`)) return;

    try {
      const deletePromises = Array.from(selectedProducts).map(id =>
        fetch(`/api/products/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      success(`${selectedProducts.size} Produkte erfolgreich gelöscht`);
      setSelectedProducts(new Set());
      setBulkDeleteMode(false);
      await loadProducts();
    } catch (err: any) {
      error(err.message || 'Fehler beim Löschen der Produkte');
    }
  };

  // Single product delete
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Produkt wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      success('Produkt erfolgreich gelöscht');
      await loadProducts();
    } catch (err: any) {
      error(err.message || 'Fehler beim Löschen des Produkts');
    }
  };

  // Update sort order
  const updateSortOrder = async (productId: number, newSortOrder: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: products.find(p => p.id === productId)?.name || '',
          sortOrder: newSortOrder 
        })
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Update failed');
      }
      
      await loadProducts();
    } catch (err: any) {
      console.error('Sort update error:', err);
      error(err.message || 'Fehler beim Aktualisieren der Sortierung');
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredProducts.findIndex(p => p.id === active.id);
      const newIndex = filteredProducts.findIndex(p => p.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder products array
        const reorderedProducts = arrayMove(filteredProducts, oldIndex, newIndex);
        
        // Update sortOrder for all affected products
        try {
          const updatePromises = reorderedProducts.map(async (product, index) => {
            if (product.sortOrder !== index) {
              return updateSortOrder(product.id, index);
            }
          });
          
          await Promise.all(updatePromises.filter(Boolean));
          success('Produkte erfolgreich sortiert');
        } catch (err) {
          error('Fehler beim Sortieren der Produkte');
        }
      }
    }
  };

  // Parse allergens for display
  const parseAllergens = (allergens?: string) => {
    if (!allergens) return [];
    try {
      const parsed = JSON.parse(allergens);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return allergens.split(',').map(a => a.trim()).filter(Boolean);
    }
  };

  // Bulk update tax rate
  const handleBulkTaxUpdate = async () => {
    if (selectedProducts.size === 0) return;
    
    const newTaxRate = parseFloat(bulkTaxRate);
    if (isNaN(newTaxRate) || newTaxRate < 0 || newTaxRate > 1) {
      error('Bitte geben Sie einen gültigen MwSt.-Satz zwischen 0 und 1 ein (z.B. 0.20 für 20%)');
      return;
    }

    const taxRateText = newTaxRate === 0.20 ? '20% (Standard)' : 
                       newTaxRate === 0.10 ? '10% (Ermäßigt)' : 
                       '0% (Steuerfrei)';
    
    if (!confirm(`${selectedProducts.size} Produkte auf ${taxRateText} MwSt. setzen?`)) return;

    try {
      const updatePromises = Array.from(selectedProducts).map(async (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            price: product.price,
            taxRate: newTaxRate,
            categoryId: product.categoryId,
            allergens: product.allergens
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Fehler bei Produkt ${product.name}: ${errorData.error || 'Update failed'}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);
      
      const taxRateText = newTaxRate === 0.20 ? '20% (Standard)' : 
                         newTaxRate === 0.10 ? '10% (Ermäßigt)' : 
                         '0% (Steuerfrei)';
      
      success(`${selectedProducts.size} Produkte erfolgreich auf ${taxRateText} MwSt. gesetzt`);
      setSelectedProducts(new Set());
      setBulkTaxMode(false);
      setShowTaxModal(false);
      await loadProducts();
    } catch (err: any) {
      error(err.message || 'Fehler beim Aktualisieren der MwSt.');
    }
  };

  if (!user || !['ADMIN', 'RESTAURANT_MANAGER'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Zugriff verweigert</h1>
          <p className="mt-2 text-gray-600">Sie haben keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Produkte" subtitle="Verwalten Sie Produkte Ihres Restaurants">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Produkte" subtitle="Verwalten Sie Produkte Ihres Restaurants">
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Neues Produkt
            </a>
            <button
              onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                bulkDeleteMode 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bulkDeleteMode ? (
                <>
                  <XMarkIcon className="h-4 w-4 mr-2 inline" />
                  Auswahl beenden
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2 inline" />
                  Mehrfach auswählen
                </>
              )}
            </button>

            {bulkDeleteMode && selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-2 inline" />
                {selectedProducts.size} löschen
              </button>
            )}

            {selectedProducts.size > 0 && (
              <button
                onClick={() => setShowTaxModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                MwSt. für {selectedProducts.size} Produkte
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Neues Produkt
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Produkte durchsuchen..."
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Selection Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={selectAllProducts}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-blue-700">
                {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0
                  ? `Alle ${filteredProducts.length} abwählen`
                  : `Alle ${filteredProducts.length} auswählen`
                }
              </span>
            </div>
            <span className="text-sm text-blue-600">
              {selectedProducts.size} von {filteredProducts.length} ausgewählt
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                          onChange={selectAllProducts}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        Sortierung
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikelnummer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produkt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MwSt.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allergene
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredProducts.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <SortableProductRow
                        key={product.id}
                        product={product}
                        index={index}
                        onDelete={handleDeleteProduct}
                        onToggleSelect={toggleProductSelection}
                        isSelected={selectedProducts.has(product.id)}
                        bulkDeleteMode={bulkDeleteMode}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Keine Produkte gefunden, die den Suchkriterien entsprechen.'
                  : 'Noch keine Produkte vorhanden.'
                }
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} von {products.length} Produkten angezeigt
          </div>
        </div>

        {/* Bulk Tax Update Modal */}
        {showTaxModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    MwSt. für {selectedProducts.size} Produkte aktualisieren
                  </h3>
                  <button
                    onClick={() => setShowTaxModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neuer MwSt.-Satz
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="tax-20"
                        name="taxRate"
                        value="0.20"
                        checked={bulkTaxRate === '0.20'}
                        onChange={(e) => setBulkTaxRate(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="tax-20" className="ml-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          20%
                        </span>
                        <span className="text-sm text-gray-700">Standard (Getränke)</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="tax-10"
                        name="taxRate"
                        value="0.10"
                        checked={bulkTaxRate === '0.10'}
                        onChange={(e) => setBulkTaxRate(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="tax-10" className="ml-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                          10%
                        </span>
                        <span className="text-sm text-gray-700">Ermäßigt (Speisen)</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="tax-0"
                        name="taxRate"
                        value="0.00"
                        checked={bulkTaxRate === '0.00'}
                        onChange={(e) => setBulkTaxRate(e.target.value)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <label htmlFor="tax-0" className="ml-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                          0%
                        </span>
                        <span className="text-sm text-gray-700">Steuerfrei</span>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Wählen Sie eine der verfügbaren MwSt.-Klassen aus
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTaxModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleBulkTaxUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    MwSt. aktualisieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
