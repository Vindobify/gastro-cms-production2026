'use client'

import React, { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    acceptTerms: false,
    acceptPrivacy: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      alert('Bitte akzeptieren Sie die AGB und Datenschutzerklärung.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Nachricht erfolgreich gesendet! Wir melden uns schnellstmöglich bei dir.')
        setFormData({ name: '', email: '', phone: '', message: '', acceptTerms: false, acceptPrivacy: false })
      } else {
        throw new Error('Fehler beim Senden der Nachricht')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Senden der Nachricht. Bitte versuche es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
            📞 Kontakt
          </h2>
          <p className="text-xl text-gray-600">
            Hast du Fragen? Wir helfen gerne weiter!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl card-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Kontaktdaten</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">E-Mail</h4>
                    <p className="text-gray-600">office@gastro-cms.at</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Telefon</h4>
                    <p className="text-gray-600">+43 660 546 78 06</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Adresse</h4>
                    <p className="text-gray-600">
                      NextPuls Digital<br />
                      Markt 141<br />
                      2572 Kaumberg, Österreich
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Öffnungszeiten</h4>
                    <p className="text-gray-600">
                      Mo-Fr: 9:00 - 16:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-brand text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Warum Gastro CMS 3.0?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span>✅</span>
                  <span>Nur 10% statt 30% Provision</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✅</span>
                  <span>Eigene Domain und Apps</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✅</span>
                  <span>Vollständige Kontrolle</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✅</span>
                  <span>Österreichischer Support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✅</span>
                  <span>Keine Mindestvertragslaufzeit</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl card-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Dein Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="deine@email.at"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="+43 660 123456"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Deine Nachricht an uns..."
                />
              </div>

              {/* AGB und Datenschutz Checkboxen */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    Ich akzeptiere die <a href="/agb" target="_blank" className="text-blue-600 hover:underline">Allgemeinen Geschäftsbedingungen</a> *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptPrivacy"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptPrivacy" className="text-sm text-gray-700">
                    Ich akzeptiere die <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline">Datenschutzerklärung</a> *
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-brand text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 hover-lift disabled:opacity-50"
              >
                {isSubmitting ? 'Sende...' : '📤 Nachricht senden'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
