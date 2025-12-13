'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, TruckIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamischer Import von Leaflet-Komponenten
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  deliveryTime: string;
  createdAt: string;
  orderItems: Array<{
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
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
  workingHours: WorkingHours[];
  currentLocation: { latitude: number; longitude: number } | null;
  lastLocationUpdate: string;
  assignedOrders: Order[];
}

interface DeliveryDriverDetailViewProps {
  id: number;
}

export default function DeliveryDriverDetailView({ id }: DeliveryDriverDetailViewProps) {
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      const response = await fetch(`/api/delivery-drivers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDriver(data);
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isAvailable: boolean, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (isAvailable) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isAvailable: boolean, isActive: boolean) => {
    if (!isActive) return 'Inaktiv';
    if (isAvailable) return 'Verfügbar';
    return 'Nicht verfügbar';
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

  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Lieferant nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil-Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {driver.avatar ? (
              <img 
                className="h-24 w-24 rounded-full object-cover" 
                src={driver.avatar} 
                alt={`${driver.firstName} ${driver.lastName}`}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-600 font-bold text-3xl">
                  {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {driver.firstName} {driver.lastName}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(driver.isAvailable, driver.isActive)}`}>
                {getStatusText(driver.isAvailable, driver.isActive)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                driver.gpsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                GPS {driver.gpsEnabled ? 'Aktiviert' : 'Deaktiviert'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kontaktinformationen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kontaktinformationen</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{driver.email}</span>
            </div>
            {driver.phone && (
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{driver.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Arbeitszeiten */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Arbeitszeiten</h2>
          </div>
          {driver.workingHours && driver.workingHours.length > 0 ? (
            <div className="space-y-2">
              {driver.workingHours.map((day) => (
                <div key={day.dayOfWeek} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-700 font-medium">{days[day.dayOfWeek]}</span>
                  <span className="text-brand-600 font-semibold">
                    {day.startTime} - {day.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keine Arbeitszeiten gesetzt</p>
          )}
        </div>
      </div>

      {/* GPS-Standort */}
      {driver.currentLocation && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Aktueller Standort</h2>
          </div>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={[driver.currentLocation.latitude, driver.currentLocation.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[driver.currentLocation.latitude, driver.currentLocation.longitude]}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2">
                      {driver.firstName} {driver.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Letzte Aktualisierung: {new Date(driver.lastLocationUpdate).toLocaleString('de-DE')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Koordinaten:</strong> {driver.currentLocation.latitude.toFixed(6)}, {driver.currentLocation.longitude.toFixed(6)}
            <br />
            <strong>Letzte Aktualisierung:</strong> {new Date(driver.lastLocationUpdate).toLocaleString('de-DE')}
          </div>
        </div>
      )}

      {/* Zugewiesene Bestellungen */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Zugewiesene Bestellungen</h2>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
            {driver.assignedOrders.length}
          </span>
        </div>
        
        {driver.assignedOrders.length > 0 ? (
          <div className="space-y-4">
            {driver.assignedOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-600">
                      €{order.totalAmount.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Kunde</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {order.customerName}</p>
                      <p><strong>Adresse:</strong> {order.customerAddress}</p>
                      <p><strong>Ort:</strong> {order.customerPostalCode} {order.customerCity}</p>
                      {order.customerPhone && (
                        <p><strong>Telefon:</strong> {order.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bestellte Artikel</h4>
                    <div className="space-y-1">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-gray-900 font-medium">
                            €{item.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {order.deliveryTime && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Gewünschte Lieferzeit:</strong> {(() => {
                        try {
                          const date = new Date(order.deliveryTime);
                          return isNaN(date.getTime()) ? 'Ungültiges Datum' : date.toLocaleString('de-DE');
                        } catch (error) {
                          console.warn('Invalid delivery time:', order.deliveryTime, error);
                          return 'Ungültiges Datum';
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📦</div>
            <p className="text-gray-500">Keine zugewiesenen Bestellungen</p>
          </div>
        )}
      </div>
    </div>
  );
}
