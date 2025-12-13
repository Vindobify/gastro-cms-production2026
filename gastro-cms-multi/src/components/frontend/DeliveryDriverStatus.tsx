'use client';

import { useState, useEffect } from 'react';
import { 
  TruckIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DeliveryDriver {
  id: number;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  profile?: {
    avatar?: string;
  };
}

interface DeliveryDriverStatusProps {
  driver?: DeliveryDriver;
  status: string;
  deliveryTime?: string | null;
}

export default function DeliveryDriverStatus({ driver, status, deliveryTime }: DeliveryDriverStatusProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!driver) return;

    // Animation basierend auf Status
    const getAnimationPhase = () => {
      switch (status) {
        case 'CONFIRMED': return 1;
        case 'PREPARING': return 2;
        case 'READY': return 3;
        case 'OUT_FOR_DELIVERY': return 4;
        case 'DELIVERED': return 5;
        default: return 0;
      }
    };

    setAnimationPhase(getAnimationPhase());
  }, [status, driver]);

  if (!driver) return null;

  const getStatusMessage = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'Ihr Lieferant wurde benachrichtigt';
      case 'PREPARING':
        return 'Ihr Lieferant bereitet sich vor';
      case 'READY':
        return 'Ihr Lieferant holt die Bestellung ab';
      case 'OUT_FOR_DELIVERY':
        return 'Ihr Lieferant ist unterwegs zu Ihnen!';
      case 'DELIVERED':
        return 'Bestellung wurde geliefert!';
      default:
        return 'Lieferant zugewiesen';
    }
  };

  const getProgressPercentage = () => {
    switch (status) {
      case 'CONFIRMED': return 20;
      case 'PREPARING': return 40;
      case 'READY': return 60;
      case 'OUT_FOR_DELIVERY': return 80;
      case 'DELIVERED': return 100;
      default: return 0;
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TruckIcon className="w-6 h-6 mr-2 text-green-600" />
          Ihr Lieferant
        </h3>
        {status === 'DELIVERED' && (
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
        )}
      </div>

      {/* Lieferant Info */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {driver.profile?.avatar ? (
            <img
              src={driver.profile.avatar}
              alt={`${driver.user.profile.firstName}`}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center border-4 border-white shadow-lg">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          )}
          
          {/* Pulsing Animation für aktive Status */}
          {(status === 'OUT_FOR_DELIVERY' || status === 'PREPARING') && (
            <div className="absolute -inset-1 rounded-full bg-green-400 opacity-30 animate-ping"></div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-900">
            {driver.user.profile.firstName}
          </h4>
          <p className="text-green-600 font-medium">
            {getStatusMessage()}
          </p>
          {deliveryTime && (
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <ClockIcon className="w-4 h-4 mr-1" />
              Voraussichtlich: {new Date(deliveryTime).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              })} Uhr
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Bestätigt</span>
          <span>Vorbereitung</span>
          <span>Abholung</span>
          <span>Unterwegs</span>
          <span>Geliefert</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${getProgressPercentage()}%` }}
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Animated Truck */}
      <div className="relative h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-4">
        {/* Road markings */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-50 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2">
          <div className="flex space-x-4 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-4 h-px bg-white opacity-60"></div>
            ))}
          </div>
        </div>

        {/* Animated Truck */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-out"
          style={{ 
            left: `${Math.min(getProgressPercentage() - 5, 85)}%`,
            transform: 'translateY(-50%) translateX(-50%)'
          }}
        >
          <TruckIcon className={`w-8 h-8 ${
            status === 'OUT_FOR_DELIVERY' 
              ? 'text-green-600 animate-bounce' 
              : status === 'DELIVERED'
              ? 'text-green-700'
              : 'text-gray-500'
          }`} />
        </div>

        {/* Destination */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Status-spezifische Nachrichten */}
      {status === 'OUT_FOR_DELIVERY' && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-green-800">
              Live-Tracking: Ihr Lieferant ist auf dem Weg!
            </span>
          </div>
        </div>
      )}

      {status === 'PREPARING' && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-blue-800">
              Ihr Lieferant bereitet sich auf die Abholung vor
            </span>
          </div>
        </div>
      )}

      {status === 'DELIVERED' && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Bestellung erfolgreich geliefert! Vielen Dank für Ihre Bestellung.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
