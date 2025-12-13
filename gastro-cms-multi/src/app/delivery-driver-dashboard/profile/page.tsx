'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DeliveryDriverLayout from '@/components/delivery-drivers/DeliveryDriverLayout';
import WorkingHoursForm from '@/components/delivery-drivers/WorkingHoursForm';
import { UserIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DriverProfile {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  isAvailable: boolean;
  gpsEnabled: boolean;
  workingHours: any;
  currentLocation: { latitude: number; longitude: number } | null;
}

export default function DeliveryDriverProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/delivery-drivers/me');
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Fehler beim Laden des Profils');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/delivery-drivers/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !profile.isAvailable
        }),
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <DeliveryDriverLayout title="Mein Profil" subtitle="Lade Profil...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Profil...</p>
          </div>
        </div>
      </DeliveryDriverLayout>
    );
  }

  if (!profile) {
    return (
      <DeliveryDriverLayout title="Fehler" subtitle="Profil nicht gefunden">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil nicht gefunden</h2>
          <p className="text-gray-600">Dein Lieferanten-Profil konnte nicht geladen werden.</p>
        </div>
      </DeliveryDriverLayout>
    );
  }

  return (
    <DeliveryDriverLayout 
      title="Mein Profil" 
      subtitle="Verwalte deine Lieferanten-Einstellungen"
    >
      <div className="space-y-6">
        {/* Profil-Übersicht */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {profile.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-brand-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kontaktinformationen */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Kontaktinformationen
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Telefon
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile.phone || 'Nicht angegeben'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Status-Einstellungen */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Status-Einstellungen
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${profile.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verfügbarkeit</p>
                    <p className="text-sm text-gray-500">
                      {profile.isAvailable ? 'Du bist verfügbar für neue Bestellungen' : 'Du bist nicht verfügbar'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    profile.isAvailable
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {profile.isAvailable ? 'Nicht verfügbar' : 'Verfügbar'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">GPS-Tracking</p>
                    <p className="text-sm text-gray-500">
                      {profile.gpsEnabled ? 'GPS-Tracking ist aktiviert' : 'GPS-Tracking ist deaktiviert'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  profile.gpsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.gpsEnabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aktueller Standort */}
        {profile.currentLocation && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Aktueller Standort
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>
                  {profile.currentLocation.latitude.toFixed(4)}, {profile.currentLocation.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Arbeitszeiten */}
        <WorkingHoursForm />
      </div>
    </DeliveryDriverLayout>
  );
}
