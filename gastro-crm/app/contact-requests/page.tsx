'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/contact-requests'
        : `/api/contact-requests?status=${statusFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/contact-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (response.ok) {
        fetchRequests();
        if (selectedRequest?.id === id) {
          setSelectedRequest({ ...selectedRequest, status, notes: notes || selectedRequest.notes });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      NEW: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Kontaktanfragen">
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2">
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
            onClick={() => setStatusFilter('NEW')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'NEW'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Neu
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Bearbeitung
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'RESOLVED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Erledigt
          </button>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Lade Kontaktanfragen...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Keine Kontaktanfragen gefunden</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Cards */}
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer border-2 ${
                    selectedRequest?.id === request.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                      {request.phone && (
                        <p className="text-sm text-gray-500">{request.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(request.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>

            {/* Detail View */}
            {selectedRequest && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefon</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nachricht</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => updateStatus(selectedRequest.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="NEW">Neu</option>
                      <option value="IN_PROGRESS">In Bearbeitung</option>
                      <option value="RESOLVED">Erledigt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notizen</label>
                    <textarea
                      value={selectedRequest.notes || ''}
                      onChange={(e) => {
                        const updated = { ...selectedRequest, notes: e.target.value };
                        setSelectedRequest(updated);
                        updateStatus(selectedRequest.id, selectedRequest.status, e.target.value);
                      }}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Interne Notizen..."
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">
                      Erstellt: {new Date(selectedRequest.createdAt).toLocaleString('de-DE')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Aktualisiert: {new Date(selectedRequest.updatedAt).toLocaleString('de-DE')}
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

