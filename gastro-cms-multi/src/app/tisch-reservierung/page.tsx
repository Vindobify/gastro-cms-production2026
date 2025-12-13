'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { CalendarIcon, ClockIcon, UserGroupIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function TischReservierungPage() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Reservierung erfolgreich!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vielen Dank für Ihre Tischreservierung. Wir haben Ihre Anfrage erhalten und werden Sie in Kürze kontaktieren, um die Reservierung zu bestätigen.
            </p>
            <div className="bg-white rounded-lg shadow-card p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ihre Reservierungsdetails</h2>
              <div className="space-y-2 text-left">
                <p><strong>Datum:</strong> {new Date(formData.date).toLocaleDateString('de-DE')}</p>
                <p><strong>Uhrzeit:</strong> {formData.time}</p>
                <p><strong>Personen:</strong> {formData.guests}</p>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>E-Mail:</strong> {formData.email}</p>
                <p><strong>Telefon:</strong> {formData.phone}</p>
                {formData.notes && <p><strong>Anmerkungen:</strong> {formData.notes}</p>}
              </div>
            </div>
            <Link
              href="/speisekarte"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
            >
              Zur Speisekarte
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Tisch reservieren
          </h1>
          <p className="text-lg text-gray-600">
            Reservieren Sie Ihren Tisch für ein unvergessliches kulinarisches Erlebnis
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datum und Zeit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Datum
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-2" />
                  Uhrzeit
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Uhrzeit wählen</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Personenanzahl */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-2" />
                Anzahl Personen
              </label>
              <select
                id="guests"
                name="guests"
                required
                value={formData.guests}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Person' : 'Personen'}
                  </option>
                ))}
              </select>
            </div>

            {/* Kontaktdaten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Ihr vollständiger Name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Telefon *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="+43 123 456 789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                E-Mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="ihre@email.com"
              />
            </div>

            {/* Anmerkungen */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Besondere Wünsche oder Anmerkungen
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="Allergien, besondere Anlässe, Tischpräferenzen..."
              />
            </div>

            {/* Hinweise */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Wichtige Hinweise:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Reservierungen sind bis zu 30 Tage im Voraus möglich</li>
                <li>• Wir bestätigen Ihre Reservierung telefonisch oder per E-Mail</li>
                <li>• Bei Verspätung über 15 Minuten kann der Tisch weitergegeben werden</li>
                <li>• Für Gruppen ab 8 Personen kontaktieren Sie uns bitte direkt</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                'Tisch reservieren'
              )}
            </button>
          </form>
        </div>

        {/* Kontakt Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Fragen zur Reservierung?{' '}
            <Link href="/kontakt" className="text-brand-600 hover:text-brand-700 font-medium">
              Kontaktieren Sie uns
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
