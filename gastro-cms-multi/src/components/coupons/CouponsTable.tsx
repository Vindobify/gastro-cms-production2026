'use client';

import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit: number;
  isActive: boolean;
  isPublic: boolean;
  canCombine: boolean;
  createdAt: string;
  restrictions: any[];
  _count: {
    usages: number;
    customerAssignments: number;
  };
}

export default function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Möchten Sie diesen Gutschein wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCoupons(coupons.filter(coupon => coupon.id !== id));
      } else {
        alert('Fehler beim Löschen des Gutscheins');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Fehler beim Löschen des Gutscheins');
    }
  };

  const toggleCouponStatus = async (id: number, currentStatus: boolean) => {
    try {
      const coupon = coupons.find(c => c.id === id);
      if (!coupon) return;

      const response = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...coupon,
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        setCoupons(coupons.map(c => 
          c.id === id ? { ...c, isActive: !currentStatus } : c
        ));
      } else {
        alert('Fehler beim Aktualisieren des Gutscheins');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Fehler beim Aktualisieren des Gutscheins');
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        return `${coupon.discountValue}%`;
      case 'FIXED_AMOUNT':
        return `€${coupon.discountValue}`;
      case 'PRODUCT_SPECIFIC':
        return `${coupon.discountValue}% (Produkt)`;
      case 'FREE_DELIVERY':
        return 'Kostenlose Lieferung';
      default:
        return 'Unbekannt';
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Inaktiv
        </span>
      );
    }

    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-4 w-4 mr-1" />
          Bald aktiv
        </span>
      );
    }

    if (now > endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Abgelaufen
        </span>
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Aufgebraucht
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        Aktiv
      </span>
    );
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && coupon.isActive) ||
      (filterActive === 'inactive' && !coupon.isActive);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Filter und Suche */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Gutscheine durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Gutscheine</option>
              <option value="active">Nur aktive</option>
              <option value="inactive">Nur inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gutschein
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rabatt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gültigkeit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verwendung
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
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {coupon.name}
                    </div>
                    {coupon.description && (
                      <div className="text-xs text-gray-400 truncate max-w-xs">
                        {coupon.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getDiscountDisplay(coupon)}
                  </div>
                  {coupon.minimumOrderAmount && (
                    <div className="text-xs text-gray-500">
                      Ab €{coupon.minimumOrderAmount}
                    </div>
                  )}
                  {coupon.maximumDiscount && (
                    <div className="text-xs text-gray-500">
                      Max. €{coupon.maximumDiscount}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>Von: {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString('de-DE') : 'Nicht gesetzt'}</div>
                    <div>Bis: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('de-DE') : 'Nicht gesetzt'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.usageCount}
                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {coupon.perCustomerLimit}x pro Kunde
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(coupon)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/coupons/${coupon.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                      className={`${
                        coupon.isActive 
                          ? 'text-yellow-600 hover:text-yellow-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {coupon.isActive ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCoupons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm || filterActive !== 'all' 
              ? 'Keine Gutscheine gefunden, die den Kriterien entsprechen'
              : 'Noch keine Gutscheine erstellt'
            }
          </p>
        </div>
      )}
    </div>
  );
}
