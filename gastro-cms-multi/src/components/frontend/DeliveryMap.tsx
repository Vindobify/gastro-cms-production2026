'use client';

import { MapPinIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DeliveryMapProps {
  restaurantAddress: string;
  customerAddress: string;
  deliveryTime?: string | null;
}

export default function DeliveryMap({ restaurantAddress, customerAddress, deliveryTime }: DeliveryMapProps) {
  // Echte Lieferzeit berechnen
  const calculateDeliveryInfo = () => {
    if (!deliveryTime) {
      return {
        duration: 'Wird festgelegt',
        estimatedTime: 'Restaurant plant gerade',
        isActive: false
      };
    }

    const now = new Date();
    const delivery = new Date(deliveryTime);
    const timeDiff = delivery.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return {
        duration: 'Lieferung fällig',
        estimatedTime: 'Sollte geliefert sein',
        isActive: false
      };
    }

    const totalMinutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let duration;
    if (hours > 0) {
      duration = `${hours}:${minutes.toString().padStart(2, '0')} Std.`;
    } else {
      duration = `${minutes} Min.`;
    }

    return {
      duration,
      estimatedTime: delivery.toLocaleString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' Uhr',
      isActive: true
    };
  };

  const deliveryInfo = calculateDeliveryInfo();
  return (
    <div className="space-y-6">
      {/* Statische Karte */}
      <div className="w-full h-[500px] rounded-xl shadow-xl border border-gray-200 overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 relative">
        {/* Karten-Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPinIcon className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lieferroute</h3>
            
            {/* Route-Visualisierung */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              {/* Restaurant */}
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">🍕</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Restaurant</p>
              </div>
              
              {/* Route-Linie */}
              <div className="flex-1 max-w-32">
                <div className="h-1 bg-gradient-to-r from-red-500 via-brand-500 to-blue-500 rounded-full"></div>
                <div className="h-1 bg-gradient-to-r from-red-500 via-brand-500 to-blue-500 rounded-full mt-1 opacity-60"></div>
                <div className="h-1 bg-gradient-to-r from-red-500 via-brand-500 to-blue-500 rounded-full mt-1 opacity-40"></div>
              </div>
              
              {/* Kunde */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">🏠</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Kunde</p>
              </div>
            </div>
            
            {/* Adressen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Von:</p>
                <p className="text-gray-600">{restaurantAddress}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Nach:</p>
                <p className="text-gray-600">{customerAddress}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Karten-Wasserzeichen */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600">
          📍 OpenStreetMap
        </div>
      </div>
      
      {/* Route-Informationen */}
      <div className="bg-gradient-to-r from-brand-50 via-green-50 to-blue-50 rounded-xl p-8 border border-brand-100 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Entfernung */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-200 transition-colors">
              <MapPinIcon className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Entfernung</h3>
            <p className="text-3xl font-bold text-brand-600">2.5 km</p>
            <p className="text-sm text-gray-500 mt-1">Luftlinie</p>
          </div>

          {/* Lieferzeit */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <ClockIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lieferzeit</h3>
            <p className={`text-3xl font-bold ${deliveryInfo.isActive ? 'text-green-600' : 'text-amber-600'} mb-2`}>
              {deliveryInfo.duration}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {deliveryInfo.isActive ? deliveryInfo.estimatedTime : deliveryInfo.estimatedTime}
            </p>
          </div>

          {/* Route-Status */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <TruckIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Route</h3>
            <p className="text-lg font-semibold text-blue-600">Optimale Route</p>
            <p className="text-sm text-gray-500 mt-1">Verkehrsoptimiert</p>
          </div>
        </div>

        {/* Zusätzliche Informationen */}
        <div className="mt-8 pt-8 border-t border-brand-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Restaurant
              </h4>
              <p className="text-gray-700 font-medium">{restaurantAddress}</p>
              <p className="text-xs text-gray-500 mt-1">
                Koordinaten: 48.2082, 16.3738
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Lieferadresse
              </h4>
              <p className="text-gray-700 font-medium">{customerAddress}</p>
              <p className="text-xs text-gray-500 mt-1">
                Koordinaten: 48.1982, 16.3638
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
