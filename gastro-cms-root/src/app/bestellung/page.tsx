'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import OrderCalculator from '@/components/OrderCalculator'
import LegalModal from '@/components/LegalModal'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function Bestellung() {
  const [currentStep, setCurrentStep] = useState(1)
  const [calculatedSavings, setCalculatedSavings] = useState(0)
  const [modalOpen, setModalOpen] = useState<'agb' | 'datenschutz' | 'av' | null>(null)
  
  const [formData, setFormData] = useState({
    // Step 1: Geschäftsinformationen
    business_type: '',
    restaurant_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    
    // Step 2: Lieferservice Informationen
    has_delivery_service: false,
    delivery_service_name: '',
    monthly_revenue: '',
    delivery_percentage: '',
    
    // Step 3: Domain Informationen
    has_domain: false,
    existing_domain: '',
    desired_domain: '',
    
    // Step 4: Rechtliches
    acceptTerms: false,
    acceptPrivacy: false,
    acceptAV: false,
    
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = 'checked' in e.target ? e.target.checked : false
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.business_type && formData.restaurant_name && formData.email)
      case 2:
        return true // Optional
      case 3:
        if (formData.has_domain) {
          return !!formData.existing_domain
        } else {
          return true // desired_domain ist optional
        }
      case 4:
        return formData.acceptTerms && formData.acceptPrivacy && formData.acceptAV
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      alert('Bitte füllen Sie alle Pflichtfelder aus.')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4)) {
      alert('Bitte akzeptieren Sie alle rechtlichen Bedingungen.')
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/bestellung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          calculatedSavings,
          paymentAmount: formData.has_domain ? 0 : 30.00, // Kostenlos wenn Domain, sonst €30
        })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Bestellung')
      }

      const data = await response.json()
      
      // Wenn Domain vorhanden: Direkt abschließen (kostenlos)
      // Wenn keine Domain: Stripe Checkout €30,00
      if (data.url) {
        window.location.href = data.url
      } else {
        // Keine URL = kostenlos, direkt Erfolg
        setSubmitStatus('success')
        setIsSubmitting(false)
      }

    } catch (error) {
      console.error('Error submitting order:', error)
      setSubmitStatus('error')
      setIsSubmitting(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getPaymentAmount = () => {
    return formData.has_domain ? 0 : 30.00
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-6">
            🚀 Gastro CMS 3.0 bestellen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fülle das Formular aus und starte deine digitale Revolution!
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    {step === 1 && 'Geschäft'}
                    {step === 2 && 'Lieferservice'}
                    {step === 3 && 'Domain'}
                    {step === 4 && 'Bezahlung'}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-16 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Aktionsbox */}
        {currentStep >= 3 && (
          <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">🎉 MEGA AKTION</h2>
            <p className="text-lg">
              {formData.has_domain ? (
                <>Bestellung <strong>KOSTENLOS</strong> wenn Sie bereits eine Domain haben!</>
              ) : (
                <>Nur <strong>€30,00</strong> für Domain-Kosten (einmalig)!</>
              )}
            </p>
            <p className="text-sm mt-2 opacity-90">
              {formData.has_domain
                ? 'Sie haben bereits eine Domain – Ihre Bestellung ist komplett kostenlos!'
                : 'Wenn Sie keine Domain haben, fallen einmalig €30,00 Domain-Kosten an.'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Bestellung erfolgreich!</h3>
                  <p className="text-green-700">
                    Vielen Dank für deine Bestellung. Wir melden uns innerhalb von 24 Stunden bei dir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Fehler beim Senden</h3>
                  <p className="text-red-700">
                    Es gab einen Fehler beim Senden deiner Bestellung. Bitte versuche es erneut.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Geschäftsinformationen */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Geschäftsinformationen</h2>
                
                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Geschäftstyp *
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="restaurant_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name des Geschäfts *
                    </label>
                    <input
                      type="text"
                      id="restaurant_name"
                      name="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="z.B. Pizzeria Bella Vista"
                    />
                  </div>

                  <div>
                    <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Inhaber Name
                    </label>
                    <input
                      type="text"
                      id="owner_name"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="z.B. Mario Rossi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail Adresse *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="mario@pizzeria-bella-vista.at"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefonnummer
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+43 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hauptstraße 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                      PLZ
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Stadt
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Wien"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Lieferservice Informationen */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Lieferservice Informationen</h2>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_delivery_service"
                    name="has_delivery_service"
                    checked={formData.has_delivery_service}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_delivery_service" className="ml-2 block text-sm text-gray-700">
                    Wir haben bereits einen Lieferservice
                  </label>
                </div>

                {formData.has_delivery_service && (
                  <div>
                    <label htmlFor="delivery_service_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name des Lieferservices
                    </label>
                    <input
                      type="text"
                      id="delivery_service_name"
                      name="delivery_service_name"
                      value={formData.delivery_service_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="z.B. Lieferando, Mjam, etc."
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="monthly_revenue" className="block text-sm font-medium text-gray-700 mb-2">
                    Monatlicher Umsatz (optional)
                  </label>
                  <input
                    type="number"
                    id="monthly_revenue"
                    name="monthly_revenue"
                    value={formData.monthly_revenue}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. 15000"
                  />
                </div>

                <div>
                  <label htmlFor="delivery_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Aktueller Prozentsatz des Lieferservices (optional)
                  </label>
                  <input
                    type="number"
                    id="delivery_percentage"
                    name="delivery_percentage"
                    value={formData.delivery_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. 30"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Geben Sie den Prozentsatz ein, den Sie aktuell an Ihren Lieferservice zahlen (z.B. 30 für 30%)
                  </p>
                </div>

                {/* Rechner */}
                {formData.monthly_revenue && formData.delivery_percentage && (
                  <OrderCalculator
                    monthlyRevenue={formData.monthly_revenue}
                    deliveryPercentage={formData.delivery_percentage}
                    onSavingsCalculated={setCalculatedSavings}
                  />
                )}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Zurück
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Domain-Informationen */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain-Informationen</h2>
                
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Wichtige Information</h3>
                  <p className="text-blue-800 mb-2">
                    <strong>Wenn Sie bereits eine Domain haben:</strong> Ihre Bestellung ist <strong className="text-green-700">KOSTENLOS</strong> (€0,00)!
                  </p>
                  <p className="text-blue-800">
                    <strong>Wenn Sie keine Domain haben:</strong> Es fallen einmalig <strong className="text-orange-700">€30,00</strong> Domain-Kosten an.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Haben Sie bereits eine Domain für Ihr Geschäft? *
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="has_domain_yes"
                        name="has_domain"
                        checked={formData.has_domain === true}
                        onChange={() => setFormData(prev => ({ ...prev, has_domain: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="has_domain_yes" className="text-sm font-medium text-gray-700">
                        Ja, ich habe bereits eine Domain
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="has_domain_no"
                        name="has_domain"
                        checked={formData.has_domain === false}
                        onChange={() => setFormData(prev => ({ ...prev, has_domain: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="has_domain_no" className="text-sm font-medium text-gray-700">
                        Nein, ich brauche eine neue Domain
                      </label>
                    </div>
                  </div>
                </div>

                {formData.has_domain === true && (
                  <div>
                    <label htmlFor="existing_domain" className="block text-sm font-medium text-gray-700 mb-2">
                      Ihre bestehende Domain *
                    </label>
                    <input
                      type="text"
                      id="existing_domain"
                      name="existing_domain"
                      value={formData.existing_domain}
                      onChange={handleInputChange}
                      required={formData.has_domain === true}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="www.pizzeria-mario.at"
                    />
                    <p className="mt-2 text-sm text-green-600 font-semibold">
                      ✓ Ihre Bestellung ist kostenlos!
                    </p>
                  </div>
                )}

                {formData.has_domain === false && (
                  <div>
                    <label htmlFor="desired_domain" className="block text-sm font-medium text-gray-700 mb-2">
                      Ihre Wunsch-Domain (optional)
                    </label>
                    <input
                      type="text"
                      id="desired_domain"
                      name="desired_domain"
                      value={formData.desired_domain}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="www.pizzeria-mario.at"
                    />
                    <p className="mt-2 text-sm text-orange-600 font-semibold">
                      ⚠ Es fallen einmalig €30,00 Domain-Kosten an.
                    </p>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Zurück
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Rechtliches und Bezahlung */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rechtliches und Bezahlung</h2>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">🎉 MEGA AKTION</h3>
                  <p className="text-lg">
                    {formData.has_domain ? (
                      <>Bestellung <strong>KOSTENLOS</strong> wenn Sie bereits eine Domain haben!</>
                    ) : (
                      <>Nur <strong>€30,00</strong> für Domain-Kosten (einmalig)!</>
                    )}
                  </p>
                </div>

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
                      Ich akzeptiere die{' '}
                      <button
                        type="button"
                        onClick={() => setModalOpen('agb')}
                        className="text-blue-600 hover:underline"
                      >
                        Allgemeinen Geschäftsbedingungen
                      </button>{' '}
                      *
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
                      Ich akzeptiere die{' '}
                      <button
                        type="button"
                        onClick={() => setModalOpen('datenschutz')}
                        className="text-blue-600 hover:underline"
                      >
                        Datenschutzerklärung
                      </button>{' '}
                      *
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptAV"
                      name="acceptAV"
                      checked={formData.acceptAV}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="acceptAV" className="text-sm text-gray-700">
                      Ich akzeptiere den{' '}
                      <button
                        type="button"
                        onClick={() => setModalOpen('av')}
                        className="text-blue-600 hover:underline"
                      >
                        AV-Vertrag
                      </button>{' '}
                      *
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Gesamtbetrag:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(getPaymentAmount())}
                    </span>
                  </div>
                  {formData.has_domain && (
                    <p className="text-sm text-green-600 font-semibold">
                      ✓ Kostenlos, da Sie bereits eine Domain haben!
                    </p>
                  )}
                  {!formData.has_domain && (
                    <p className="text-sm text-gray-600">
                      Domain-Kosten (einmalig)
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Zurück
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !validateStep(4)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                  >
                    {isSubmitting
                      ? 'Wird verarbeitet...'
                      : formData.has_domain
                      ? '✓ Kostenlos bestellen'
                      : `Jetzt bestellen - ${formatPrice(getPaymentAmount())}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Legal Modals */}
      <LegalModal
        isOpen={modalOpen === 'agb'}
        onClose={() => setModalOpen(null)}
        title="Allgemeine Geschäftsbedingungen"
        content={
          <div>
            <p className="mb-4">
              Unsere Allgemeinen Geschäftsbedingungen befinden sich derzeit in der Erstellung und werden in Kürze verfügbar sein.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Kontakt:</strong><br />
                NextPuls Digital<br />
                Markt 141<br />
                2572 Kaumberg, Österreich<br />
                E-Mail: office@gastro-cms.at<br />
                Telefon: +43 660 546 78 06
              </p>
            </div>
          </div>
        }
      />

      <LegalModal
        isOpen={modalOpen === 'datenschutz'}
        onClose={() => setModalOpen(null)}
        title="Datenschutzerklärung"
        content={
          <div>
            <p className="text-sm text-gray-500 mb-4">
              <strong>Stand:</strong> 17. September 2025 | <strong>Version:</strong> 1.0
            </p>
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">1. Verantwortlicher</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>NextPuls Digital</strong><br/>
                Mario Gaupmann<br/>
                Markt 141<br/>
                2572 Kaumberg, Österreich</p>
                <p className="mt-2">
                  <strong>E-Mail:</strong> office@gastro-cms.at<br/>
                  <strong>Telefon:</strong> +43 660 546 78 06
                </p>
              </div>
            </section>
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">2. Allgemeine Hinweise zur Datenverarbeitung</h3>
              <p className="mb-4">
                Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung informiert Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten durch NextPuls Digital im Rahmen der Nutzung unserer Gastro CMS Software.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Die Verarbeitung Ihrer Daten erfolgt auf Grundlage der Datenschutz-Grundverordnung (DSGVO) und des österreichischen Datenschutzgesetzes (DSG).
              </p>
            </section>
            <p className="text-sm text-gray-600">
              Für die vollständige Datenschutzerklärung besuchen Sie bitte{' '}
              <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline">
                /datenschutz
              </a>
            </p>
          </div>
        }
      />

      <LegalModal
        isOpen={modalOpen === 'av'}
        onClose={() => setModalOpen(null)}
        title="Auftragsverarbeitungsvertrag (AV-Vertrag)"
        content={
          <div>
            <p className="mb-4">
              Der Auftragsverarbeitungsvertrag regelt die Verarbeitung personenbezogener Daten im Rahmen der Nutzung von Gastro CMS 3.0.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Wichtig:</strong> Als Auftragsverarbeiter verpflichten wir uns, personenbezogene Daten nur im Rahmen Ihrer Weisungen und gemäß den Bestimmungen der DSGVO zu verarbeiten.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Kontakt:</strong><br />
                NextPuls Digital<br />
                Markt 141<br />
                2572 Kaumberg, Österreich<br />
                E-Mail: office@gastro-cms.at<br />
                Telefon: +43 660 546 78 06
              </p>
            </div>
          </div>
        }
      />

      <Footer />
    </div>
  )
}
