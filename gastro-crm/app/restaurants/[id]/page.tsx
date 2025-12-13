'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  PencilIcon,
  ChartBarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface Restaurant {
  id: string;
  name: string;
  domain: string | null;
  subdomain: string | null;
  email: string;
  phone: string | null;
  ownerName: string | null;
  isActive: boolean;
  plan: string;
  stripeAccountId: string | null;
  stripeOnboardingStatus: string | null;
  stripeConnectedAt: string | null;
  commissionRate: number;
  createdAt: string;
  settings: {
    restaurantName: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  _count: {
    orders: number;
    users: number;
    products: number;
    categories: number;
  };
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchRestaurant();
    }
  }, [params.id]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Restaurant...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Restaurant nicht gefunden</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStripeStatus = () => {
    if (restaurant.stripeOnboardingStatus === 'completed') {
      return { label: 'Verbunden', color: 'bg-green-100 text-green-800' };
    }
    if (restaurant.stripeOnboardingStatus === 'pending') {
      return { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Nicht verbunden', color: 'bg-gray-100 text-gray-800' };
  };

  const stripeStatus = getStripeStatus();

  return (
    <DashboardLayout title={restaurant.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                  <span
                    className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      restaurant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{restaurant.email}</p>
              </div>
              <Link
                href={`/restaurants/${restaurant.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Bearbeiten
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-1">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bestellungen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {restaurant._count.orders}
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
                  <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Produkte
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {restaurant._count.products}
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
                  <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Kategorien
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {restaurant._count.categories}
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
                  <CreditCardIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Benutzer
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      -
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {restaurant.domain || 'Nicht gesetzt'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Subdomain</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {restaurant.subdomain || 'Nicht gesetzt'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900">{restaurant.plan}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Provision</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(Number(restaurant.commissionRate) * 100).toFixed(0)}%
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stripe Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stripeStatus.color}`}
                  >
                    {stripeStatus.label}
                  </span>
                </dd>
              </div>
              {restaurant.settings && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {restaurant.settings.address || 'Nicht gesetzt'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stadt</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {restaurant.settings.city || 'Nicht gesetzt'}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

