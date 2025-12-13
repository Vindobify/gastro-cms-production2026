'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiErrorHandler } from '@/lib/errorHandler';
import DeliveryDriverLayout from '@/components/delivery-drivers/DeliveryDriverLayout';
import { 
  ClipboardDocumentListIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerPostalCode: string;
  customerPhone: string;
  totalAmount: number;
  deliveryTime: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function DeliveryDriverOrdersPage() {
  const { user } = useAuth();
  const { fetchWithErrorHandling } = useApiErrorHandler();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Polling für Live-Updates (da EventSource keine Cookies unterstützt)
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Alle 5 Sekunden aktualisieren
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await fetchWithErrorHandling('/api/delivery-drivers/me');
      setOrders(data.assignedOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fehler wird bereits vom ErrorHandler behandelt (z.B. automatisches Logout bei 401)
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-orange-100 text-orange-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Bestätigt';
      case 'PREPARING': return 'Wird zubereitet';
      case 'READY': return 'Bereit';
      case 'OUT_FOR_DELIVERY': return 'Unterwegs';
      case 'DELIVERED': return 'Geliefert';
      case 'CANCELLED': return 'Storniert';
      default: return status;
    }
  };

  const openNavigation = (address: string, city: string, postalCode: string) => {
    // Erstelle eine vollständige Adresse für Google Maps
    const fullAddress = `${address}, ${postalCode} ${city}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(url, '_blank');
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetchWithErrorHandling(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Aktualisiere den lokalen State
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      console.log(`Bestellung ${orderId} Status auf ${newStatus} aktualisiert`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Fehler beim Aktualisieren des Status: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  if (loading) {
    return (
      <DeliveryDriverLayout title="Meine Bestellungen" subtitle="Lade Bestellungen...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Bestellungen...</p>
          </div>
        </div>
      </DeliveryDriverLayout>
    );
  }

  return (
    <DeliveryDriverLayout 
      title="Meine Bestellungen" 
      subtitle="Verwalte deine zugewiesenen Bestellungen"
    >
      <div className="space-y-4 lg:space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Lade Bestellungen...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Bestellungen</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Du hast derzeit keine zugewiesenen Bestellungen. Neue Aufträge erscheinen hier automatisch.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`h-4 w-4 rounded-full ${
                          order.status === 'PENDING' ? 'bg-yellow-400' :
                          order.status === 'CONFIRMED' ? 'bg-blue-400' :
                          order.status === 'PREPARING' ? 'bg-orange-400' :
                          order.status === 'READY_FOR_DELIVERY' ? 'bg-purple-400' :
                          order.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-400' :
                          order.status === 'DELIVERED' ? 'bg-green-400' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-semibold text-gray-900">
                              Bestellung #{order.orderNumber}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'READY_FOR_DELIVERY' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getOrderStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Kundeninfo */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {order.customerName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">€{order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* Adresse */}
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">
                          {order.customerAddress}, {order.customerPostalCode} {order.customerCity}
                        </span>
                      </div>
                      
                      {/* Lieferzeit */}
                      {order.deliveryTime && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span>Lieferzeit: {new Date(order.deliveryTime).toLocaleString('de-DE')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bestellpositionen */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Bestellpositionen:</h4>
                    <div className="space-y-1">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                          <span className="font-medium text-gray-900">€{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openNavigation(order.customerAddress, order.customerCity, order.customerPostalCode)}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      🗺️ Navigation
                    </button>
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        ✅ Geliefert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryDriverLayout>
  );
}
