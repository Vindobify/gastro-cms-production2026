'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeftIcon, PlusIcon, MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdressenPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/konto/adressen');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Mock addresses data since customerAddress model is not working
    const mockAddresses = [
      {
        id: 1,
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '1010',
        city: 'Wien',
        country: 'Österreich',
        isDefault: true,
        firstName: 'Max',
        lastName: 'Mustermann'
      },
      {
        id: 2,
        street: 'Testgasse',
        houseNumber: '45',
        postalCode: '1020',
        city: 'Wien',
        country: 'Österreich',
        isDefault: false,
        firstName: 'Max',
        lastName: 'Mustermann'
      }
    ];
    setAddresses(mockAddresses);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/konto"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Zurück zum Konto
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meine Adressen</h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Ihre Lieferadressen
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Neue Adresse
            </button>
          </div>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Adressen gespeichert
            </h3>
            <p className="text-gray-500 mb-6">
              Fügen Sie Ihre erste Lieferadresse hinzu, um schneller bestellen zu können.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Erste Adresse hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {address.label || 'Adresse'}
                          </h3>
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Standard
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 space-y-1">
                          <p>{address.street} {address.houseNumber}</p>
                          <p>{address.postalCode} {address.city}</p>
                          {address.company && (
                            <p className="text-sm text-gray-500">{address.company}</p>
                          )}
                          {address.floor && (
                            <p className="text-sm text-gray-500">
                              {address.floor}. Stock
                              {address.doorNumber && `, Tür ${address.doorNumber}`}
                            </p>
                          )}
                          {address.notes && (
                            <p className="text-sm text-gray-500 italic">
                              Notiz: {address.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Hinzugefügt am {new Date(address.createdAt).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex space-x-3">
                      {!address.isDefault && (
                        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          Als Standard setzen
                        </button>
                      )}
                      <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Form Modal would go here */}
        {/* For now, just showing the structure */}
      </div>
    </div>
  );
}
