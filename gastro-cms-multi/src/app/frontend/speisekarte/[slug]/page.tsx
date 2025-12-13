'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import CanonicalTag from '@/components/seo/CanonicalTag';
import StructuredData from '@/components/seo/StructuredData';
import { 
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import ProductCard from '@/components/frontend/ProductCard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CSS für versteckte Scrollbars und Animationen
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .animate-spin-slow {
    animation: spin 20s linear infinite;
  }
  .animate-counter-spin {
    animation: counter-spin 20s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes counter-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
`;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: number;
  isActive: boolean;
  taxRate: number;
  allergens?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface ExtraGroup {
  id: number;
  name: string;
  selectionType: string;
  maxSelections?: number;
  extras: Array<{
    id: number;
    name: string;
    price: number;
    isFree: boolean;
  }>;
}

// Helper function to get emoji for category from database
const getCategoryEmoji = (category: Category): string => {
  // If category has an icon from database, get the emoji from FOOD_ICONS
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
  
  return ''; // No icon if not assigned
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [extras, setExtras] = useState<ExtraGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CSS für versteckte Scrollbars einfügen
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = scrollbarHideStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, extrasRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/extras')
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          
          // Find category by slug
          const category = categoriesData.find((cat: Category) => cat.slug === categorySlug);
          if (category) {
            setCurrentCategory(category);
          } else {
            setNotFound(true);
          }
        }

        if (extrasRes.ok) {
          const extrasData = await extrasRes.json();
          setExtras(extrasData);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const couponCode = urlParams.get('coupon');
    
    if (couponCode) {
      // Validate and apply coupon via API
      const validateAndApplyCoupon = async () => {
        try {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: couponCode, orderAmount: 0 }),
          });

          if (response.ok) {
            const couponData = await response.json();
            // Apply coupon logic here
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Gutschein "${couponData.code}" wurde aktiviert!
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
            
            // Remove coupon parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('coupon');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            const errorData = await response.json();
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              ${errorData.message || 'Gutschein konnte nicht aktiviert werden'}
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
          }
        } catch (error) {
          console.error('Coupon validation error:', error);
        }
      };

      validateAndApplyCoupon();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Speisekarte...</p>
        </div>
      </div>
    );
  }

  if (notFound || !currentCategory) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-gray-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategorie nicht gefunden</h1>
          <p className="text-gray-600 mb-8">
            Die angeforderte Kategorie "{categorySlug}" existiert nicht oder ist nicht verfügbar.
          </p>
          <Link
            href="/frontend/speisekarte"
            className="inline-flex items-center px-6 py-3 font-semibold rounded-xl transition-colors"
            style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zurück zur Speisekarte
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter products for current category
  const categoryProducts = products.filter(product => product.categoryId === currentCategory.id);

  // Generate structured data for category page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": currentCategory.name,
    "description": currentCategory.description,
    "hasMenuItem": categoryProducts.map(product => ({
      "@type": "MenuItem",
      "name": product.name,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "EUR"
      }
    }))
  };

  return (
    <div className="min-h-screen bg-surface">
      <CanonicalTag path={`/frontend/speisekarte/${categorySlug}`} />
      <StructuredData type="menu" data={structuredData} settings={{}} />
      <Header />

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/frontend/speisekarte" className="hover:text-brand-600 transition-colors">
            Speisekarte
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentCategory.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getCategoryEmoji(currentCategory)} {currentCategory.name}
              </h1>
              {currentCategory.description && (
                <p className="text-gray-600 text-lg">{currentCategory.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-4 py-2 rounded-full font-medium" style={{backgroundColor: 'var(--color-background)', color: 'var(--color-primary)'}}>
                {categoryProducts.length} Produkte
              </span>
              <Link
                href="/frontend/speisekarte"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Alle Kategorien
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium"
            style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Andere Kategorien
          </button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Other Categories */}
          <div className={`w-80 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            <div className={`bg-white rounded-xl shadow-lg p-6 ${sidebarOpen ? 'fixed top-4 left-4 right-4 z-50 max-h-[90vh] overflow-y-auto' : 'sticky top-8'} md:static md:max-h-none md:overflow-visible`}>
              {/* Mobile Close Button */}
              {sidebarOpen && (
                <div className="flex justify-between items-center mb-4 md:hidden">
                  <h3 className="text-lg font-semibold text-gray-900">Andere Kategorien</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Categories Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h3>
                <div className="space-y-2">
                  <Link
                    href="/frontend/speisekarte"
                    className="block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        Alle Kategorien
                      </span>
                      <span className="text-sm opacity-75">
                        {products.length}
                      </span>
                    </div>
                  </Link>
                  {categories.map((category) => {
                    const categoryProductCount = products.filter(p => p.categoryId === category.id).length;
                    const isActive = category.id === currentCategory.id;
                    return (
                      <Link
                        key={category.id}
                        href={`/frontend/speisekarte/${category.slug}`}
                        className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                          isActive
                            ? 'shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                        style={isActive ? {backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'} : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            {getCategoryEmoji(category)} {category.name}
                          </span>
                          <span className="text-sm opacity-75">
                            {categoryProductCount}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Products Grid */}
            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{...product, isAvailable: true}}
                    onAddToCart={() => {
                      // Optional: Feedback für erfolgreiche Hinzufügung
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                  Keine Produkte in dieser Kategorie
                </h3>
                <p className="text-gray-600 mb-6">
                  In der Kategorie "{currentCategory.name}" sind derzeit keine Produkte verfügbar.
                </p>
                <Link
                  href="/frontend/speisekarte"
                  className="inline-flex items-center px-6 py-3 font-semibold rounded-xl transition-colors"
                  style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Alle Kategorien anzeigen
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
