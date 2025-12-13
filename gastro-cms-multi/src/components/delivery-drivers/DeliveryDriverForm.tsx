'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function DeliveryDriverForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gpsEnabled: false,
    workingHours: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }, // Sonntag
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Montag
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Dienstag
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Mittwoch
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Donnerstag
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Freitag
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' }, // Samstag
    ] as WorkingHours[]
  });

  const days = [
    { value: 0, label: 'Sonntag' },
    { value: 1, label: 'Montag' },
    { value: 2, label: 'Dienstag' },
    { value: 3, label: 'Mittwoch' },
    { value: 4, label: 'Donnerstag' },
    { value: 5, label: 'Freitag' },
    { value: 6, label: 'Samstag' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (index: number, field: string, value: string) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = {
      ...newWorkingHours[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      workingHours: newWorkingHours
    }));
  };

  const toggleDay = (dayOfWeek: number) => {
    const existingDay = formData.workingHours.find(day => day.dayOfWeek === dayOfWeek);
    if (existingDay) {
      // Tag entfernen
      setFormData(prev => ({
        ...prev,
        workingHours: prev.workingHours.filter(day => day.dayOfWeek !== dayOfWeek)
      }));
    } else {
      // Tag hinzufügen
      setFormData(prev => ({
        ...prev,
        workingHours: [...prev.workingHours, { dayOfWeek, startTime: '09:00', endTime: '17:00' }]
      }));
    }
  };

  const isDayActive = (dayOfWeek: number) => {
    return formData.workingHours.some(day => day.dayOfWeek === dayOfWeek);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwörter stimmen nicht überein');
      return;
    }

    if (formData.workingHours.length === 0) {
      alert('Bitte wähle mindestens einen Arbeitstag aus');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/delivery-drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          workingHours: formData.workingHours,
          gpsEnabled: formData.gpsEnabled
        }),
      });

      if (response.ok) {
        alert('Lieferant erfolgreich erstellt!');
        router.push('/dashboard/delivery-drivers');
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Erstellen des Lieferanten');
      }
    } catch (error) {
      console.error('Error creating delivery driver:', error);
      alert('Fehler beim Erstellen des Lieferanten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Persönliche Informationen */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Persönliche Informationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Vorname *
            </label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nachname *
            </label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail-Adresse *
            </label>
            <input
              type="email"
              id="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefonnummer
            </label>
            <input
              type="tel"
              id="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Zugangsdaten */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zugangsdaten</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort *
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen *
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Arbeitszeiten */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Arbeitszeiten</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {days.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`day-${day.value}`}
                checked={isDayActive(day.value)}
                onChange={() => toggleDay(day.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              />
              <label htmlFor={`day-${day.value}`} className="text-sm font-medium text-gray-700">
                {day.label}
              </label>
            </div>
          ))}
        </div>

        {formData.workingHours.length > 0 && (
          <div className="space-y-3">
            {formData.workingHours.map((day, index) => (
              <div key={day.dayOfWeek} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                  {days.find(d => d.value === day.dayOfWeek)?.label}
                </span>
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <span className="text-gray-500">bis</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPS-Einstellungen */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">GPS-Einstellungen</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="gpsEnabled"
            checked={formData.gpsEnabled}
            onChange={(e) => handleInputChange('gpsEnabled', e.target.checked)}
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
          />
          <label htmlFor="gpsEnabled" className="text-sm font-medium text-gray-700">
            GPS-Koordinaten freigeben
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Ermöglicht die Verfolgung des aktuellen Standorts für optimale Routenplanung
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird erstellt...' : 'Lieferant erstellen'}
        </button>
      </div>
    </form>
  );
}
