'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeftIcon,
  UserIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CogIcon,
  ArrowRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function KontoPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    orders: 0,
    addresses: 0,
    favorites: 0
  });
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    items: string;
    total: number;
    status: string;
    statusText: string;
  }>>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/frontend/login?redirect=/konto');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Hier würden wir echte Daten laden
      setStats({
        orders: 12,
        addresses: 3,
        favorites: 5
      });

      // Mock recent orders
      setRecentOrders([
        {
          id: '1234',
          items: 'Pizza Margherita, Cola',
          total: 18.90,
          status: 'delivered',
          statusText: 'Geliefert'
        },
        {
          id: '1233',
          items: 'Burger, Pommes, Bier',
          total: 24.50,
          status: 'in_transit',
          statusText: 'Unterwegs'
        },
        {
          id: '1232',
          items: 'Sushi Set, Grüner Tee',
          total: 32.80,
          status: 'delivered',
          statusText: 'Geliefert'
        }
      ]);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Konto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/"
              className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Zurück zur Startseite
            </Link>
            <h1 className="text-3xl font-display font-semibold text-gray-900">
              Mein Konto
            </h1>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">
            Willkommen zurück{user?.profile?.firstName ? `, ${user.profile.firstName}` : ''}!
          </h2>
          <p className="text-gray-600">
            Hier finden Sie alle Ihre Bestellungen, Adressen und persönlichen Einstellungen.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">{stats.orders}</p>
                <p className="text-gray-600">Bestellungen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <MapPinIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">{stats.addresses}</p>
                <p className="text-gray-600">Adressen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">{stats.favorites}</p>
                <p className="text-gray-600">Favoriten</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Letzte Bestellungen
            </h2>
            <Link 
              href="/konto/bestellungen"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Alle anzeigen
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ShoppingBagIcon className="w-5 h-5 text-brand-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Bestellung #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">€{order.total.toFixed(2)}</p>
                  <p className={`text-sm ${order.status === 'delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                    {order.statusText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/konto/bestellungen"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-8 h-8 text-brand-600 mr-4" />
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                    Bestellungen
                  </h3>
                  <p className="text-gray-600">Bestellverlauf und Status</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>
          
          <Link 
            href="/konto/adressen"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPinIcon className="w-8 h-8 text-brand-600 mr-4" />
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                    Adressen
                  </h3>
                  <p className="text-gray-600">Lieferadressen verwalten</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>

          <Link 
            href="/konto/profil"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserIcon className="w-8 h-8 text-brand-600 mr-4" />
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                    Profil
                  </h3>
                  <p className="text-gray-600">Persönliche Daten bearbeiten</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>

          <Link 
            href="/konto/einstellungen"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CogIcon className="w-8 h-8 text-brand-600 mr-4" />
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                    Einstellungen
                  </h3>
                  <p className="text-gray-600">Konto und Benachrichtigungen</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/frontend/speisekarte"
            className="bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  Neue Bestellung
                </h3>
                <p className="text-brand-100">Durchsuchen Sie unsere Speisekarte</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-white" />
            </div>
          </Link>
          
          <Link 
            href="/tisch-reservierung"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  Tisch reservieren
                </h3>
                <p className="text-emerald-100">Reservieren Sie Ihren Tisch</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
