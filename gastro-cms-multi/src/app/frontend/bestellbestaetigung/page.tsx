'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function BestellbestaetigungPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Prüfe URL-Parameter oder localStorage für Bestell-ID
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    const idFromStorage = localStorage.getItem('lastOrderId');
    
    const orderId = idFromUrl || idFromStorage;
    
    if (orderId) {
      setOrderId(orderId);
      // Weiterleitung zur detaillierten Bestellbestätigung
      router.push(`/frontend/bestellbestaetigung/${orderId}`);
    } else {
      setLoading(false);
    }
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Keine Bestellung gefunden
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Es wurde keine Bestell-ID gefunden. Möglicherweise ist der Link abgelaufen oder ungültig.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/frontend/speisekarte" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
            >
              Neue Bestellung aufgeben
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
      
      <Footer />
    </div>
  );
}
