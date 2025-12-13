'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreditCardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Provision {
  id: number;
  tenantId: string;
  tenant: {
    name: string;
  };
  orderId: number;
  order: {
    orderNumber: string;
    totalAmount: number;
  };
  paymentMethod: string;
  amount: number;
  commission: number;
  commissionPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export default function ProvisionsPage() {
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    tenantId: '',
    paymentMethod: '',
    paid: 'all',
  });

  useEffect(() => {
    fetchProvisions();
  }, [filter]);

  const fetchProvisions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.tenantId) params.set('tenantId', filter.tenantId);
      if (filter.paymentMethod) params.set('paymentMethod', filter.paymentMethod);
      if (filter.paid !== 'all') params.set('paid', filter.paid);

      const response = await fetch(`/api/provisions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProvisions(data);
      }
    } catch (error) {
      console.error('Error fetching provisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (provisionId: number) => {
    try {
      const response = await fetch(`/api/provisions/${provisionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commissionPaid: true }),
      });

      if (response.ok) {
        fetchProvisions();
      }
    } catch (error) {
      console.error('Error marking provision as paid:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const totalCommission = provisions.reduce((sum, p) => sum + Number(p.commission), 0);
  const unpaidCommission = provisions
    .filter((p) => !p.commissionPaid)
    .reduce((sum, p) => sum + Number(p.commission), 0);

  return (
    <DashboardLayout title="Provisionen">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamt Provision
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalCommission)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ausstehend
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(unpaidCommission)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bezahlt
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalCommission - unpaidCommission)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zahlungsmethode
            </label>
            <select
              value={filter.paymentMethod}
              onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Alle</option>
              <option value="CASH">Bar</option>
              <option value="BANKOMAT">Bankomat</option>
              <option value="CARD">Karte</option>
              <option value="STRIPE">Stripe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.paid}
              onChange={(e) => setFilter({ ...filter, paid: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Alle</option>
              <option value="unpaid">Ausstehend</option>
              <option value="paid">Bezahlt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Provisions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Provisionen</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Lade Provisionen...</p>
            </div>
          ) : provisions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Keine Provisionen gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bestellung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zahlungsmethode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Betrag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provision
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {provisions.map((provision) => (
                    <tr key={provision.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {provision.tenant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{provision.order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {provision.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(Number(provision.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(Number(provision.commission))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            provision.commissionPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {provision.commissionPaid ? 'Bezahlt' : 'Ausstehend'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!provision.commissionPaid && (
                          <button
                            onClick={() => handleMarkAsPaid(provision.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Als bezahlt markieren
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

