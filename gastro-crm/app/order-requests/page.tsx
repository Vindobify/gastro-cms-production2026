'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface OrderRequest {
  id: number;
  businessType: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  hasDeliveryService: boolean;
  deliveryServiceName: string | null;
  monthlyRevenue: number | null;
  deliveryPercentage: number | null;
  calculatedSavings: number | null;
  hasDomain: boolean;
  existingDomain: string | null;
  desiredDomain: string | null;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedAV: boolean;
  status: string;
  paymentAmount: number;
  stripeSessionId: string | null;
  convertedToTenantId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrderRequestsPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [converting, setConverting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [orderToConvert, setOrderToConvert] = useState<OrderRequest | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/order-requests'
        : `/api/order-requests?status=${statusFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching order requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConvertModal = (order: OrderRequest) => {
    setOrderToConvert(order);
    setShowConvertModal(true);
  };

  const closeConvertModal = () => {
    setShowConvertModal(false);
    setOrderToConvert(null);
  };

  const convertToRestaurant = async () => {
    if (!orderToConvert) return;

    setConverting(true);
    try {
      const response = await fetch(`/api/order-requests/${orderToConvert.id}/convert`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Restaurant erfolgreich erstellt! ID: ${data.tenant.id}\n\nAlle Daten wurden 1:1 übernommen.`);
        fetchOrders();
        if (selectedOrder?.id === orderToConvert.id) {
          setSelectedOrder({ ...selectedOrder, convertedToTenantId: data.tenant.id, status: 'CONVERTED' });
        }
        closeConvertModal();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error converting order:', error);
      alert('Fehler beim Umwandeln der Bestellung');
    } finally {
      setConverting(false);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/order-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status, notes: notes || selectedOrder.notes });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'CONVERTED':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      CONVERTED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <DashboardLayout title="Bestellungen">
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'PENDING'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ausstehend
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'PAID'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bezahlt
          </button>
          <button
            onClick={() => setStatusFilter('CONVERTED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'CONVERTED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Umgewandelt
          </button>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Lade Bestellungen...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Keine Bestellungen gefunden</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Cards */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer border-2 ${
                    selectedOrder?.id === order.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.restaurantName}</h3>
                      <p className="text-sm text-gray-500">{order.ownerName}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Betrag:</span> {formatPrice(order.paymentAmount)}
                    </p>
                    {order.hasDomain ? (
                      <p className="text-sm text-green-600">✓ Domain vorhanden (kostenlos)</p>
                    ) : (
                      <p className="text-sm text-orange-600">⚠ Keine Domain (€30,00)</p>
                    )}
                    {order.convertedToTenantId && (
                      <p className="text-sm text-blue-600">✓ Umgewandelt zu Restaurant</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>

            {/* Detail View */}
            {selectedOrder && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Bestelldetails</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restaurant</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.restaurantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inhaber</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.ownerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOrder.address}, {selectedOrder.postalCode} {selectedOrder.city}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain</label>
                    {selectedOrder.hasDomain ? (
                      <p className="mt-1 text-sm text-green-600">✓ {selectedOrder.existingDomain}</p>
                    ) : (
                      <p className="mt-1 text-sm text-orange-600">⚠ Keine Domain - {selectedOrder.desiredDomain || 'Nicht angegeben'}</p>
                    )}
                  </div>
                  {selectedOrder.monthlyRevenue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monatlicher Umsatz</label>
                      <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedOrder.monthlyRevenue)}</p>
                    </div>
                  )}
                  {selectedOrder.calculatedSavings && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ersparnis pro Monat</label>
                      <p className="mt-1 text-sm text-green-600 font-semibold">{formatPrice(selectedOrder.calculatedSavings)}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="PENDING">Ausstehend</option>
                      <option value="PAID">Bezahlt</option>
                      <option value="CONVERTED">Umgewandelt</option>
                      <option value="CANCELLED">Storniert</option>
                    </select>
                  </div>
                  {!selectedOrder.convertedToTenantId && selectedOrder.status === 'PAID' && (
                    <button
                      onClick={() => openConvertModal(selectedOrder)}
                      disabled={converting}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {converting ? 'Wird umgewandelt...' : 'In Restaurant umwandeln'}
                    </button>
                  )}
                  {selectedOrder.convertedToTenantId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        ✓ Umgewandelt zu Restaurant ID: {selectedOrder.convertedToTenantId}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notizen</label>
                    <textarea
                      value={selectedOrder.notes || ''}
                      onChange={(e) => {
                        const updated = { ...selectedOrder, notes: e.target.value };
                        setSelectedOrder(updated);
                        updateStatus(selectedOrder.id, selectedOrder.status, e.target.value);
                      }}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Interne Notizen..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Convert Confirmation Modal */}
        {showConvertModal && orderToConvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Bestellung in Restaurant umwandeln
                </h2>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Wichtig:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
                        Alle Daten werden 1:1 in ein neues Restaurant übernommen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Übernommene Daten:</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Restaurant Name</p>
                      <p className="text-sm text-gray-900">{orderToConvert.restaurantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Inhaber</p>
                      <p className="text-sm text-gray-900">{orderToConvert.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">E-Mail</p>
                      <p className="text-sm text-gray-900">{orderToConvert.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefon</p>
                      <p className="text-sm text-gray-900">{orderToConvert.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Adresse</p>
                      <p className="text-sm text-gray-900">
                        {orderToConvert.address}, {orderToConvert.postalCode} {orderToConvert.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Geschäftstyp</p>
                      <p className="text-sm text-gray-900">{orderToConvert.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Domain</p>
                      <p className="text-sm text-gray-900">
                        {orderToConvert.hasDomain 
                          ? orderToConvert.existingDomain || '-'
                          : orderToConvert.desiredDomain || '-'}
                      </p>
                    </div>
                    {orderToConvert.hasDeliveryService && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lieferservice</p>
                        <p className="text-sm text-gray-900">{orderToConvert.deliveryServiceName || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeConvertModal}
                    disabled={converting}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={convertToRestaurant}
                    disabled={converting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {converting ? 'Wird umgewandelt...' : 'Bestätigen und umwandeln'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

