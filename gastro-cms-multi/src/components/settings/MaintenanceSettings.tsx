'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'

interface MaintenanceSettings {
  maintenanceMode: boolean
  maintenanceTitle: string
  maintenanceMessage: string
}

export default function MaintenanceSettings() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    maintenanceMode: false,
    maintenanceTitle: '',
    maintenanceMessage: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/maintenance')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading maintenance settings:', error)
      setMessage({ type: 'error', text: 'Fehler beim Laden der Einstellungen' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: data.message })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Fehler beim Speichern' })
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error)
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Wartungsmodus
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Aktivieren Sie den Wartungsmodus, um die Website für Besucher zu sperren.
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Maintenance Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              Wartungsmodus aktivieren
            </label>
            <p className="text-sm text-gray-500">
              Wenn aktiviert, werden Besucher zur Wartungsseite umgeleitet.
            </p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            className={`${
              settings.maintenanceMode ? 'bg-emerald-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {/* Maintenance Title */}
        <div>
          <label htmlFor="maintenanceTitle" className="block text-sm font-medium text-gray-900">
            Wartungstitel
          </label>
          <input
            type="text"
            id="maintenanceTitle"
            value={settings.maintenanceTitle}
            onChange={(e) => setSettings(prev => ({ ...prev, maintenanceTitle: e.target.value }))}
            placeholder="z.B. Wartungsarbeiten"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        {/* Maintenance Message */}
        <div>
          <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-900">
            Wartungsnachricht
          </label>
          <textarea
            id="maintenanceMessage"
            rows={4}
            value={settings.maintenanceMessage}
            onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
            placeholder="z.B. Wir führen derzeit Wartungsarbeiten durch. Bitte besuchen Sie uns später wieder."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Diese Nachricht wird auf der Wartungsseite angezeigt.
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Speichern...
              </>
            ) : (
              'Einstellungen speichern'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
