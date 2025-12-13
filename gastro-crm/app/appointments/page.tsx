'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Appointment {
  id: number;
  businessType: string;
  restaurantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentType: string;
  date: string;
  time: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/api/appointments';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (dateFilter) {
        params.append('dateFrom', dateFilter);
        const toDate = new Date(dateFilter);
        toDate.setDate(toDate.getDate() + 1);
        params.append('dateTo', toDate.toISOString().split('T')[0]);
      }
      if (params.toString()) {
        url += '?' + params.toString();
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (response.ok) {
        fetchAppointments();
        if (selectedAppointment?.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status, notes: notes || selectedAppointment.notes });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAppointments();
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(null);
        }
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Termine">
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'PENDING'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ausstehend
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'CONFIRMED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bestätigt
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'COMPLETED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Abgeschlossen
          </button>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm"
            placeholder="Datum filtern"
          />
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Lade Termine...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Keine Termine gefunden</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Cards */}
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer border-2 ${
                    selectedAppointment?.id === appointment.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.firstName} {appointment.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{appointment.restaurantName}</p>
                      <p className="text-sm text-gray-500">{appointment.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(appointment.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Datum:</span>{' '}
                      {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Art:</span> {appointment.appointmentType === 'online' ? 'Online' : 'Lokal'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(appointment.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>

            {/* Detail View */}
            {selectedAppointment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Termindetails</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.firstName} {selectedAppointment.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restaurant</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.restaurantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Datum & Uhrzeit</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedAppointment.date).toLocaleDateString('de-DE')} um {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Art</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.appointmentType === 'online' ? 'Online' : 'Lokal'}
                    </p>
                  </div>
                  {selectedAppointment.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresse</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAppointment.address}, {selectedAppointment.postalCode} {selectedAppointment.city}
                      </p>
                    </div>
                  )}
                  {selectedAppointment.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nachricht</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedAppointment.message}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedAppointment.status}
                      onChange={(e) => updateStatus(selectedAppointment.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="PENDING">Ausstehend</option>
                      <option value="CONFIRMED">Bestätigt</option>
                      <option value="COMPLETED">Abgeschlossen</option>
                      <option value="CANCELLED">Storniert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notizen</label>
                    <textarea
                      value={selectedAppointment.notes || ''}
                      onChange={(e) => {
                        const updated = { ...selectedAppointment, notes: e.target.value };
                        setSelectedAppointment(updated);
                        updateStatus(selectedAppointment.id, selectedAppointment.status, e.target.value);
                      }}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Interne Notizen..."
                    />
                  </div>
                  <button
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Termin löschen
                  </button>
                  <div>
                    <p className="text-xs text-gray-400">
                      Erstellt: {new Date(selectedAppointment.createdAt).toLocaleString('de-DE')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Aktualisiert: {new Date(selectedAppointment.updatedAt).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

