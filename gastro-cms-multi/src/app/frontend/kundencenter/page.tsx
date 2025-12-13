'use client';

import { useEffect } from 'react';
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
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function KundencenterPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Nicht eingeloggte Benutzer zur Login-Seite weiterleiten
      router.push('/frontend/login?redirect=/frontend/kundencenter');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Kundencenter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Diese Komponente wird nur bei Authentifizierung angezeigt
    // Die Weiterleitung wird im useEffect gehandhabt
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
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
              Kundencenter
            </h1>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">
            Willkommen zurück{user?.profile?.firstName ? `, ${user.profile.firstName}` : ''}!
          </h2>
          <p className="text-gray-600">
            Hier finden Sie alle Ihre Bestellungen, Lieblingsgerichte und persönlichen Einstellungen.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">12</p>
                <p className="text-gray-600">Bestellungen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">5</p>
                <p className="text-gray-600">Favoriten</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <MapPinIcon className="w-8 h-8 text-brand-600 mr-4" />
              <div>
                <p className="text-2xl font-display font-semibold text-gray-900">3</p>
                <p className="text-gray-600">Adressen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Letzte Bestellungen
            </h2>
            <Link 
              href="/frontend/bestellungen"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Alle anzeigen
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5 text-brand-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Bestellung #1234</p>
                  <p className="text-sm text-gray-600">Pizza Margherita, Cola</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">€18.90</p>
                <p className="text-sm text-green-600">Geliefert</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5 text-brand-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Bestellung #1233</p>
                  <p className="text-sm text-gray-600">Burger, Pommes, Bier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">€24.50</p>
                <p className="text-sm text-blue-600">Unterwegs</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5 text-brand-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Bestellung #1232</p>
                  <p className="text-sm text-gray-600">Sushi Set, Grüner Tee</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">€32.80</p>
                <p className="text-sm text-green-600">Geliefert</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/frontend/speisekarte"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Neue Bestellung
                </h3>
                <p className="text-gray-600">Durchsuchen Sie unsere Speisekarte</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>
          
          <Link 
            href="/frontend/bestellungen"
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-strong transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  Bestellverlauf
                </h3>
                <p className="text-gray-600">Alle Ihre Bestellungen im Überblick</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-brand-600" />
            </div>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
