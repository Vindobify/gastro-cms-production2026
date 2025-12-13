'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiErrorHandler } from '@/lib/errorHandler';
import WorkingHoursForm from './WorkingHoursForm';
import dynamic from 'next/dynamic';
import DeliveryDriverLayout from './DeliveryDriverLayout';
import { 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  TruckIcon,
  UserIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Dynamischer Import von Leaflet-Komponenten
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

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
  tipAmount?: number;
  tipType?: string;
  tipPercentage?: number;
  tipPaid?: boolean;
}

interface DeliveryDriver {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  isAvailable: boolean;
  gpsEnabled: boolean;
  workingHours: any;
  currentLocation: { latitude: number; longitude: number } | null;
  assignedOrders: Order[];
}

export default function DeliveryDriverDashboard() {
  const { user } = useAuth();
  const apiHandler = useApiErrorHandler();
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [tipStats, setTipStats] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Sicherstellen, dass fetchWithErrorHandling verfügbar ist
  const fetchWithErrorHandling = apiHandler?.fetchWithErrorHandling || (async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  });

  // Lade Lieferanten-Profil
  useEffect(() => {
    fetchDriverProfile();
    fetchTipStats();
    
    // Polling für Live-Updates (da EventSource keine Cookies unterstützt)
    const pollInterval = setInterval(() => {
      fetchDriverProfile();
    }, 5000); // Alle 5 Sekunden aktualisieren

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // GPS-Standort verfolgen
  useEffect(() => {
    if (driver?.currentLocation) {
      startLocationTracking();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [driver]);

  const fetchDriverProfile = async () => {
    try {
      const data = await fetchWithErrorHandling('/api/delivery-drivers/me');
      setDriver(data);
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      if (error instanceof Error && error.message.includes('404')) {
        // Kein Lieferanten-Account gefunden
        setDriver(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTipStats = async () => {
    try {
      const data = await fetchWithErrorHandling('/api/delivery-drivers/tips');
      setTipStats(data);
    } catch (error) {
      console.error('Error fetching tip stats:', error);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    // Prüfe Berechtigung
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          startLocationUpdates();
        }
      });
    } else {
      // Fallback für ältere Browser
      startLocationUpdates();
    }
  };

  const startLocationUpdates = () => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS Position erhalten:', { latitude, longitude });
        
        if (driver) {
          updateDriverLocation(latitude, longitude);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationPermission('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    // Cleanup
    return () => navigator.geolocation.clearWatch(watchId);
  };

  const updateDriverLocation = async (latitude: number, longitude: number) => {
    if (!driver) return;

    try {
      await fetchWithErrorHandling(`/api/delivery-drivers/${driver.id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude
        }),
      });
      console.log('Standort erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating location:', error);
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
      <DeliveryDriverLayout title="Lieferanten-Dashboard" subtitle="Lade Dashboard...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Lieferanten-Dashboard...</p>
          </div>
        </div>
      </DeliveryDriverLayout>
    );
  }

  if (!driver) {
    return (
      <DeliveryDriverLayout title="Fehler" subtitle="Kein Lieferanten-Account gefunden">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kein Lieferanten-Account gefunden</h2>
          <p className="text-gray-600 mb-4">
            Für diesen Benutzer wurde kein Lieferanten-Profil gefunden. 
            {user?.role === 'ADMIN' && ' Als Admin können Sie das normale Dashboard verwenden.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/delivery-driver-dashboard/login'}
              className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
            >
              Zum Lieferanten-Login
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Zum Admin-Dashboard
              </button>
            )}
          </div>
        </div>
      </DeliveryDriverLayout>
    );
  }

  return (
    <DeliveryDriverLayout 
      title={`Willkommen zurück, ${driver.firstName}!`}
      subtitle="Deine Lieferungen und Statistiken im Überblick"
    >
      <div className="space-y-6">
        {/* Hero Status Card */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-5 h-5 rounded-full ${driver?.isAvailable ? 'bg-green-400' : 'bg-red-400'} shadow-lg animate-pulse`}></div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {driver?.isAvailable ? 'Verfügbar für Aufträge' : 'Nicht verfügbar'}
                  </h2>
                  <p className="text-blue-100 text-lg">
                    {driver?.assignedOrders?.length || 0} aktive Aufträge
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{driver?.assignedOrders?.length || 0}</div>
                <div className="text-blue-100 text-sm font-medium">Aufträge</div>
              </div>
            </div>
            
            {driver?.currentLocation && (
              <div className="flex items-center space-x-3 text-blue-100 bg-white/10 rounded-2xl px-4 py-3">
                <MapPinIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  GPS aktiv: {driver?.currentLocation?.latitude?.toFixed(4)}, {driver?.currentLocation?.longitude?.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trinkgeld Heute */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  €{tipStats?.today?.amount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-green-100 text-sm font-medium">Heute</div>
              </div>
            </div>
            <div className="text-green-100 text-sm">
              {tipStats?.today?.count || 0} Trinkgelder
            </div>
          </div>

          {/* Woche */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  €{tipStats?.week?.amount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-blue-100 text-sm font-medium">Diese Woche</div>
              </div>
            </div>
            <div className="text-blue-100 text-sm">
              {tipStats?.week?.count || 0} Trinkgelder
            </div>
          </div>

          {/* Monat */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  €{tipStats?.month?.amount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-purple-100 text-sm font-medium">Dieser Monat</div>
              </div>
            </div>
            <div className="text-purple-100 text-sm">
              {tipStats?.month?.count || 0} Trinkgelder
            </div>
          </div>

          {/* Gesamt */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-xl text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  €{tipStats?.total?.amount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-gray-100 text-sm font-medium">Gesamt</div>
              </div>
            </div>
            <div className="text-gray-100 text-sm">
              {tipStats?.total?.count || 0} Trinkgelder
            </div>
          </div>
        </div>

        {/* Arbeitszeiten */}
        <WorkingHoursForm />

        {/* Bestellungen */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-blue-600" />
              Meine Aufträge
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {driver?.assignedOrders?.length || 0} aktive Bestellungen
            </p>
          </div>
          
          {(driver?.assignedOrders?.length || 0) === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aufträge</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Du hast derzeit keine zugewiesenen Bestellungen. Neue Aufträge erscheinen hier automatisch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(driver?.assignedOrders || []).map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-4">
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
                            {order.tipAmount && parseFloat(order.tipAmount.toString()) > 0 && (
                              <p className="text-sm text-green-600 font-medium">
                                +€{parseFloat(order.tipAmount.toString()).toFixed(2)} 💰
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Adresse */}
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">
                            {order.customerAddress}, {order.customerPostalCode} {order.customerCity}
                          </span>
                        </div>
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


        {/* GPS-Status */}
        {driver?.currentLocation && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-green-600" />
                Aktueller Standort
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                GPS-Tracking aktiv
              </p>
            </div>
            
            <div className="px-4 py-4 sm:px-6">
              <div className="h-64 bg-gray-100 rounded-xl overflow-hidden">
                <MapContainer
                  center={[driver?.currentLocation?.latitude || 0, driver?.currentLocation?.longitude || 0]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[driver?.currentLocation?.latitude || 0, driver?.currentLocation?.longitude || 0]} />
                </MapContainer>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    locationPermission === 'granted' ? 'bg-green-400' : 
                    locationPermission === 'denied' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-gray-600">GPS-Berechtigung:</span>
                  <span className={`font-medium ${
                    locationPermission === 'granted' ? 'text-green-600' : 
                    locationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {locationPermission === 'granted' ? 'Erlaubt' : 
                     locationPermission === 'denied' ? 'Verweigert' : 'Angefragt'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeliveryDriverLayout>
  );
}