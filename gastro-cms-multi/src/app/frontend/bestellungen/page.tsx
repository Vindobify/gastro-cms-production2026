'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: string;
}

export default function BestellungenPage() {
  const [orders] = useState<Order[]>([
    {
      id: '1234',
      date: '15. Dezember 2024, 19:30 Uhr',
      items: ['Pizza Margherita', 'Cola', 'Pommes'],
      total: 18.90,
      status: 'delivered',
      deliveryAddress: 'Musterstraße 123, 12345 Musterstadt'
    },
    {
      id: '1233',
      date: '12. Dezember 2024, 18:15 Uhr',
      items: ['Burger', 'Pommes', 'Bier'],
      total: 24.50,
      status: 'delivering',
      deliveryAddress: 'Musterstraße 123, 12345 Musterstadt'
    },
    {
      id: '1232',
      date: '10. Dezember 2024, 20:00 Uhr',
      items: ['Sushi Set', 'Grüner Tee'],
      total: 32.80,
      status: 'delivered',
      deliveryAddress: 'Musterstraße 123, 12345 Musterstadt'
    },
    {
      id: '1231',
      date: '8. Dezember 2024, 19:45 Uhr',
      items: ['Pasta Carbonara', 'Wein', 'Tiramisu'],
      total: 28.60,
      status: 'delivered',
      deliveryAddress: 'Musterstraße 123, 12345 Musterstadt'
    },
    {
      id: '1230',
      date: '5. Dezember 2024, 18:30 Uhr',
      items: ['Salat', 'Suppe', 'Brot'],
      total: 15.40,
      status: 'cancelled',
      deliveryAddress: 'Musterstraße 123, 12345 Musterstadt'
    }
  ]);

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { text: 'Bestätigung ausstehend', color: 'text-yellow-600', icon: ClockIcon };
      case 'confirmed':
        return { text: 'Bestätigt', color: 'text-blue-600', icon: CheckCircleIcon };
      case 'preparing':
        return { text: 'Wird zubereitet', color: 'text-blue-600', icon: ClockIcon };
      case 'delivering':
        return { text: 'Unterwegs', color: 'text-blue-600', icon: TruckIcon };
      case 'delivered':
        return { text: 'Geliefert', color: 'text-green-600', icon: CheckCircleIcon };
      case 'cancelled':
        return { text: 'Storniert', color: 'text-red-600', icon: XCircleIcon };
      default:
        return { text: 'Unbekannt', color: 'text-gray-600', icon: ClockIcon };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
              Keine Bestellungen vorhanden
            </h2>
            <p className="text-gray-600 mb-6">
              Sie haben noch keine Bestellungen getätigt.
            </p>
            <Link
              href="/frontend/speisekarte"
              className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Jetzt bestellen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/frontend/kundencenter"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zurück zum Kundencenter
          </Link>
          <h1 className="text-3xl font-display font-semibold text-gray-900">
            Meine Bestellungen
          </h1>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                      Bestellung #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{order.date}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {order.deliveryAddress}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-display font-semibold text-gray-900 mb-2">
                      €{order.total.toFixed(2)}
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color.replace('text-', 'bg-')} bg-opacity-10`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.text}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Bestellte Artikel:</h4>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Bestellnummer: {order.id}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Details
                    </button>
                    
                    {order.status === 'delivered' && (
                      <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                        <span className="mr-1">⭐</span>
                        Bewerten
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Status-Übersicht
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Bestätigung ausstehend</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Bestätigt / Wird zubereitet</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Unterwegs</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Geliefert</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Storniert</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
