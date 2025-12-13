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
  Bars3Icon
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

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

// Helper function to get category icon
const getCategoryIcon = (category: Category): string => {
  if (category.icon) {
    const FOOD_ICONS = [
      { id: 'pizza', emoji: '🍕' },
      { id: 'pasta', emoji: '🍝' },
      { id: 'burger', emoji: '🍔' },
      { id: 'salad', emoji: '🥗' },
      { id: 'soup', emoji: '🍲' },
      { id: 'appetizer', emoji: '🥙' },
      { id: 'dessert', emoji: '🍰' },
      { id: 'drink', emoji: '🥤' },
      { id: 'meat', emoji: '🥩' },
      { id: 'fish', emoji: '🐟' },
      { id: 'cheese', emoji: '🧀' },
      { id: 'rice', emoji: '🍚' },
      { id: 'bread', emoji: '🍞' },
      { id: 'sandwich', emoji: '🥪' },
      { id: 'taco', emoji: '🌮' },
      { id: 'hotdog', emoji: '🌭' },
      { id: 'fries', emoji: '🍟' },
      { id: 'chicken', emoji: '🍗' },
      { id: 'egg', emoji: '🥚' },
      { id: 'bacon', emoji: '🥓' },
      { id: 'croissant', emoji: '🥐' },
      { id: 'pancake', emoji: '🥞' },
      { id: 'waffle', emoji: '🧇' },
      { id: 'cookie', emoji: '🍪' },
      { id: 'donut', emoji: '🍩' },
      { id: 'ice-cream', emoji: '🍦' },
      { id: 'coffee', emoji: '☕' },
      { id: 'wine', emoji: '🍷' },
      { id: 'beer', emoji: '🍺' },
      { id: 'cocktail', emoji: '🍹' },
      { id: 'fruit', emoji: '🍎' },
      { id: 'vegetable', emoji: '🥕' },
    ];
    
    const iconData = FOOD_ICONS.find(icon => icon.id === category.icon);
    if (iconData) {
      return iconData.emoji;
    }
  }
  return ''; // No fallback icon
};

// Sortable Category Row Component
function SortableCategoryRow({ category, index, filteredCategories, onDelete }: {
  category: Category;
  index: number;
  filteredCategories: Category[];
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''} ${isDragging ? 'z-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            #{index + 1} {index === 0 ? '(Standard)' : ''}
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
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
            {getCategoryIcon(category) && (
              <span className="text-lg">{getCategoryIcon(category)}</span>
            )}
            {category.name}
          </div>
          {category.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {category.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {category._count?.products || 0} Produkte
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {category.isActive ? 'Aktiv' : 'Inaktiv'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(category.createdAt).toLocaleDateString('de-DE')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <a
            href={`/categories/edit/${category.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Bearbeiten"
          >
            <PencilIcon className="h-5 w-5" />
          </a>
          <button
            onClick={() => onDelete(category.id)}
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

export default function CategoriesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories?include=_count');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data.sort((a: Category, b: Category) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      error(err.message || 'Fehler beim Laden der Kategorien');
    }
  }, [error]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadCategories();
      setLoading(false);
    };
    loadData();
  }, [loadCategories]);

  // Filter categories
  const filteredCategories = categories.filter(category => 
    !searchTerm || category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update sort order
  const updateSortOrder = async (categoryId: number, newSortOrder: number) => {
    try {
      console.log('Updating category:', categoryId, 'to sortOrder:', newSortOrder);
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: categories.find(c => c.id === categoryId)?.name || '',
          sortOrder: newSortOrder 
        })
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Update failed');
      }
      
      await loadCategories();
      success('Sortierung aktualisiert');
    } catch (err: any) {
      console.error('Sort update error:', err);
      error(err.message || 'Fehler beim Aktualisieren der Sortierung');
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredCategories.findIndex(c => c.id === active.id);
      const newIndex = filteredCategories.findIndex(c => c.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder categories array
        const reorderedCategories = arrayMove(filteredCategories, oldIndex, newIndex);
        
        // Update sortOrder for all affected categories
        try {
          const updatePromises = reorderedCategories.map(async (category, index) => {
            if (category.sortOrder !== index) {
              return updateSortOrder(category.id, index);
            }
          });
          
          await Promise.all(updatePromises.filter(Boolean));
          success('Kategorien erfolgreich sortiert');
        } catch (err) {
          error('Fehler beim Sortieren der Kategorien');
        }
      }
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Kategorie wirklich löschen? Alle Produkte in dieser Kategorie werden ohne Kategorie sein.')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      success('Kategorie erfolgreich gelöscht');
      await loadCategories();
    } catch (err: any) {
      error(err.message || 'Fehler beim Löschen der Kategorie');
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
      <DashboardLayout title="Kategorien" subtitle="Verwalten Sie Produktkategorien">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Kategorien" subtitle="Verwalten Sie Produktkategorien">
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Kategorien durchsuchen..."
                className="pl-10 w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/categories/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Neue Kategorie
            </a>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Kategorien Sortierung
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Die Reihenfolge bestimmt die Anzeige im Frontend. Die erste Kategorie wird standardmäßig ausgewählt.
            </p>
          </div>
          
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
                      Sortierung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produkte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredCategories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category, index) => (
                      <SortableCategoryRow
                        key={category.id}
                        category={category}
                        index={index}
                        filteredCategories={filteredCategories}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm 
                  ? 'Keine Kategorien gefunden, die den Suchkriterien entsprechen.'
                  : 'Noch keine Kategorien vorhanden.'
                }
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Frontend-Verhalten
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Die erste Kategorie wird automatisch im Frontend ausgewählt</li>
                  <li>Keine "Alle" Option - verhindert unendlich lange Produktlisten</li>
                  <li>Kategorien werden in der hier definierten Reihenfolge angezeigt</li>
                  <li>Inaktive Kategorien werden im Frontend nicht angezeigt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            {filteredCategories.length} von {categories.length} Kategorien angezeigt
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
