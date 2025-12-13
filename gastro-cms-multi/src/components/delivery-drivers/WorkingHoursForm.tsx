'use client';

import { useState, useEffect } from 'react';
import { useApiErrorHandler } from '@/lib/errorHandler';
import { ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

const DAYS = [
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
  { value: 0, label: 'Sonntag' }
];

export default function WorkingHoursForm() {
  const { fetchWithErrorHandling } = useApiErrorHandler();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Arbeitszeiten laden
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const data = await fetchWithErrorHandling('/api/delivery-drivers/working-hours');
        
        if (data.success) {
          const hours = data.data.workingHours || [];
          setIsAvailable(data.data.isAvailable);
          
          // Standard-Arbeitszeiten erstellen falls keine vorhanden
          if (hours.length === 0) {
            const defaultHours = DAYS.map(day => ({
              dayOfWeek: day.value,
              startTime: '09:00',
              endTime: '18:00',
              isWorking: day.value >= 1 && day.value <= 5 // Mo-Fr standardmäßig aktiv
            }));
            setWorkingHours(defaultHours);
          } else {
            setWorkingHours(hours);
          }
        }
      } catch (error) {
        console.error('Error fetching working hours:', error);
        setMessage({ type: 'error', text: 'Fehler beim Laden der Arbeitszeiten' });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [fetchWithErrorHandling]);

  // Arbeitszeiten speichern
  const saveWorkingHours = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const data = await fetchWithErrorHandling('/api/delivery-drivers/working-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workingHours,
          isAvailable
        })
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Arbeitszeiten erfolgreich gespeichert!' });
        // Aktualisiere den lokalen State mit den gespeicherten Daten
        setIsAvailable(data.data.isAvailable);
      }
    } catch (error) {
      console.error('Error saving working hours:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Arbeitszeiten' });
    } finally {
      setSaving(false);
    }
  };

  // Arbeitszeit für einen Tag aktualisieren
  const updateDay = (dayOfWeek: number, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  // Alle Arbeitszeiten zurücksetzen
  const resetToDefault = () => {
    const defaultHours = DAYS.map(day => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '18:00',
      isWorking: day.value >= 1 && day.value <= 5
    }));
    setWorkingHours(defaultHours);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Arbeitszeiten</h3>
              <p className="text-sm text-gray-600">Verwalte deine Verfügbarkeit</p>
            </div>
          </div>
          
          {/* Verfügbarkeits-Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Verfügbar:</span>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <XMarkIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Arbeitszeiten Tabelle */}
        <div className="space-y-3">
          {DAYS.map(day => {
            const dayHours = workingHours.find(h => h.dayOfWeek === day.value);
            if (!dayHours) return null;

            return (
              <div key={day.value} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                {/* Tag */}
                <div className="w-20 text-sm font-medium text-gray-700">
                  {day.label}
                </div>

                {/* Aktiv/Inaktiv Toggle */}
                <button
                  onClick={() => updateDay(day.value, 'isWorking', !dayHours.isWorking)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    dayHours.isWorking ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      dayHours.isWorking ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>

                {/* Startzeit */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Von
                  </label>
                  <input
                    type="time"
                    value={dayHours.startTime}
                    onChange={(e) => updateDay(day.value, 'startTime', e.target.value)}
                    disabled={!dayHours.isWorking}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Endzeit */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bis
                  </label>
                  <input
                    type="time"
                    value={dayHours.endTime}
                    onChange={(e) => updateDay(day.value, 'endTime', e.target.value)}
                    disabled={!dayHours.isWorking}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Status */}
                <div className="w-16 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    dayHours.isWorking 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {dayHours.isWorking ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zurücksetzen
          </button>
          
          <button
            onClick={saveWorkingHours}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Speichere...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
