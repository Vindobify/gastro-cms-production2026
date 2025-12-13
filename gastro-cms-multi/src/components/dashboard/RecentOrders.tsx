'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApiErrorHandler } from '@/lib/errorHandler';
import { safeToLocaleString } from '@/lib/safeDateUtils';
import { ShoppingCartIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
  status: string;
  totalAmount: number;
  deliveryType: string;
  deliveryTime: string | null;
  createdAt: string;
  orderItems: Array<{
    id: number;
    quantity: number;
    product: {
      name: string;
    };
  }>;
  restaurantAddress?: {
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Ausstehend' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Bestätigt' },
  PREPARING: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, label: 'Wird zubereitet' },
  READY: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Bereit' },
  OUT_FOR_DELIVERY: { color: 'bg-purple-100 text-purple-800', icon: ClockIcon, label: 'Unterwegs' },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Geliefert' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: ClockIcon, label: 'Storniert' }
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchRecentOrders() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/orders?limit=5', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (isMounted) {
          setOrders(data);
          setHasLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
          if (!hasLoaded) {
            setOrders([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRecentOrders();

    // SSE für Echtzeit-Updates
    const eventSource = new EventSource('/api/orders/live?orderId=all');
    
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        console.log('📡 Dashboard SSE Update:', update);
        
        if (update.type === 'new_order' || update.type === 'status_update') {
          // Aktualisiere die Bestellliste
          fetchRecentOrders();
        }
      } catch (error) {
        console.error('Fehler beim Verarbeiten des SSE-Updates:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Verbindungsfehler:', error);
    };

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [hasLoaded]);

  if (loading && !hasLoaded) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Neueste Bestellungen</h3>
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

  if (error && !hasLoaded) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Neueste Bestellungen</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Fehler beim Laden der Bestellungen
                </h4>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Neueste Bestellungen</h3>
          <Link
            href="/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Alle anzeigen
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Bestellungen</h3>
            <p className="mt-1 text-sm text-gray-500">Es wurden noch keine Bestellungen aufgegeben.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              
              return (
                <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        €{(Number(order.totalAmount) || 0).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Zusätzliche Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <p><span className="font-medium">Bestellart:</span> {order.deliveryType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}</p>
                      <p><span className="font-medium">E-Mail:</span> {order.customer.email}</p>
                      <p><span className="font-medium">Telefon:</span> {order.customer.phone}</p>
                    </div>
                    <div>
                      {order.deliveryType === 'DELIVERY' && order.customer.address && (
                        <p><span className="font-medium">Adresse:</span> {order.customer.address}, {order.customer.postalCode} {order.customer.city}</p>
                      )}
                      {order.deliveryTime && (
                        <p><span className="font-medium">Lieferzeit:</span> {safeToLocaleString(order.deliveryTime, 'de-DE')}</p>
                      )}
                      <p><span className="font-medium">Artikel:</span> {order.orderItems.length} Produkt(e)</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
