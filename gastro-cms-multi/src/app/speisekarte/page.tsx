'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import CanonicalTag from '@/components/seo/CanonicalTag';
import StructuredData from '@/components/seo/StructuredData';
import SEOHead from '@/components/seo/SEOHead';
import { useCart } from '@/contexts/CartContext';
import { 
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ProductCard from '@/components/frontend/ProductCard';

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

// Helper function to get icon for category - uses database icon or fallback emoji
const getCategoryIcon = (category: Category): string => {
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
  
  // Return empty string if no icon is assigned - no fallback
  return '';
};

// Force dynamic rendering - removed invalid revalidate export
export const dynamic = 'force-dynamic';

export default function SpeisekartePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [extras, setExtras] = useState<ExtraGroup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { applyCoupon } = useCart();
  const searchParams = useSearchParams();

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
    const urlParams = new URLSearchParams(window.location.search);
    const couponCode = urlParams.get('coupon');
    
    if (couponCode) {
      // Check if we're on a category page with coupon
      const pathSegments = window.location.pathname.split('/');
      const categorySlug = pathSegments[pathSegments.length - 1];
      
      if (categorySlug && categorySlug !== 'speisekarte') {
        // We're on a category page, redirect to category with coupon
        window.location.href = `/speisekarte/${categorySlug}?coupon=${couponCode}`;
        return;
      }
      
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
            
            // Check if coupon is category-specific and redirect
            if (couponData.categoryId) {
              const categoryResponse = await fetch(`/api/categories/${couponData.categoryId}`);
              if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                window.location.href = `/speisekarte/${categoryData.slug}?coupon=${couponCode}`;
                return;
              }
            }
            
            // Apply coupon for general use
            applyCoupon(couponData);
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
  }, [applyCoupon]);

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
          // Don't set a default category - let user choose "Alle Kategorien" or specific category
        }

        if (extrasRes.ok) {
          const extrasData = await extrasRes.json();
          setExtras(extrasData);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle category selection from URL
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.id);
      }
    } else if (!categorySlug) {
      setSelectedCategory(null);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const couponCode = searchParams.get('coupon');
    if (couponCode && !couponApplied) {
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
            applyCoupon(couponData);
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Gutschein "${couponCode}" erfolgreich angewendet!
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
            
            setCouponApplied(true);
          } else {
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              Gutschein "${couponCode}" ist ungültig oder abgelaufen
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
          }
        } catch (error) {
          console.error('Error validating coupon:', error);
        }
      };

      validateAndApplyCoupon();
    }
  }, [searchParams, applyCoupon, couponApplied]);

  // Reset to first page when category changes (but not when selectedCategory is null)
  useEffect(() => {
    if (selectedCategory !== null) {
      setCurrentPage(1);
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p style={{color: 'var(--color-text-secondary)'}}>Lade Speisekarte...</p>
        </div>
      </div>
    );
  }

  // Filter products based on category only
  const filteredProducts = selectedCategory
    ? products.filter(product => product.categoryId === selectedCategory)
    : products;

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);


  // Funktion zum automatischen Scrollen zur ausgewählten Kategorie
  const scrollToCategory = (index: number) => {
    const container = document.getElementById('category-carousel');
    if (container) {
      const buttons = container.querySelectorAll('button');
      if (buttons[index]) {
        const button = buttons[index] as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        // Berechne die Scroll-Position, um den Button zu zentrieren
        const scrollLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  // Generate structured data for menu page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Speisekarte",
    "hasMenuSection": categories.map(category => ({
      "@type": "MenuSection",
      "name": category.name,
      "hasMenuItem": products
        .filter(product => product.categoryId === category.id)
        .map(product => ({
          "@type": "MenuItem",
          "name": product.name,
          "description": product.description,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "EUR"
          }
        }))
    }))
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* SEO Head für Speisekarte */}
      <SEOHead
        title="Speisekarte - Restaurant"
        description="Entdecken Sie unsere köstliche Speisekarte mit frischen Zutaten und traditionellen Rezepten"
        canonical="/speisekarte"
        ogType="website"
      />
      
      <CanonicalTag path="/speisekarte" />
      <StructuredData type="menu" data={structuredData} settings={{}} />
      <Header />

      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium"
            style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filter & Kategorien
          </button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Categories & Filters */}
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
                  <h3 className="text-lg font-semibold" style={{color: 'var(--color-text)'}}>Filter & Kategorien</h3>
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
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--color-text)'}}>Kategorien</h3>
                <div className="space-y-2">
                  <Link
                    href="/speisekarte"
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      selectedCategory === null
                        ? 'shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    style={selectedCategory === null ? {backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'} : {}}
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
                    return (
                      <Link
                        key={category.id}
                        href={`/speisekarte/${category.slug}`}
                        className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                        style={selectedCategory === category.id ? {backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'} : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {getCategoryIcon(category) && (
                              <span className="text-lg">{getCategoryIcon(category)}</span>
                            )}
                            {category.name}
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

              {/* Filter Reset */}
              <Link
                href="/speisekarte"
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Alle Kategorien anzeigen
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold" style={{color: 'var(--color-text)'}}>
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name || 'Kategorie'
                    : 'Alle Produkte'
                  }
                </h2>
                <span className="px-4 py-2 rounded-full font-medium" style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}>
                  {filteredProducts.length} Produkte gefunden
                </span>
              </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{...product, isAvailable: true, taxRate: (product as any).taxRate || 0.20}}
                    onAddToCart={() => {
                      // Optional: Feedback für erfolgreiche Hinzufügung
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-display font-semibold mb-2" style={{color: 'var(--color-text)'}}>
                  Keine Produkte gefunden
                </h3>
                <p className="mb-6" style={{color: 'var(--color-text-secondary)'}}>
                  Versuchen Sie andere Filter oder setzen Sie die Suche zurück.
                </p>
                <Link
                  href="/speisekarte"
                  className="px-6 py-3 font-semibold rounded-xl transition-colors"
                  style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
                >
                  Alle Kategorien anzeigen
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Vorherige Seite"
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? ''
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                      style={currentPage === page ? {backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'} : {}}
                      aria-label={`Seite ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Nächste Seite"
                  >
                    →
                  </button>
                </nav>
              </div>
            )}

            {/* Pagination Info */}
            {filteredProducts.length > 0 && (
              <div className="mt-4 text-center text-sm" style={{color: 'var(--color-text-secondary)'}}>
                Zeige {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} von {filteredProducts.length} Produkten
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
