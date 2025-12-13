'use client'

import { useEffect, useState } from 'react'

interface MaintenanceData {
  maintenanceMode: boolean
  maintenanceTitle: string
  maintenanceMessage: string
  restaurantName: string
  logo: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  impressum: string | null
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaintenanceData()
  }, [])

  const fetchMaintenanceData = async () => {
    try {
      const response = await fetch('/api/maintenance/check')
      const maintenanceData = await response.json()
      
      // Fetch restaurant settings for additional data
      const settingsResponse = await fetch('/api/settings')
      const settings = await settingsResponse.json()
      
      setData({
        maintenanceMode: maintenanceData.maintenanceMode,
        maintenanceTitle: maintenanceData.maintenanceTitle,
        maintenanceMessage: maintenanceData.maintenanceMessage,
        restaurantName: settings.restaurantName || 'Restaurant',
        logo: settings.logo,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        city: settings.city,
        postalCode: settings.postalCode,
        impressum: settings.impressum
      })
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
      setData({
        maintenanceMode: true,
        maintenanceTitle: 'Wartungsarbeiten',
        maintenanceMessage: 'Wir führen derzeit Wartungsarbeiten durch. Bitte besuchen Sie uns später wieder.',
        restaurantName: 'Restaurant',
        logo: null,
        phone: null,
        email: null,
        address: null,
        city: null,
        postalCode: null,
        impressum: null
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Fehler beim Laden</h1>
          <p className="mt-2 text-gray-600">Die Wartungsseite konnte nicht geladen werden.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            {data.logo ? (
              <img 
                src={data.logo} 
                alt={`${data.restaurantName} Logo`}
                className="h-12 w-auto"
              />
            ) : (
              <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {data.restaurantName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* Maintenance Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-8">
            <svg 
              className="h-12 w-12 text-yellow-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>

          {/* Maintenance Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {data.maintenanceTitle}
          </h1>

          {/* Maintenance Message */}
          <p className="text-lg text-gray-600 mb-8">
            {data.maintenanceMessage}
          </p>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {data.phone && (
                <p>
                  <span className="font-medium">Telefon:</span> {data.phone}
                </p>
              )}
              {data.email && (
                <p>
                  <span className="font-medium">E-Mail:</span> {data.email}
                </p>
              )}
              {(data.address || data.city || data.postalCode) && (
                <p>
                  <span className="font-medium">Adresse:</span> {[data.address, data.postalCode, data.city].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Seite aktualisieren
          </button>
        </div>
      </main>

      {/* Footer with Impressum */}
      {data.impressum && (
        <footer className="bg-gray-100 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div 
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: data.impressum }}
            />
          </div>
        </footer>
      )}
    </div>
  )
}