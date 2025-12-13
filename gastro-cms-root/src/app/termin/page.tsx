'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TerminPage() {
  const [terminart, setTerminart] = useState('online')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        business_type: formData.get('business_type') as string,
        restaurant_name: formData.get('restaurant_name') as string,
        vorname: formData.get('vorname') as string,
        nachname: formData.get('nachname') as string,
        adresse: formData.get('adresse') as string,
        postleitzahl: formData.get('postleitzahl') as string,
        ort: formData.get('ort') as string,
        telefon: formData.get('telefon') as string,
        email: formData.get('email') as string,
        terminart: terminart as 'online' | 'lokal',
        datum: formData.get('datum') as string,
        uhrzeit: formData.get('uhrzeit') as string,
        agb: formData.get('agb') === 'on',
        datenschutz: formData.get('datenschutz') === 'on'
      }

      const response = await fetch('/api/termin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Formular sicher zurücksetzen
        const form = e.currentTarget
        if (form) {
          form.reset()
        }
        setTerminart('online')
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Fehler beim Senden der Terminanfrage:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Termin vereinbaren
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Persönliche Beratung für Ihr Gastro CMS
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Online oder im Lokal</h2>
                  <p className="text-lg text-blue-100 mb-6">
                    Wählen Sie zwischen einem Online-Termin oder einem persönlichen Treffen in Ihrem Restaurant.
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">✓</span>
                      <span>Online-Beratung per Video-Call</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">✓</span>
                      <span>Persönliche Beratung vor Ort</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">✓</span>
                      <span>Individuelle Lösungen</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">✓</span>
                      <span>Kostenlose Erstberatung</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Verfügbare Regionen</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">📍</span>
                      <div>
                        <h4 className="font-bold">Wien</h4>
                        <p className="text-sm text-blue-100">Persönliche Termine möglich</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">📍</span>
                      <div>
                        <h4 className="font-bold">Wien Umgebung</h4>
                        <p className="text-sm text-blue-100">Persönliche Termine möglich</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">📍</span>
                      <div>
                        <h4 className="font-bold">Niederösterreich</h4>
                        <p className="text-sm text-blue-100">Persönliche Termine möglich</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-3">🌐</span>
                      <div>
                        <h4 className="font-bold">Online</h4>
                        <p className="text-sm text-blue-100">Überall in Österreich</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Termin Formular */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Termin anfragen
            </h2>
            <p className="text-xl text-gray-600">
              Füllen Sie das Formular aus und wir melden uns bei Ihnen
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Status-Meldungen */}
            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-green-400 text-xl">✅</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Terminanfrage erfolgreich gesendet!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      Sie erhalten eine Bestätigungsmail. Wir melden uns bald bei Ihnen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">❌</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Fehler beim Senden
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Terminart Auswahl */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Terminart auswählen *
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="terminart"
                      value="online"
                      checked={terminart === 'online'}
                      onChange={(e) => setTerminart(e.target.value)}
                      className="sr-only peer"
                    />
                    <div className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      terminart === 'online' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl mb-3">💻</div>
                        <h3 className="text-lg font-bold text-gray-900">Online</h3>
                        <p className="text-sm text-gray-600">Video-Call Beratung</p>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input
                      type="radio"
                      name="terminart"
                      value="lokal"
                      checked={terminart === 'lokal'}
                      onChange={(e) => setTerminart(e.target.value)}
                      className="sr-only peer"
                    />
                    <div className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      terminart === 'lokal' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl mb-3">🏪</div>
                        <h3 className="text-lg font-bold text-gray-900">Im Lokal</h3>
                        <p className="text-sm text-gray-600">Persönliche Beratung vor Ort</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Geschäftstyp */}
              <div>
                <label htmlFor="business_type" className="block text-sm font-semibold text-gray-900 mb-2">
                  Geschäftstyp *
                </label>
                <select
                  id="business_type"
                  name="business_type"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="lebensmittelhandel">Lebensmittelhandel</option>
                  <option value="obsthandel">Obsthandel</option>
                  <option value="baeckerei">Bäckerei</option>
                  <option value="fleischerei">Fleischerei</option>
                  <option value="cafe">Café</option>
                  <option value="imbiss">Imbiss</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </div>

              {/* Geschäftsname */}
              <div>
                <label htmlFor="restaurant_name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Name des Geschäfts *
                </label>
                <input
                  type="text"
                  id="restaurant_name"
                  name="restaurant_name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name Ihres Geschäfts"
                />
              </div>

              {/* Name */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="vorname" className="block text-sm font-semibold text-gray-900 mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    id="vorname"
                    name="vorname"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ihr Vorname"
                  />
                </div>
                <div>
                  <label htmlFor="nachname" className="block text-sm font-semibold text-gray-900 mb-2">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    id="nachname"
                    name="nachname"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ihr Nachname"
                  />
                </div>
              </div>

              {/* Adresse - nur bei persönlichem Termin */}
              {terminart === 'lokal' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="adresse" className="block text-sm font-semibold text-gray-900 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Straße und Hausnummer"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="postleitzahl" className="block text-sm font-semibold text-gray-900 mb-2">
                        Postleitzahl *
                      </label>
                      <input
                        type="text"
                        id="postleitzahl"
                        name="postleitzahl"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PLZ"
                      />
                    </div>
                    <div>
                      <label htmlFor="ort" className="block text-sm font-semibold text-gray-900 mb-2">
                        Ort *
                      </label>
                      <input
                        type="text"
                        id="ort"
                        name="ort"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ort"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Kontaktdaten */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefon" className="block text-sm font-semibold text-gray-900 mb-2">
                    Telefonnummer *
                  </label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+43 660 123 456"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    E-Mail Adresse *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ihre@email.at"
                  />
                </div>
              </div>

              {/* Datum und Uhrzeit */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Gewünschter Termin
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="datum" className="block text-sm font-semibold text-gray-900 mb-2">
                      Datum *
                    </label>
                    <input
                      type="date"
                      id="datum"
                      name="datum"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="uhrzeit" className="block text-sm font-semibold text-gray-900 mb-2">
                      Uhrzeit *
                    </label>
                    <select
                      id="uhrzeit"
                      name="uhrzeit"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Uhrzeit wählen</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agb"
                    name="agb"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agb" className="ml-3 text-sm text-gray-700">
                    Ich habe die <a href="/agb" className="text-blue-600 hover:text-blue-800 underline">Allgemeinen Geschäftsbedingungen</a> gelesen und akzeptiert. *
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="datenschutz"
                    name="datenschutz"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="datenschutz" className="ml-3 text-sm text-gray-700">
                    Ich habe die <a href="/datenschutz" className="text-blue-600 hover:text-blue-800 underline">Datenschutzerklärung</a> gelesen und akzeptiert. *
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Termin anfragen'}
                </button>
              </div>
            </form>
          </div>

          {/* Wichtiger Hinweis */}
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800">
                  Wichtiger Hinweis
                </h3>
                <p className="mt-2 text-yellow-700">
                  Der Termin muss von uns erst geprüft werden. Wir melden uns dann telefonisch oder per E-Mail bei Ihnen, um den Termin zu bestätigen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
