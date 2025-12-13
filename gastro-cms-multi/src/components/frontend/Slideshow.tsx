'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Add custom CSS for scrollbar hiding
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

interface Slideshow {
  id: number;
  title: string;
  description?: string;
  backgroundImage: string;
  headline: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  slideshowItems: SlideshowItem[];
}

interface SlideshowItem {
  id: number;
  itemType: 'PRODUCT' | 'COUPON';
  itemId: number;
  title?: string;
  description?: string;
  image?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  categoryId?: number;
}

interface Coupon {
  id: number;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumOrderValue?: number;
  code: string;
}

export default function Slideshow() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Add scrollbar-hide styles to document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = scrollbarHideStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      // Cleanup on unmount
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (slideshows.length > 1) {
      const interval = setInterval(() => {
        if (!isTransitioning) {
          goToNext();
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [slideshows.length, isTransitioning]);

  const fetchData = async () => {
    try {
      const [slideshowsRes, productsRes, couponsRes] = await Promise.all([
        fetch('/api/slideshow?active=true'),
        fetch('/api/products'),
        fetch('/api/coupons?active=true')
      ]);

      if (slideshowsRes.ok) {
        const slideshowsData = await slideshowsRes.json();
        setSlideshows(slideshowsData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }
    } catch (error) {
      console.error('Error fetching slideshow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning || slideshows.length === 0) return;
    const newIndex = (currentSlide - 1 + slideshows.length) % slideshows.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    if (isTransitioning || slideshows.length === 0) return;
    const newIndex = (currentSlide + 1) % slideshows.length;
    goToSlide(newIndex);
  };

  const getItemData = (item: SlideshowItem) => {
    if (item.itemType === 'PRODUCT') {
      return products.find(p => p.id === item.itemId);
    } else {
      return coupons.find(c => c.id === item.itemId);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (slideshows.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4">
        <div className="text-center max-w-sm sm:max-w-none">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-brand-900 mb-3 sm:mb-4">
            Willkommen bei Gastro
          </h1>
          <p className="text-base sm:text-xl text-brand-700 mb-6 sm:mb-8">
            Entdecken Sie unsere köstlichen Speisen und exklusiven Angebote
          </p>
          <Link
            href="/speisekarte"
            className="inline-block bg-brand-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Speisekarte ansehen
          </Link>
        </div>
      </div>
    );
  }

  const currentSlideshow = slideshows[currentSlide];

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Images with smooth transitions */}
      {slideshows.map((slideshow, index) => (
        <div
          key={slideshow.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slideshow.backgroundImage}
            alt={slideshow.title}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay - stronger on mobile */}
          <div className="absolute inset-0 bg-black bg-opacity-60 sm:bg-opacity-50"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Mobile Layout - Stacked */}
          <div className="block lg:hidden">
            {/* Mobile Header */}
            <div className="text-white text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight transform transition-all duration-500 ease-in-out">
                {currentSlideshow.headline}
              </h1>
              {currentSlideshow.subheadline && (
                <p className="text-lg sm:text-xl text-gray-200 mb-6 px-4 transform transition-all duration-500 ease-in-out leading-relaxed">
                  {currentSlideshow.subheadline}
              </p>
              )}
            </div>

            {/* Mobile Items - Stacked Layout */}
            {currentSlideshow.slideshowItems.length > 0 && (
              <div className="mb-8 space-y-4 transform transition-all duration-500 ease-in-out">
                {currentSlideshow.slideshowItems.map((item, index) => {
                  const itemData = getItemData(item);
                  if (!itemData) return null;

                  return (
                    <div key={item.id} className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 mx-4">
                      {/* Mobile Product Layout */}
                      {item.itemType === 'PRODUCT' && itemData && 'price' in itemData && (
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title || itemData.name}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {item.title || itemData.name}
                            </h3>
                            <div className="text-2xl font-bold text-white mb-3">
                              €{itemData.price.toFixed(2).replace('.', ',')}
                            </div>
                            <Link
                              href={itemData.categoryId ? `/frontend/speisekarte?category=${itemData.categoryId}` : '/frontend/speisekarte'}
                              className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                            >
                              Jetzt bestellen
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Mobile Coupon Layout */}
                      {item.itemType === 'COUPON' && itemData && 'discountType' in itemData && (
                        <div className="flex items-center space-x-4">
                          {/* Mobile PERCENTAGE Coupon */}
                          {itemData.discountType === 'PERCENTAGE' && (
                            <>
                              <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-white">
                                      {itemData.discountValue}%
                                    </div>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  {itemData.name}
                                </h3>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200 mb-3">
                                    Mindestbestellwert: €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                                <div className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                  Code: {itemData.code}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Mobile FIXED_AMOUNT Coupon */}
                          {itemData.discountType === 'FIXED_AMOUNT' && (
                            <>
                              <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center relative transform rotate-3">
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-white">
                                      €{itemData.discountValue}
                                    </div>
                                  </div>
                                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-sm font-bold">€</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  {itemData.name}
                                </h3>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200 mb-3">
                                    Mindestbestellwert: €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                                <div className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                  Code: {itemData.code}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Mobile FREE_DELIVERY Coupon */}
                          {itemData.discountType === 'FREE_DELIVERY' && (
                            <>
                              <div className="flex-shrink-0">
                                <div className="w-24 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative">
                                  <div className="text-center">
                                    <div className="text-white mb-1">
                                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7zM9 3h6v2H9V3zm10 15H5V7h14v11z"/>
                                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 6l-2-2 1.41-1.41L12 12.17l2.59-2.58L16 11l-5 5z"/>
                                      </svg>
                                    </div>
                                    <div className="text-xs text-white/90 font-bold">
                                      GRATIS
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  Gratis Lieferung
                                </h3>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200 mb-3">
                                    Mindestbestellwert: €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                                <div className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                  Code: {itemData.code}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile CTA Button */}
            {currentSlideshow.buttonText && currentSlideshow.buttonLink && (
              <div className="text-center transform transition-all duration-500 ease-in-out px-4">
                <Link
                  href={currentSlideshow.buttonLink}
                  className="inline-block bg-white text-brand-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {currentSlideshow.buttonText}
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {currentSlideshow.headline}
              </h1>
              {currentSlideshow.subheadline && (
                <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                  {currentSlideshow.subheadline}
                </p>
              )}
              {currentSlideshow.buttonText && currentSlideshow.buttonLink && (
                <Link
                  href={currentSlideshow.buttonLink}
                  className="inline-block bg-white text-brand-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {currentSlideshow.buttonText}
                </Link>
              )}
            </div>

            {/* Right Column - Slideshow Items */}
            {currentSlideshow.slideshowItems.length > 0 && (
              <div className="space-y-6">
                {currentSlideshow.slideshowItems.map((item, index) => {
                  const itemData = getItemData(item);
                  if (!itemData) return null;

                  return (
                    <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      {item.image && (
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={item.image}
                            alt={item.title || itemData.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              {item.title || itemData.name}
                            </h3>
                            {item.description && (
                              <p className="text-gray-200 text-sm">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!item.image && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {item.title || itemData.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-200 text-sm mb-3">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Item-specific content */}
                      {item.itemType === 'PRODUCT' && itemData && 'price' in itemData && (
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">
                            €{itemData.price.toFixed(2).replace('.', ',')}
                          </span>
                          <Link
                            href={itemData.categoryId ? `/frontend/speisekarte?category=${itemData.categoryId}` : '/frontend/speisekarte'}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                          >
                            Jetzt bestellen
                          </Link>
                        </div>
                      )}

                      {item.itemType === 'COUPON' && itemData && 'discountType' in itemData && (
                        <div className="flex items-center justify-between">
                          {/* PERCENTAGE Coupon Design */}
                          {itemData.discountType === 'PERCENTAGE' && (
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                      {itemData.discountValue}%
                                    </div>
                                    <div className="text-xs text-white/90 font-medium">
                                      RABATT
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">%</span>
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-lg font-semibold text-white mb-1">
                                  {itemData.name}
                                </div>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200">
                                    ab €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* FIXED_AMOUNT Coupon Design */}
                          {itemData.discountType === 'FIXED_AMOUNT' && (
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3">
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-white">
                                      €{itemData.discountValue}
                                    </div>
                                    <div className="text-xs text-white/90 font-medium">
                                      SPAREN
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-green-600 text-sm font-bold">€</span>
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-lg font-semibold text-white mb-1">
                                  {itemData.name}
                                </div>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200">
                                    ab €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* FREE_DELIVERY Coupon Design */}
                          {itemData.discountType === 'FREE_DELIVERY' && (
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-24 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <div className="text-center">
                                    <div className="text-white mb-1">
                                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7zM9 3h6v2H9V3zm10 15H5V7h14v11z"/>
                                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 6l-2-2 1.41-1.41L12 12.17l2.59-2.58L16 11l-5 5z"/>
                                      </svg>
                                    </div>
                                    <div className="text-xs text-white/90 font-bold">
                                      GRATIS
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-lg font-semibold text-white mb-1">
                                  Gratis Lieferung
                                </div>
                                {itemData.minimumOrderValue && (
                                  <div className="text-sm text-gray-200">
                                    ab €{itemData.minimumOrderValue.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/30 transition-all cursor-pointer border border-white/30">
                            <div className="text-center">
                              <div className="font-bold">
                                {itemData.discountType === 'FREE_DELIVERY' 
                                  ? 'Gratis Lieferung' 
                                  : itemData.discountType === 'PERCENTAGE'
                                  ? `${itemData.discountValue}% Rabatt`
                                  : `€${itemData.discountValue} sparen`
                                }
                              </div>
                              <div className="text-xs opacity-90">Code: {itemData.code}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated Thumbnails Navigation */}
      {slideshows.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          {/* Desktop Thumbnails - All visible */}
          <div className="hidden sm:flex space-x-3">
            {slideshows.map((slideshow, index) => (
              <button
                key={slideshow.id}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-20 h-12 ring-2 ring-white shadow-lg' 
                    : 'w-16 h-10 hover:w-18 hover:h-11 opacity-70 hover:opacity-90'
                }`}
              >
                <img
                  src={slideshow.backgroundImage}
                  alt={slideshow.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Thumbnails - Carousel if >3 */}
          <div className="sm:hidden">
            {slideshows.length <= 3 ? (
              // Show all thumbnails if 3 or less
              <div className="flex space-x-2">
                {slideshows.map((slideshow, index) => (
                  <button
                    key={slideshow.id}
                    onClick={() => goToSlide(index)}
                    disabled={isTransitioning}
                    className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-16 h-10 ring-2 ring-white shadow-lg' 
                        : 'w-12 h-8 opacity-70 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={slideshow.backgroundImage}
                      alt={slideshow.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    {index === currentSlide && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              // Carousel for >3 thumbnails
              <div className="relative w-48">
                <div className="overflow-hidden">
                  <div 
                    className="flex space-x-2 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${Math.max(0, Math.min(currentSlide - 1, slideshows.length - 3)) * 56}px)`
                    }}
                  >
                    {slideshows.map((slideshow, index) => (
                      <button
                        key={slideshow.id}
                        onClick={() => goToSlide(index)}
                        disabled={isTransitioning}
                        className={`flex-shrink-0 relative overflow-hidden rounded-lg transition-all duration-300 ${
                          index === currentSlide 
                            ? 'w-16 h-10 ring-2 ring-white shadow-lg' 
                            : 'w-12 h-8 opacity-70'
                        }`}
                      >
                        <img
                          src={slideshow.backgroundImage}
                          alt={slideshow.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                        {index === currentSlide && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Carousel indicators */}
                <div className="flex justify-center mt-2 space-x-1">
                  {Array.from({ length: Math.max(1, slideshows.length - 2) }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                        index === Math.max(0, Math.min(currentSlide - 1, slideshows.length - 3))
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
      {slideshows.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </div>
  );
}
