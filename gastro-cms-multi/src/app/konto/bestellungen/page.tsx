'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeftIcon, ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function BestellungenPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/konto/bestellungen');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Mock orders data since Prisma relations are not working
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'GCM-2024-001',
        status: 'DELIVERED',
        createdAt: new Date('2024-01-15'),
        deliveryTime: new Date('2024-01-15T18:30:00'),
        totalAmount: 24.50,
        orderItems: [
          { id: 1, quantity: 2, product: { name: 'Margherita Pizza' }, price: 12.50 },
          { id: 2, quantity: 1, product: { name: 'Cola 0.5L' }, price: 2.50 }
        ]
      },
      {
        id: 2,
        orderNumber: 'GCM-2024-002',
        status: 'IN_PREPARATION',
        createdAt: new Date('2024-01-20'),
        deliveryTime: new Date('2024-01-20T19:15:00'),
        totalAmount: 18.90,
        orderItems: [
          { id: 3, quantity: 1, product: { name: 'Pasta Carbonara' }, price: 14.90 },
          { id: 4, quantity: 1, product: { name: 'Wasser 0.5L' }, price: 2.00 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'PREPARING':
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'OUT_FOR_DELIVERY':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ausstehend';
      case 'CONFIRMED':
        return 'Bestätigt';
      case 'PREPARING':
        return 'In Zubereitung';
      case 'OUT_FOR_DELIVERY':
        return 'Unterwegs';
      case 'DELIVERED':
        return 'Geliefert';
      case 'CANCELLED':
        return 'Storniert';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/konto"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Zurück zum Konto
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Meine Bestellungen</h1>
          <p className="text-gray-600 mt-1">
            {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'} gefunden
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Bestellungen
            </h3>
            <p className="text-gray-500 mb-6">
              Sie haben noch keine Bestellungen aufgegeben.
            </p>
            <Link
              href="/speisekarte"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Jetzt bestellen
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Bestellung #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          €{Number(order.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.orderItems.length} {order.orderItems.length === 1 ? 'Artikel' : 'Artikel'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.quantity}x {item.product.name}
                            </p>
                            {item.extras && (
                              <p className="text-xs text-gray-500">
                                {item.extras}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900">
                          €{Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Keine Artikel in dieser Bestellung.</p>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Lieferadresse nicht verfügbar</p>
                      {order.deliveryTime && (
                        <p>Lieferzeit: {new Date(order.deliveryTime).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <Link
                          href={`/lieferstatus/${order.orderNumber}`}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Status verfolgen
                        </Link>
                      )}
                      {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                        <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                          Erneut bestellen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
