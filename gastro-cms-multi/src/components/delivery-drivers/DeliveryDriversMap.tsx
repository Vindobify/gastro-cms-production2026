'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamischer Import von Leaflet-Komponenten (Client-side only)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Lade Karte...</div>
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

interface DeliveryDriver {
  id: number;
  firstName: string;
  lastName: string;
  isAvailable: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  lastLocationUpdate: string;
  assignedOrdersCount: number;
  assignedOrders: any[];
}

export default function DeliveryDriversMap() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Leaflet Icon-Problem beheben
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamisch Leaflet importieren
      import('leaflet').then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        // @ts-ignore
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }).catch(error => {
        console.error('Fehler beim Laden von Leaflet:', error);
      });
    }
  }, []);

  useEffect(() => {
    // Initiale Daten laden
    fetchDrivers();

    // SSE-Verbindung für Live-Updates
    const eventSource = new EventSource('/api/delivery-drivers/live');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INITIAL_DATA') {
          setDrivers(data.data);
          setLoading(false);
        } else if (data.type === 'UPDATE') {
          setDrivers(prevDrivers => 
            prevDrivers.map(driver => {
              const update = data.data.find((d: any) => d.id === driver.id);
              if (update) {
                return { ...driver, ...update };
              }
              return driver;
            })
          );
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/delivery-drivers?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        console.log('Geladene Lieferanten:', data);
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching delivery drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Wien als Standard-Zentrum
  const defaultCenter: [number, number] = [48.2082, 16.3738];
  
  // Filtere nur Lieferanten mit GPS-Standort
  const driversWithLocation = drivers.filter(driver => driver.currentLocation);
  
  // Für Test-Zwecke: Füge einen Test-Lieferanten hinzu, falls keiner vorhanden ist
  const testDrivers = driversWithLocation.length === 0 ? [
    {
      id: 999,
      firstName: 'Test',
      lastName: 'Lieferant',
      isAvailable: true,
      currentLocation: { latitude: 48.2082, longitude: 16.3738 }, // Wien Zentrum
      lastLocationUpdate: new Date().toISOString(),
      assignedOrdersCount: 0,
      assignedOrders: []
    }
  ] : driversWithLocation;

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Lieferanten-Karte...</p>
        </div>
      </div>
    );
  }

  if (driversWithLocation.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine GPS-Standorte verfügbar
          </h3>
          <p className="text-gray-600">
            Aktuell sind keine Lieferanten mit aktiviertem GPS verfügbar.
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> {drivers.length} Lieferanten geladen, aber keine mit GPS-Standort
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Verfügbare Daten: {JSON.stringify(drivers.map(d => ({ 
                name: `${d.firstName} ${d.lastName}`, 
                hasLocation: !!d.currentLocation,
                location: d.currentLocation 
              })))}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200 relative">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenReady={() => setMapLoaded(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {testDrivers.map((driver) => {
          const position: [number, number] = [
            driver.currentLocation!.latitude,
            driver.currentLocation!.longitude
          ];
          
          console.log(`Lieferant ${driver.firstName} ${driver.lastName}:`, {
            latitude: driver.currentLocation!.latitude,
            longitude: driver.currentLocation!.longitude,
            position: position
          });

          return (
            <div key={driver.id}>
              {/* Lieferanten-Marker */}
              <Marker position={position}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2">
                      {driver.firstName} {driver.lastName}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        driver.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                      </div>
                      <div className="text-gray-600">
                        Bestellungen: {driver.assignedOrdersCount}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Letzte Aktualisierung: {new Date(driver.lastLocationUpdate).toLocaleTimeString('de-DE')}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Verfügbarkeits-Kreis */}
              <Circle
                center={position}
                radius={1000} // 1km Radius
                pathOptions={{
                  color: driver.isAvailable ? '#10b981' : '#ef4444',
                  fillColor: driver.isAvailable ? '#10b981' : '#ef4444',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            </div>
          );
        })}
      </MapContainer>
      
      {/* Legende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="text-sm font-medium text-gray-900 mb-2">Legende</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Verfügbar</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Nicht verfügbar</span>
          </div>
          <div className="text-gray-500">
            Kreis = 1km Radius
          </div>
        </div>
      </div>
    </div>
  );
}
