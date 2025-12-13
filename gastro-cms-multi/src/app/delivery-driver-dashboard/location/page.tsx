'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DeliveryDriverLayout from '@/components/delivery-drivers/DeliveryDriverLayout';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamischer Import von Leaflet-Komponenten
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface DriverLocation {
  id: number;
  currentLocation: { latitude: number; longitude: number } | null;
  lastLocationUpdate: string | null;
}

export default function DeliveryDriverLocationPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  // GPS-Standort verfolgen
  useEffect(() => {
    if (location?.currentLocation) {
      startLocationTracking();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [location]);

  const fetchLocation = async () => {
    try {
      const response = await fetch('/api/delivery-drivers/me');
      
      if (response.ok) {
        const data = await response.json();
        setLocation({
          id: data.id,
          currentLocation: data.currentLocation,
          lastLocationUpdate: data.lastLocationUpdate
        });
      } else {
        console.error('Fehler beim Laden des Standorts');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    // Prüfe Berechtigung
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          startLocationUpdates();
        }
      });
    } else {
      // Fallback für ältere Browser
      startLocationUpdates();
    }
  };

  const startLocationUpdates = () => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS Position erhalten:', { latitude, longitude });
        
        if (location) {
          updateDriverLocation(latitude, longitude);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationPermission('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    // Cleanup
    return () => navigator.geolocation.clearWatch(watchId);
  };

  const updateDriverLocation = async (latitude: number, longitude: number) => {
    if (!location) return;

    try {
      const response = await fetch(`/api/delivery-drivers/${location.id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude
        }),
      });

      if (response.ok) {
        console.log('Standort erfolgreich aktualisiert');
        // Aktualisiere den lokalen State
        setLocation(prev => prev ? {
          ...prev,
          currentLocation: { latitude, longitude },
          lastLocationUpdate: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const openNavigation = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <DeliveryDriverLayout title="GPS-Standort" subtitle="Lade Standort...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Standort...</p>
          </div>
        </div>
      </DeliveryDriverLayout>
    );
  }

  if (!location) {
    return (
      <DeliveryDriverLayout title="Fehler" subtitle="Standort nicht gefunden">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Standort nicht gefunden</h2>
          <p className="text-gray-600">Dein Standort konnte nicht geladen werden.</p>
        </div>
      </DeliveryDriverLayout>
    );
  }

  return (
    <DeliveryDriverLayout 
      title="GPS-Standort" 
      subtitle="Verfolge deinen aktuellen Standort"
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Standort-Status */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2 text-green-600" />
              Standort-Status
            </h3>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    locationPermission === 'granted' ? 'bg-green-400' : 
                    locationPermission === 'denied' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">GPS-Berechtigung</p>
                    <p className={`text-xs font-medium ${
                      locationPermission === 'granted' ? 'text-green-600' : 
                      locationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {locationPermission === 'granted' ? 'Erlaubt' : 
                       locationPermission === 'denied' ? 'Verweigert' : 'Angefragt'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Letzte Aktualisierung</p>
                    <p className="text-xs text-gray-600">
                      {location.lastLocationUpdate ? 
                        new Date(location.lastLocationUpdate).toLocaleString('de-DE') : 
                        'Nie'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Karte */}
        {location.currentLocation && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-blue-600" />
                Aktueller Standort
              </h3>
            </div>
            
            <div className="px-4 py-4 sm:px-6">
              <div className="h-80 sm:h-96 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                <MapContainer
                  center={[location.currentLocation.latitude, location.currentLocation.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.currentLocation.latitude, location.currentLocation.longitude]} />
                </MapContainer>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Koordinaten:</span>
                  </p>
                  <p className="text-sm font-mono text-gray-900">
                    {location.currentLocation.latitude.toFixed(6)}, {location.currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
                
                <button
                  onClick={() => openNavigation(location.currentLocation!.latitude, location.currentLocation!.longitude)}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  🗺️ Navigation öffnen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kein Standort verfügbar */}
        {!location.currentLocation && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-8 sm:px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kein Standort verfügbar</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Dein aktueller Standort wurde noch nicht erfasst. Stelle sicher, dass GPS aktiviert ist.
              </p>
              <button
                onClick={startLocationTracking}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                📍 Standort erfassen
              </button>
            </div>
          </div>
        )}
      </div>
    </DeliveryDriverLayout>
  );
}

