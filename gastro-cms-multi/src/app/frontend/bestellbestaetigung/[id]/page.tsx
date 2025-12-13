'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  UserIcon, 
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import DeliveryDriverStatus from '@/components/frontend/DeliveryDriverStatus';
import DeliveryMap from '@/components/frontend/DeliveryMap';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    description: string;
  };
  extraIds: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryType: string;
  deliveryTime: string | null;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
  deliveryDriver?: {
    id: number;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    profile?: {
      phone?: string;
      avatar?: string;
    };
  };
  orderItems: OrderItem[];
  restaurantAddress?: {
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Bestellung aufgenommen', icon: CheckCircleIcon, color: 'text-green-600' },
  { key: 'CONFIRMED', label: 'Bestellung bestätigt', icon: CheckCircleIcon, color: 'text-green-600' },
  { key: 'PREPARING', label: 'Wird zubereitet', icon: ClockIcon, color: 'text-yellow-600' },
  { key: 'READY', label: 'Fertig zur Lieferung', icon: TruckIcon, color: 'text-blue-600' },
  { key: 'OUT_FOR_DELIVERY', label: 'Unterwegs', icon: TruckIcon, color: 'text-purple-600' },
  { key: 'DELIVERED', label: 'Zugestellt', icon: CheckCircleIcon, color: 'text-green-600' }
];

// Hilfsfunktion für Status-Labels
const getStatusLabel = (status: string) => {
  const step = STATUS_STEPS.find((step: any) => step.key === status);
  return step ? step.label : status;
};

export default function BestellbestaetigungPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilDelivery, setTimeUntilDelivery] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Params aus Promise extrahieren
    params.then((resolvedParams) => {
      setOrderId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

      fetchOrder();
      
      console.log(`🔄 Starte Echtzeit-Updates für Order ${orderId}...`);
      
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(() => fetchOrder(), 8000);
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const handleUpdateMessage = (data: any) => {
      switch (data.type) {
        case 'order_updated':
          if (data.order && data.order.id?.toString() === orderId) {
            setOrder(prev => (prev ? { ...prev, ...data.order } : data.order));
            if (data.order.status) {
              setStatusMessage(`Status aktualisiert: ${getStatusLabel(data.order.status)}`);
            } else if (data.order.deliveryTime) {
              setStatusMessage('Lieferzeit wurde aktualisiert');
            } else if (data.order.deliveryDriver) {
              setStatusMessage('Lieferant wurde zugewiesen');
            }
          }
          break;
        case 'status_update':
          if (data.data?.status) {
            setOrder(prev => prev ? { ...prev, status: data.data.status } : null);
            setStatusMessage(`Status aktualisiert: ${getStatusLabel(data.data.status)}`);
          }
          break;
        case 'delivery_time_update':
          if (data.data?.deliveryTime) {
            setOrder(prev => prev ? { ...prev, deliveryTime: data.data.deliveryTime } : null);
            setStatusMessage('Lieferzeit wurde aktualisiert');
          }
          break;
        case 'driver_assigned':
          if (data.data?.deliveryDriver) {
            setOrder(prev => prev ? { ...prev, deliveryDriver: data.data.deliveryDriver } : null);
            setStatusMessage('Lieferant wurde zugewiesen');
          }
          break;
        case 'connected':
          setStatusMessage('Live-Updates aktiv');
          break;
        default:
          console.log(`❓ Unbekannter Update-Typ:`, data);
      }
    };

    const connectSSE = () => {
      eventSource = new EventSource(`/api/orders/live?orderId=${orderId}`);
      
      eventSource.onopen = () => {
        console.log(`✅ SSE-Verbindung geöffnet für Order ${orderId}`);
        setStatusMessage('Live-Updates aktiv');
        stopPolling();
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleUpdateMessage(data);
        } catch (error) {
          console.error('❌ Fehler beim Verarbeiten des Live-Updates:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error(`❌ SSE-Verbindungsfehler für Order ${orderId}:`, error);
        setStatusMessage('Live-Updates unterbrochen, versuche erneut...');
        eventSource?.close();
        startPolling();
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();
      
      return () => {
        console.log(`🔄 Beende Echtzeit-Updates für Order ${orderId}`);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollInterval) clearInterval(pollInterval);
      eventSource?.close();
      };
  }, [orderId]);

  useEffect(() => {
    if (!order?.deliveryTime) {
      setTimeUntilDelivery('Lieferzeit wird festgelegt');
      return;
    }

    const updateTimeUntilDelivery = () => {
      const now = new Date();
      const deliveryTime = new Date(order.deliveryTime!);
      const diff = deliveryTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilDelivery('Bestellung sollte geliefert sein! 🎉');
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setTimeUntilDelivery(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} Std.`);
      } else {
        setTimeUntilDelivery(`${minutes}:${seconds.toString().padStart(2, '0')} Min.`);
      }
    };
    
    updateTimeUntilDelivery();
    const interval = setInterval(updateTimeUntilDelivery, 1000); // Jede Sekunde aktualisieren
    return () => clearInterval(interval);
  }, [order?.deliveryTime]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else {
        setError('Bestellung konnte nicht geladen werden');
      }
    } catch (error) {
      setError('Fehler beim Laden der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  const getStatusColor = (status: string) => {
    const step = STATUS_STEPS.find(s => s.key === status);
    return step?.color || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Bestellbestätigung...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <CheckCircleIcon className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
              Fehler beim Laden der Bestellung
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/frontend/warenkorb"
              className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Zurück zum Warenkorb
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">
    <Header />
    
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Bestellung bestätigt!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg">
            <span className="text-sm font-medium text-brand-700">
              Bestellnummer: #{order.orderNumber}
            </span>
          </div>
          {statusMessage && (
            <div className="mt-4 inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-800 text-sm border border-blue-200">
              {statusMessage}
            </div>
          )}
        </div>
        
        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Bestellstatus
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = STATUS_STEPS.findIndex(s => s.key === order.status) >= index;
              const isCurrent = step.key === order.status;
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="relative flex items-center pb-8 last:pb-0">
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-white border-gray-300'
                  }`}>
                    <StepIcon className={`w-4 h-4 ${
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`text-sm font-medium ${
                      isCurrent ? 'text-brand-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-xs text-gray-500 mt-1">
                        Aktueller Status
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Countdown Timer */}
          {timeUntilDelivery && order.status !== 'DELIVERED' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  Voraussichtliche Lieferzeit: {timeUntilDelivery}
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Bestellzeit:
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {new Date(order.createdAt).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} Uhr
              </span>
            </div>
            
            {order.deliveryTime && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Voraussichtliche Lieferzeit:
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {(() => {
                    try {
                      const date = new Date(order.deliveryTime!);
                      return isNaN(date.getTime()) ? 'Ungültiges Datum' : date.toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + ' Uhr';
                    } catch (error) {
                      console.warn('Invalid delivery time:', order.deliveryTime, error);
                      return 'Ungültiges Datum';
                    }
                  })()}
                </span>
              </div>
            )}
            
          </div>
        </div>
        
        {/* Bestelldetails */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center">
            <CheckCircleIcon className="w-6 h-6 mr-3 text-brand-600" />
            Bestelldetails
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Kundendaten</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm text-gray-900 ml-2 font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">E-Mail:</span>
                  <span className="text-sm text-gray-900 ml-2">{order.customer.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Telefon:</span>
                  <span className="text-sm text-gray-900 ml-2">{order.customer.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bestellte Artikel</h3>
              <div className="space-y-3">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Menge: {item.quantity}</span>
                        <span className="mx-2">•</span>
                        <span>Einzelpreis: {Number(item.unitPrice).toFixed(2)} €</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="font-medium text-gray-900">
                        {Number(item.totalPrice).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Gesamtbetrag:</span>
                <span className="text-xl font-bold text-brand-600">
                  {Number(order.totalAmount).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Animierte Lieferanten-Anzeige */}
        {order.deliveryDriver && (
          <DeliveryDriverStatus 
            driver={order.deliveryDriver}
            status={order.status}
            deliveryTime={order.deliveryTime}
          />
        )}

        {/* Aktionen */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Haben Sie Fragen zu Ihrer Bestellung? Kontaktieren Sie uns gerne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/frontend/speisekarte" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                Weitere Bestellung aufgeben
              </Link>
              <Link 
                href="/frontend/kontakt" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
);
}
