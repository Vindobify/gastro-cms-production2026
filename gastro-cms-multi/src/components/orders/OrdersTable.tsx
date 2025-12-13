'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  status: string;
  deliveryType: string;
  totalAmount: number;
  totalAmountNet: number;
  totalTax: number;
  createdAt: string;
  deliveryTime?: string;
  orderItems: Array<{
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
    extras?: string[];
  }>;
  notes?: string;
  tipAmount?: number;
  tipType?: string;
  tipPercentage?: number;
  tipPaid?: boolean;
  taxBreakdown?: Array<{
    rate: number;
    ratePercent: number;
    netAmount: number;
    taxAmount: number;
  }>;
}

// Hilfsfunktion für die Preisformatierung
function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Ausstehend' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: 'Bestätigt' },
  PREPARING: { color: 'bg-orange-100 text-orange-800', label: 'Wird zubereitet' },
  READY: { color: 'bg-green-100 text-green-800', label: 'Bereit' },
  OUT_FOR_DELIVERY: { color: 'bg-purple-100 text-purple-800', label: 'Unterwegs' },
  DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Geliefert' },
  CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Storniert' }
};

const deliveryTypeConfig = {
  PICKUP: { color: 'bg-blue-100 text-blue-800', label: 'Abholung' },
  DELIVERY: { color: 'bg-green-100 text-green-800', label: 'Lieferung' }
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('Möchtest du diese Bestellung wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== id));
      } else {
        alert('Fehler beim Löschen der Bestellung');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Fehler beim Löschen der Bestellung');
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Aktualisiere den lokalen State
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        alert('Fehler beim Aktualisieren des Status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || 'Unbekannt';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Bestellungen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Alle Status</option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestellnummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieferart
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieferzeit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                const deliveryType = deliveryTypeConfig[order.deliveryType as keyof typeof deliveryTypeConfig] || deliveryTypeConfig.PICKUP;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                      >
                        {Object.entries(statusConfig).map(([statusKey, statusInfo]) => (
                          <option key={statusKey} value={statusKey} className="bg-white text-gray-900">
                            {statusInfo.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${deliveryType.color}`}>
                        {deliveryType.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>€{formatPrice(order.totalAmount)}</div>
                        <div className="text-xs text-gray-500">
                          Netto: €{formatPrice(order.totalAmountNet)} | MwSt: €{formatPrice(order.totalTax)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.deliveryTime 
                        ? new Date(order.deliveryTime).toLocaleDateString('de-DE') + ' ' + new Date(order.deliveryTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                        : order.deliveryType === 'DELIVERY' ? 'Nicht angegeben' : 'Abholung'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/orders/edit/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Öffne den professionellen Bon in einem neuen Tab
                            const bonUrl = `/frontend/bon/${order.id}`;
                            window.open(bonUrl, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Professioneller Bon"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || statusFilter ? 'Keine Bestellungen gefunden.' : 'Keine Bestellungen vorhanden.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
