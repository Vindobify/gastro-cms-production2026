'use client'

import React, { useState } from 'react'

export default function Calculator() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactEmail: '',
    phone: '',
    monthlyRevenue: '',
    currentCommission: '30',
    acceptTerms: false,
    acceptPrivacy: false
  })
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const calculateSavings = () => {
    const monthlyRevenue = parseFloat(formData.monthlyRevenue) || 0
    const currentCommission = parseFloat(formData.currentCommission) || 30
    const gastroCommission = 10

    const currentCost = (monthlyRevenue * currentCommission) / 100
    const gastroCost = (monthlyRevenue * gastroCommission) / 100
    const savings = currentCost - gastroCost
    const savingsPercentage = ((savings / currentCost) * 100) || 0
    const yearlySavings = savings * 12

    return {
      currentCost,
      gastroCost,
      savings,
      savingsPercentage,
      yearlySavings
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      alert('Bitte akzeptieren Sie die AGB und Datenschutzerklärung.')
      return
    }
    
    setIsCalculating(true)
    
    try {
      const calculation = calculateSavings()
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_name: formData.restaurantName,
          contactEmail: formData.contactEmail,
          phone: formData.phone,
          monthlyRevenue: formData.monthlyRevenue,
          currentCommission: formData.currentCommission,
          message: `Berechnung: Aktuelle Kosten: €${calculation.currentCost.toLocaleString('de-DE')}, Gastro CMS Kosten: €${calculation.gastroCost.toLocaleString('de-DE')}, Ersparnis: €${calculation.savings.toLocaleString('de-DE')} (${calculation.savingsPercentage.toFixed(1)}%), Jährliche Ersparnis: €${calculation.yearlySavings.toLocaleString('de-DE')}`
        }),
      })

      if (response.ok) {
        alert('Berechnung erfolgreich gesendet! Du erhältst eine E-Mail mit deiner persönlichen Ersparnis-Berechnung.')
      } else {
        throw new Error('Fehler beim Senden der Berechnung')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Senden der Berechnung. Bitte versuche es erneut.')
    } finally {
      setIsCalculating(false)
    }
  }

  const calculation = calculateSavings()

  return (
    <section id="calculator" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
            💰 Deine Ersparnis berechnen
          </h2>
          <p className="text-xl text-gray-600">
            Finde heraus, wie viel du mit Gastro CMS 3.0 sparen kannst!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white p-8 rounded-2xl card-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="restaurantName"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="z.B. Pizzeria Mario"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail Adresse *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="mario@pizzeria.at"
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
                <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                  Monatlicher Lieferservice-Umsatz (€) *
                </label>
                <input
                  type="number"
                  id="monthlyRevenue"
                  name="monthlyRevenue"
                  value={formData.monthlyRevenue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="currentCommission" className="block text-sm font-medium text-gray-700 mb-2">
                  Aktuelle Provision (%)
                </label>
                <input
                  type="number"
                  id="currentCommission"
                  name="currentCommission"
                  value={formData.currentCommission}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="50"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="z.B. 30"
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
                disabled={isCalculating}
                className="w-full bg-gradient-brand text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 hover-lift disabled:opacity-50"
              >
                {isCalculating ? 'Berechne...' : '💰 Kosten berechnen & E-Mail erhalten'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Current Costs */}
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                💸 Aktuelle Kosten
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monatliche Provision:</span>
                  <span className="font-bold">€{calculation.currentCost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-800 border-t pt-2">
                  <span>Jährlich:</span>
                  <span>€{(calculation.currentCost * 12).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Gastro CMS Costs */}
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                ✅ Mit Gastro CMS 3.0
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monatliche Kosten:</span>
                  <span className="font-bold">€{calculation.gastroCost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-800 border-t pt-2">
                  <span>Jährlich:</span>
                  <span>€{(calculation.gastroCost * 12).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-gradient-brand text-white p-6 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">🎉 Deine Ersparnis</h3>
              <div className="text-4xl font-bold mb-2">
                €{calculation.savings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xl mb-4">pro Monat</div>
              <div className="text-3xl font-bold mb-2">
                €{calculation.yearlySavings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-lg">pro Jahr</div>
              <div className="mt-4 text-lg font-semibold bg-white bg-opacity-20 px-4 py-2 rounded-lg inline-block">
                {calculation.savingsPercentage.toFixed(1)}% weniger Kosten
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
