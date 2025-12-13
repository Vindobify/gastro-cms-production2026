'use client'

import React, { useState } from 'react'

export default function DatenauskunftForm() {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    restaurant: '',
    anfrageart: 'Auskunft',
    nachricht: '',
    agb: false,
    datenschutz: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/datenauskunft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          vorname: '',
          nachname: '',
          email: '',
          telefon: '',
          restaurant: '',
          anfrageart: 'Auskunft',
          nachricht: '',
          agb: false,
          datenschutz: false
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Fehler beim Senden der Anfrage:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          DSGVO-Datenauskunft Anfrage
        </h2>
        
        <p className="text-gray-600 mb-6">
          Als Betroffener haben Sie das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu erhalten. 
          Nutzen Sie dieses Formular für Ihre DSGVO-Anfrage.
        </p>

        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Anfrage erfolgreich gesendet!</strong><br />
            Wir werden Ihre Anfrage innerhalb von 30 Tagen bearbeiten und uns bei Ihnen melden.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Fehler beim Senden der Anfrage.</strong><br />
            Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 mb-2">
                Vorname *
              </label>
              <input
                type="text"
                id="vorname"
                name="vorname"
                value={formData.vorname}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 mb-2">
                Nachname *
              </label>
              <input
                type="text"
                id="nachname"
                name="nachname"
                value={formData.nachname}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
                Telefonnummer
              </label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant/Betrieb (falls zutreffend)
            </label>
            <input
              type="text"
              id="restaurant"
              name="restaurant"
              value={formData.restaurant}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="anfrageart" className="block text-sm font-medium text-gray-700 mb-2">
              Art der Anfrage *
            </label>
            <select
              id="anfrageart"
              name="anfrageart"
              value={formData.anfrageart}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Auskunft">Auskunft über verarbeitete Daten</option>
              <option value="Berichtigung">Berichtigung unrichtiger Daten</option>
              <option value="Löschung">Löschung der Daten</option>
              <option value="Einschränkung">Einschränkung der Verarbeitung</option>
              <option value="Widerspruch">Widerspruch gegen die Verarbeitung</option>
              <option value="Datenübertragbarkeit">Datenübertragbarkeit</option>
            </select>
          </div>

          <div>
            <label htmlFor="nachricht" className="block text-sm font-medium text-gray-700 mb-2">
              Zusätzliche Informationen
            </label>
            <textarea
              id="nachricht"
              name="nachricht"
              value={formData.nachricht}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Beschreiben Sie Ihre Anfrage genauer..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agb"
                name="agb"
                checked={formData.agb}
                onChange={handleInputChange}
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agb" className="ml-2 text-sm text-gray-700">
                Ich habe die <a href="/agb" target="_blank" className="text-blue-600 hover:underline">AGB</a> gelesen und akzeptiert *
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="datenschutz"
                name="datenschutz"
                checked={formData.datenschutz}
                onChange={handleInputChange}
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="datenschutz" className="ml-2 text-sm text-gray-700">
                Ich habe die <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline">Datenschutzerklärung</a> gelesen und akzeptiert *
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Wichtige Hinweise:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Ihre Anfrage wird innerhalb von 30 Tagen bearbeitet</li>
            <li>• Zur Identifikation kann ein Ausweisdokument erforderlich sein</li>
            <li>• Bei Datenlöschung prüfen wir, ob Aufbewahrungspflichten bestehen</li>
            <li>• Die Antwort erfolgt an die angegebene E-Mail-Adresse</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
