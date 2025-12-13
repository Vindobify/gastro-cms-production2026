'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import ProfessionalReceipt from '@/components/receipt/ProfessionalReceipt';
import KitchenTicket from '@/components/receipt/KitchenTicket';
import { safeToISOString, safeToLocaleString, safeToLocaleDateString, safeGetTime } from '@/lib/safeDateUtils';
import { getOrderSound } from '@/lib/orderSound';
import { useToast } from '@/contexts/ToastContext';

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    description: string;
    taxRate: number;
  };
  extraIds: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  totalAmountNet: number;
  totalTax: number;
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
  };
  orderItems: OrderItem[];
  restaurantAddress?: {
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
  notes?: string;
  tipAmount?: number;
  tipType?: string;
  tipPercentage?: number;
  tipPaid?: boolean;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Ausstehend' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Bestätigt' },
  PREPARING: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, label: 'Wird zubereitet' },
  READY: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Bereit' },
  OUT_FOR_DELIVERY: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, label: 'Unterwegs' },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Geliefert' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: ClockIcon, label: 'Storniert' }
};

const getOrderStatusLabel = (status: string) => statusConfig[status as keyof typeof statusConfig]?.label || status;

interface DeliveryDriver {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  isAvailable: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const previousOrderCountRef = useRef<number>(0);
  const selectedOrderRef = useRef<Order | null>(null);
  const toast = useToast();
  const orderSoundRef = useRef(getOrderSound());

  // Helper function to resolve extra IDs to names
  const resolveExtraNames = async (extraIds: string): Promise<string[]> => {
    if (!extraIds) return [];

    try {
      const ids = JSON.parse(extraIds);
      if (!Array.isArray(ids) || ids.length === 0) return [];

      // Fetch all extras to get names
      const response = await fetch('/api/extras');
      if (!response.ok) return ids.map(id => `Extra ${id}`);

      const extraGroups = await response.json();
      const extraNames: string[] = [];

      // Find extra names by IDs
      extraGroups.forEach((group: any) => {
        group.extras?.forEach((extra: any) => {
          if (ids.includes(extra.id)) {
            extraNames.push(extra.name);
          }
        });
      });

      return extraNames.length > 0 ? extraNames : ids.map(id => `Extra ${id}`);
    } catch (error) {
      console.error('Error resolving extra names:', error);
      return [];
    }
  };

  // Filter und Suche anwenden
  const filteredOrders = orders.filter(order => {
    // Tab-Filter anwenden
    if (activeTab !== 'all') {
      const statusMap = {
        'pending': 'PENDING',
        'preparing': 'PREPARING',
        'ready': 'READY',
        'delivered': 'DELIVERED'
      };
      if (order.status !== statusMap[activeTab as keyof typeof statusMap]) {
        return false;
      }
    }

    // Suchfilter anwenden
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        (order.customer?.firstName || '').toLowerCase().includes(search) ||
        (order.customer?.lastName || '').toLowerCase().includes(search) ||
        (order.customer?.email || '').toLowerCase().includes(search) ||
        `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.toLowerCase().includes(search)
      );
    }

    return true;
  });

  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  useEffect(() => {
    // Anfrage für Browser-Push (Sofort nach Login anfragen)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    fetchOrders();
    fetchDeliveryDrivers();

    // Polling als Fallback
    const pollInterval = setInterval(() => {
      fetchOrders({ suppressNewOrderNotice: true });
    }, 15000);

    // SSE für echte Push-Updates
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const notifyManager = (title: string, body: string) => {
      if (typeof window === 'undefined') return;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'orders-dashboard'
        });
      }
    };

    const handleUpdate = (data: any) => {
      if (!data?.type) return;

      if (data.type === 'new_order') {
        orderSoundRef.current.play().catch(console.error);
        toast.success('🔔 Neue Bestellung eingegangen!', 5000);
        notifyManager('Neue Bestellung', 'Es ist eine neue Bestellung eingetroffen.');
        fetchOrders({ suppressNewOrderNotice: true });
        return;
      }

      if (data.type === 'order_updated' && data.order) {
        setOrders(prev => prev.map(order => order.id === data.order.id ? { ...order, ...data.order } : order));
        if (selectedOrderRef.current?.id === data.order.id) {
          setSelectedOrder(prev => prev ? { ...prev, ...data.order } : null);
        }

        if (data.order.status) {
          toast.success(`📋 Status aktualisiert: ${getOrderStatusLabel(data.order.status)}`, 4000);
          notifyManager('Status geändert', `Bestellung #${data.order.orderNumber || data.order.id}: ${getOrderStatusLabel(data.order.status)}`);
        }
        return;
      }
    };

    const connectSSE = () => {
      eventSource = new EventSource('/api/orders/live?orderId=all');

      eventSource.onopen = () => {
        setIsSseConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleUpdate(payload);
        } catch (error) {
          console.error('Fehler beim Verarbeiten des SSE-Events:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE-Verbindungsfehler:', error);
        setIsSseConnected(false);
        eventSource?.close();
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      clearInterval(pollInterval);
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const fetchOrders = async (options: { suppressNewOrderNotice?: boolean } = {}) => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include' // Cookies automatisch mitsenden
      });

      if (response.ok) {
        const data = await response.json();

        // Prüfe auf neue Bestellungen
        if (!options.suppressNewOrderNotice && previousOrderCountRef.current > 0 && data.length > previousOrderCountRef.current) {
          const newOrdersCount = data.length - previousOrderCountRef.current;

          // Sound abspielen
          orderSoundRef.current.play().catch(console.error);

          // Toast-Benachrichtigung
          toast.success(`🔔 ${newOrdersCount} neue Bestellung${newOrdersCount > 1 ? 'en' : ''}!`, 5000);

          // Browser-Benachrichtigung (falls erlaubt)
          if (Notification.permission === 'granted') {
            new Notification('Neue Bestellung!', {
              body: `Sie haben ${newOrdersCount} neue Bestellung${newOrdersCount > 1 ? 'en' : ''} erhalten.`,
              icon: '/favicon.ico',
              tag: 'new-order',
              requireInteraction: false
            });
          }
        }

        previousOrderCountRef.current = data.length;
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryDrivers = async () => {
    try {
      const response = await fetch('/api/delivery-drivers?activeOnly=true', {
        credentials: 'include' // Cookies automatisch mitsenden
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryDrivers(data);
      } else {
        console.error('Failed to fetch delivery drivers');
      }
    } catch (error) {
      console.error('Error fetching delivery drivers:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const previousOrders = orders;
    const previousSelected = selectedOrder;

    // Optimistisches Update
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookies automatisch mitsenden
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Status konnte nicht aktualisiert werden');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Status konnte nicht gespeichert werden');
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
    }
  };

  const updateDeliveryTime = async (orderId: number, deliveryTimeOrMinutes: string | number) => {
    let deliveryTime: string;
    const previousOrders = orders;
    const previousSelected = selectedOrder;

    if (typeof deliveryTimeOrMinutes === 'number') {
      // Für Schnellauswahl-Buttons (30, 45, 60 Minuten)
      const futureDate = new Date(Date.now() + deliveryTimeOrMinutes * 60 * 1000);
      deliveryTime = futureDate.toISOString();
      console.log(`Setting delivery time to ${deliveryTimeOrMinutes} minutes from now:`, deliveryTime);
    } else {
      // Für manuelle Eingabe
      try {
        const date = new Date(deliveryTimeOrMinutes);
        if (isNaN(date.getTime())) {
          console.warn('Ungültige Lieferzeit eingegeben:', deliveryTimeOrMinutes);
          return;
        }
        deliveryTime = date.toISOString();
        console.log('Setting delivery time from input:', deliveryTime);
      } catch (error) {
        console.warn('Fehler beim Validieren der Lieferzeit:', deliveryTimeOrMinutes, error);
        return;
      }
    }

    try {
      console.log('Sending PATCH request to update delivery time:', { orderId, deliveryTime });

      // Optimistisches Update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, deliveryTime } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, deliveryTime } : null);
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ deliveryTime })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('Delivery time updated successfully:', updatedOrder);
      } else {
        const errorData = await response.json();
        console.error('Error updating delivery time:', response.status, errorData);
        throw new Error(errorData.error || 'Fehler beim Aktualisieren der Lieferzeit');
      }
    } catch (error) {
      console.error('Error updating delivery time:', error);
      toast.error('Lieferzeit konnte nicht gespeichert werden');
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Bestellung löschen möchten?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include' // Cookies automatisch mitsenden
      });

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
          setIsModalOpen(false);
        }
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const assignDriver = async (orderId: number, deliveryDriverId: number) => {
    const previousOrders = orders;
    const previousSelected = selectedOrder;

    // Optimistisches Update
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, deliveryDriverId } as any : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, deliveryDriverId } as any : null);
    }

    setIsAssigningDriver(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/assign-driver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookies automatisch mitsenden
        body: JSON.stringify({ deliveryDriverId })
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, ...data.order } : order
        ));
        if (selectedOrderRef.current?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, ...data.order } : null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler bei der Lieferantenzuweisung');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Lieferant konnte nicht zugewiesen werden');
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
    } finally {
      setIsAssigningDriver(false);
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePrint = async (order: Order) => {
    // Öffne den professionellen Bon in einem neuen Tab
    const bonUrl = `/frontend/bon/${order.id}`;
    window.open(bonUrl, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout title="Bestellungen" subtitle="Verwalten Sie alle Bestellungen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Bestellungen...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bestellungen" subtitle="Verwalten Sie alle Bestellungen">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Tab-Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Alle', count: orders.length },
                { key: 'pending', label: 'Neu', count: orders.filter(o => o.status === 'PENDING').length },
                { key: 'preparing', label: 'In Bearbeitung', count: orders.filter(o => o.status === 'PREPARING').length },
                { key: 'ready', label: 'Bereit', count: orders.filter(o => o.status === 'READY').length },
                { key: 'delivered', label: 'Geliefert', count: orders.filter(o => o.status === 'DELIVERED').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.key
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Suchfeld */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Suchen nach Bestellnummer, Kunde, E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {activeTab === 'all' ? 'Alle Bestellungen' :
                activeTab === 'pending' ? 'Neue Bestellungen' :
                  activeTab === 'preparing' ? 'Bestellungen in Bearbeitung' :
                    activeTab === 'ready' ? 'Bereite Bestellungen' :
                      'Gelieferte Bestellungen'} ({filteredOrders.length})
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Aktualisieren
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Keine Suchergebnisse' : 'Keine Bestellungen'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `Keine Bestellungen gefunden für "${searchTerm}"`
                  : activeTab === 'all'
                    ? 'Es wurden noch keine Bestellungen aufgegeben.'
                    : `Keine ${activeTab === 'pending' ? 'neuen' :
                      activeTab === 'preparing' ? 'Bestellungen in Bearbeitung' :
                        activeTab === 'ready' ? 'bereiten' : 'gelieferten'} Bestellungen.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.customer?.firstName} {order.customer?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-gray-900">€{(Number(order.totalAmount) || 0).toFixed(2).replace('.', ',')}</p>
                          {order.tipAmount && parseFloat(order.tipAmount.toString()) > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              💰 Trinkgeld: €{parseFloat(order.tipAmount.toString()).toFixed(2).replace('.', ',')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {order.createdAt && typeof order.createdAt === 'object' && Object.keys(order.createdAt).length === 0
                              ? 'Ungültiges Datum'
                              : safeToLocaleDateString(order.createdAt)
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => openOrderModal(order)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            setShowDeleteDialog(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Bestellung löschen (Admin)"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bestellungs-Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bestellung {selectedOrder.orderNumber}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Druck-Button */}
                  <button
                    onClick={() => handlePrint(selectedOrder)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Professioneller Bon
                  </button>

                  {/* Schließen-Button */}
                  <button
                    onClick={closeOrderModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kundendaten */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-brand-600" />
                    Kundendaten
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      {selectedOrder.customer?.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {selectedOrder.customer?.phone}
                    </p>
                    {selectedOrder.deliveryType === 'DELIVERY' && selectedOrder.customer?.address && selectedOrder.customer?.postalCode && selectedOrder.customer?.city && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {selectedOrder.customer.address}, {selectedOrder.customer.postalCode} {selectedOrder.customer.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bestelldetails */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-brand-600" />
                    Bestelldetails
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Bestellart:</span> {selectedOrder.deliveryType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Erstellt:</span> {safeToLocaleString(selectedOrder.createdAt)}
                    </p>
                    {selectedOrder.deliveryTime &&
                      typeof selectedOrder.deliveryTime === 'object' &&
                      Object.keys(selectedOrder.deliveryTime).length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Lieferzeit:</span> {safeToLocaleString(selectedOrder.deliveryTime)}
                        </p>
                      )}
                    <p className="text-sm">
                      <span className="font-medium">Gesamtbetrag:</span> €{(Number(selectedOrder.totalAmount) || 0).toFixed(2).replace('.', ',')}
                    </p>
                    {selectedOrder.tipAmount && parseFloat(selectedOrder.tipAmount.toString()) > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        <span className="font-medium">💰 Trinkgeld für Lieferant:</span> €{parseFloat(selectedOrder.tipAmount.toString()).toFixed(2).replace('.', ',')}
                        {selectedOrder.tipType === 'PERCENTAGE' && selectedOrder.tipPercentage && (
                          <span className="text-gray-500 ml-2">({selectedOrder.tipPercentage}%)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bestellte Produkte */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Bestellte Produkte</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Menge: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-brand-600">
                        €{(Number(item.totalPrice) || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verwaltung */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Bestellung verwalten</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[100px]">Status:</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      disabled={isUpdating}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                    >
                      <option value="PENDING">Neu</option>
                      <option value="CONFIRMED">Bestätigt</option>
                      <option value="PREPARING">In Bearbeitung</option>
                      <option value="READY">Bereit</option>
                      <option value="OUT_FOR_DELIVERY">Unterwegs</option>
                      <option value="DELIVERED">Geliefert</option>
                      <option value="CANCELLED">Storniert</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[100px]">Lieferzeit:</label>
                    <input
                      type="datetime-local"
                      value={(() => {
                        // Prüfe auf null, undefined oder leeres Objekt
                        if (!selectedOrder.deliveryTime ||
                          (typeof selectedOrder.deliveryTime === 'object' &&
                            selectedOrder.deliveryTime !== null &&
                            Object.keys(selectedOrder.deliveryTime).length === 0)) {
                          return '';
                        }

                        try {
                          // Wenn es ein String ist, versuche es zu parsen
                          const date = typeof selectedOrder.deliveryTime === 'string'
                            ? new Date(selectedOrder.deliveryTime)
                            : selectedOrder.deliveryTime;

                          if (isNaN(date.getTime())) {
                            return '';
                          }
                          return date.toISOString().slice(0, 16);
                        } catch (error) {
                          console.warn('Error parsing deliveryTime:', selectedOrder.deliveryTime, error);
                          return '';
                        }
                      })()}
                      onChange={(e) => updateDeliveryTime(selectedOrder.id, e.target.value)}
                      disabled={isUpdating}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[100px]">Lieferant:</label>
                    <select
                      value={selectedOrder.deliveryDriver?.id || ''}
                      onChange={(e) => e.target.value && assignDriver(selectedOrder.id, parseInt(e.target.value))}
                      disabled={isAssigningDriver || deliveryDrivers.length === 0}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                    >
                      <option value="">Lieferant auswählen...</option>
                      {deliveryDrivers.filter(driver => driver.isAvailable).map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} ({driver.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOrder.deliveryDriver && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Zugewiesener Lieferant: {selectedOrder.deliveryDriver.user?.profile?.firstName || 'N/A'} {selectedOrder.deliveryDriver.user?.profile?.lastName || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schnelle Lieferzeit-Buttons */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Schnelle Lieferzeit setzen</h4>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700 mb-2">
                    <span className="font-medium">Gesamtzeit:</span> Zubereitungszeit (~20 Min.) + Lieferzeit
                  </p>
                  <p className="text-xs text-blue-600">
                    Diese Zeit wird dem Kunden als Gesamtlieferzeit angezeigt
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 45, 60].map((minutes) => {
                    const isActive = (() => {
                      if (!selectedOrder.deliveryTime) return false;

                      // Prüfe auf leeres Objekt
                      if (typeof selectedOrder.deliveryTime === 'object' &&
                        selectedOrder.deliveryTime !== null &&
                        Object.keys(selectedOrder.deliveryTime).length === 0) {
                        return false;
                      }

                      try {
                        const date = typeof selectedOrder.deliveryTime === 'string'
                          ? new Date(selectedOrder.deliveryTime)
                          : selectedOrder.deliveryTime;

                        if (isNaN(date.getTime())) return false;

                        return Math.abs(date.getTime() - Date.now()) < 2 * 60 * 1000; // Innerhalb 2 Min.
                      } catch (error) {
                        return false;
                      }
                    })();

                    return (
                      <button
                        key={minutes}
                        onClick={() => updateDeliveryTime(selectedOrder.id, minutes)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors border-2 ${isActive
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="text-lg font-bold">{minutes} Min.</div>
                        <div className="text-xs text-gray-500">
                          {minutes === 30 ? 'Schnell' : minutes === 45 ? 'Standard' : 'Entspannt'}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(() => {
                  if (!selectedOrder.deliveryTime) return null;

                  // Prüfe auf leeres Objekt
                  if (typeof selectedOrder.deliveryTime === 'object' &&
                    selectedOrder.deliveryTime !== null &&
                    Object.keys(selectedOrder.deliveryTime).length === 0) {
                    return null;
                  }

                  try {
                    const date = typeof selectedOrder.deliveryTime === 'string'
                      ? new Date(selectedOrder.deliveryTime)
                      : selectedOrder.deliveryTime;

                    if (isNaN(date.getTime())) return null;

                    return (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">Aktuelle Lieferzeit:</span> {' '}
                          {date.toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) + ' Uhr'}
                        </p>
                      </div>
                    );
                  } catch (error) {
                    return null;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lösch-Bestätigungsdialog */}
      {showDeleteDialog && orderToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bestellung löschen?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sind Sie sicher, dass Sie die Bestellung{' '}
                <span className="font-medium text-gray-900">#{orderToDelete.orderNumber}</span>
                {' '}von{' '}
                <span className="font-medium text-gray-900">
                  {orderToDelete.customer?.firstName} {orderToDelete.customer?.lastName}
                </span>
                {' '}unwiderruflich löschen möchten?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden.
                    Alle Bestelldaten werden permanent gelöscht.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    if (orderToDelete) {
                      deleteOrder(orderToDelete.id);
                      setShowDeleteDialog(false);
                      setOrderToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Lösche...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Endgültig löschen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
