'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DeliveryDriver {
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
  assignedOrdersCount: number;
}

export default function LieferantenPage() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/delivery-drivers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      } else {
        console.error('Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (driverId: number, file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('driverId', driverId.toString());

      const response = await fetch('/api/delivery-drivers/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update driver in list
        setDrivers(prev => prev.map(driver => 
          driver.id === driverId 
            ? { ...driver, avatar: data.avatarUrl }
            : driver
        ));
      } else {
        alert('Fehler beim Hochladen des Bildes');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDriverStatus = async (driverId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/delivery-drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        setDrivers(prev => prev.map(driver => 
          driver.id === driverId 
            ? { ...driver, isActive: !isActive }
            : driver
        ));
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lieferanten" subtitle="Verwalten Sie Ihre Lieferanten">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Lieferanten...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Lieferanten" subtitle="Verwalten Sie Ihre Lieferanten">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Alle Lieferanten ({drivers.length})
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Neuer Lieferant
            </button>
          </div>

          {drivers.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Lieferanten</h3>
              <p className="mt-1 text-sm text-gray-500">
                Fügen Sie Ihren ersten Lieferanten hinzu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      {driver.avatar ? (
                        <img
                          src={driver.avatar}
                          alt={`${driver.firstName} ${driver.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 bg-brand-600 text-white rounded-full p-1 cursor-pointer hover:bg-brand-700 transition-colors">
                        <PhotoIcon className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(driver.id, file);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {driver.firstName} {driver.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                      <div className="flex items-center mt-2">
                        {driver.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inaktiv
                          </span>
                        )}
                        {driver.isAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verfügbar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Telefon:</span> {driver.phone}</p>
                    <p><span className="font-medium">Aktive Bestellungen:</span> {driver.assignedOrdersCount}</p>
                    <p><span className="font-medium">GPS:</span> {driver.gpsEnabled ? 'Aktiviert' : 'Deaktiviert'}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDriverStatus(driver.id, driver.isActive)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                        driver.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {driver.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDriver(driver);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
