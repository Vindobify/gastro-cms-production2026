'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CubeIcon, StarIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number | null;
  totalSold: number;
  revenue: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hilfsfunktion für sichere Preisformatierung
  const formatPrice = (price: any): string => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products?top=5');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Error fetching top products:', response.statusText);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Beliebteste Produkte</h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Beliebteste Produkte</h3>
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Alle anzeigen
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-8">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Produkte</h3>
            <p className="mt-1 text-sm text-gray-500">Es wurden noch keine Produkte verkauft.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.totalSold} mal verkauft
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    €{formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    €{formatPrice(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
