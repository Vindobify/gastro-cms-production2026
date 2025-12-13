'use client'

import React, { useState, useEffect } from 'react'

interface OrderCalculatorProps {
  monthlyRevenue: string
  deliveryPercentage: string
  onSavingsCalculated: (savings: number) => void
}

export default function OrderCalculator({ monthlyRevenue, deliveryPercentage, onSavingsCalculated }: OrderCalculatorProps) {
  const [savings, setSavings] = useState<number>(0)
  const [customerCost, setCustomerCost] = useState<number>(0)
  const [gastroCmsCost, setGastroCmsCost] = useState<number>(0)

  useEffect(() => {
    const revenue = parseFloat(monthlyRevenue) || 0
    const percentage = parseFloat(deliveryPercentage) || 0

    if (revenue > 0 && percentage > 0) {
      // Kunde zahlt aktuell
      const currentCost = revenue * (percentage / 100)
      setCustomerCost(currentCost)

      // Bei Gastro CMS (10% Provision)
      const gastroCmsCostValue = revenue * 0.10
      setGastroCmsCost(gastroCmsCostValue)

      // Ersparnis
      const savingsValue = currentCost - gastroCmsCostValue
      setSavings(savingsValue)
      onSavingsCalculated(savingsValue)
    } else {
      setCustomerCost(0)
      setGastroCmsCost(0)
      setSavings(0)
      onSavingsCalculated(0)
    }
  }, [monthlyRevenue, deliveryPercentage, onSavingsCalculated])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (!monthlyRevenue || parseFloat(monthlyRevenue) <= 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <p className="text-center text-gray-500">
          Geben Sie monatlichen Umsatz und aktuellen Prozentsatz ein, um die Ersparnis zu berechnen.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Ersparnis-Rechner</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Aktueller Monatsumsatz:</span>
          <span className="text-sm font-semibold text-gray-900">{formatPrice(parseFloat(monthlyRevenue) || 0)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Sie zahlen aktuell ({deliveryPercentage || 0}%):</span>
          <span className="text-sm font-semibold text-red-600">{formatPrice(customerCost)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Bei Gastro CMS (10%):</span>
          <span className="text-sm font-semibold text-blue-600">{formatPrice(gastroCmsCost)}</span>
        </div>

        <div className="border-t border-green-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Sie sparen pro Monat:</span>
            <span className="text-2xl font-bold text-green-600">{formatPrice(savings)}</span>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Pro Jahr: <strong className="text-green-700">{formatPrice(savings * 12)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

