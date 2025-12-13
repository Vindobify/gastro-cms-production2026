'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

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
  workingHours: WorkingHours[];
  currentLocation: any;
  lastLocationUpdate: string;
  profile?: {
    avatar?: string;
  };
}

interface DeliveryDriverEditFormProps {
  id: number;
}

export default function DeliveryDriverEditForm({ id }: DeliveryDriverEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
    isAvailable: true,
    gpsEnabled: false,
    workingHours: [] as WorkingHours[]
  });
  const [saving, setSaving] = useState(false);
  const [workingHours, setWorkingHours] = useState({
    monday: { enabled: false, start: '09:00', end: '17:00' },
    tuesday: { enabled: false, start: '09:00', end: '17:00' },
    wednesday: { enabled: false, start: '09:00', end: '17:00' },
    thursday: { enabled: false, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' }
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const days = [
    { value: 0, label: 'Sonntag' },
    { value: 1, label: 'Montag' },
    { value: 2, label: 'Dienstag' },
    { value: 3, label: 'Mittwoch' },
    { value: 4, label: 'Donnerstag' },
    { value: 5, label: 'Freitag' },
    { value: 6, label: 'Samstag' }
  ];

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      const response = await fetch(`/api/delivery-drivers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDriver(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          gpsEnabled: data.gpsEnabled || false,
          isActive: data.isActive,
          isAvailable: data.isAvailable,
          workingHours: data.workingHours || []
        });
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei ist zu groß (max 5MB)');
      return;
    }

    // Validiere Dateityp
    if (!file.type.startsWith('image/')) {
      alert('Nur Bilddateien sind erlaubt');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('driverId', id.toString());

      const response = await fetch('/api/delivery-drivers/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
        alert('Bild erfolgreich hochgeladen!');
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
    
    if (formData.workingHours.length === 0) {
      alert('Bitte wähle mindestens einen Arbeitstag aus');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/delivery-drivers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          workingHours: formData.workingHours,
          gpsEnabled: formData.gpsEnabled,
          isActive: formData.isActive,
          isAvailable: formData.isAvailable
        }),
      });

      if (response.ok) {
        alert('Lieferant erfolgreich aktualisiert!');
        router.push('/dashboard/delivery-drivers');
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Aktualisieren des Lieferanten');
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Fehler beim Aktualisieren des Lieferanten');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Lieferant nicht gefunden.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Persönliche Informationen */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Persönliche Informationen</h3>
        
        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profilbild
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {avatarUrl || driver?.profile?.avatar ? (
                <img
                  src={avatarUrl || driver?.profile?.avatar}
                  alt={`${formData.firstName} ${formData.lastName}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 cursor-pointer transition-colors">
                <PhotoIcon className="w-4 h-4 mr-2" />
                {avatarUrl || driver?.profile?.avatar ? 'Bild ändern' : 'Bild hochladen'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG oder GIF. Max. 5MB.
              </p>
            </div>
          </div>
        </div>
        
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
              E-Mail-Adresse
            </label>
            <input
              type="email"
              id="email"
              value={driver.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
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

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Lieferant ist aktiv
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
              Lieferant ist verfügbar
            </label>
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
        
        {driver.currentLocation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Aktueller Standort:</strong> {driver.currentLocation.latitude.toFixed(6)}, {driver.currentLocation.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Letzte Aktualisierung: {new Date(driver.lastLocationUpdate).toLocaleString('de-DE')}
            </p>
          </div>
        )}
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
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>
      </div>
    </form>
  );
}
