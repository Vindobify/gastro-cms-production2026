'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
  currentLocation: any;
  lastLocationUpdate: string;
  assignedOrdersCount: number;
  assignedOrders: any[];
}

export default function DeliveryDriversTable() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery-drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching delivery drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: number) => {
    if (!confirm('Möchtest du diesen Lieferanten wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delivery-drivers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrivers(drivers.filter(driver => driver.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Löschen des Lieferanten');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Fehler beim Löschen des Lieferanten');
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/delivery-drivers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !currentStatus
        }),
      });

      if (response.ok) {
        setDrivers(drivers.map(driver => 
          driver.id === id ? { ...driver, isAvailable: !currentStatus } : driver
        ));
      }
    } catch (error) {
      console.error('Error updating driver availability:', error);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours || !Array.isArray(workingHours)) return 'Nicht gesetzt';
    
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date().getDay();
    
    const todaySchedule = workingHours.find((day: any) => day.dayOfWeek === today);
    if (todaySchedule) {
      return `${todaySchedule.startTime} - ${todaySchedule.endTime}`;
    }
    
    return 'Nicht verfügbar';
  };

  const getStatusColor = (isAvailable: boolean, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (isAvailable) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isAvailable: boolean, isActive: boolean) => {
    if (!isActive) return 'Inaktiv';
    if (isAvailable) return 'Verfügbar';
    return 'Nicht verfügbar';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Lieferanten durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieferant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontakt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arbeitszeiten
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GPS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bestellungen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {driver.avatar ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={driver.avatar} 
                          alt={`${driver.firstName} ${driver.lastName}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-600 font-medium text-sm">
                            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {driver.firstName} {driver.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.phone || 'Keine Telefonnummer'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.isAvailable, driver.isActive)}`}>
                    {getStatusText(driver.isAvailable, driver.isActive)}
                  </span>
                  <button
                    onClick={() => toggleAvailability(driver.id, driver.isAvailable)}
                    className="ml-2 text-xs text-brand-600 hover:text-brand-900"
                  >
                    {driver.isAvailable ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatWorkingHours(driver.workingHours)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.gpsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.gpsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                    </span>
                    {driver.currentLocation && (
                      <MapPinIcon className="ml-2 h-4 w-4 text-brand-500" title="Standort verfügbar" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-brand-600">
                      {driver.assignedOrdersCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      Aktive Bestellungen
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/delivery-drivers/${driver.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Details anzeigen"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/delivery-drivers/edit/${driver.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Bearbeiten"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteDriver(driver.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Löschen"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'Keine Lieferanten gefunden.' : 'Keine Lieferanten vorhanden.'}
          </p>
        </div>
      )}
    </div>
  );
}
