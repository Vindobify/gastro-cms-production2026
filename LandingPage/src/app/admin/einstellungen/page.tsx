'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

interface OpeningHour {
  day: string
  open: string
  close: string
  closed: boolean
}

const defaultHours: OpeningHour[] = [
  { day: 'Montag', open: '11:00', close: '22:00', closed: false },
  { day: 'Dienstag', open: '11:00', close: '22:00', closed: false },
  { day: 'Mittwoch', open: '11:00', close: '22:00', closed: false },
  { day: 'Donnerstag', open: '11:00', close: '22:00', closed: false },
  { day: 'Freitag', open: '11:00', close: '22:30', closed: false },
  { day: 'Samstag', open: '11:00', close: '22:30', closed: false },
  { day: 'Sonntag', open: '11:00', close: '23:00', closed: false },
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass = "w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"

export default function EinstellungenAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [hours, setHours] = useState<OpeningHour[]>(defaultHours)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setSettings(d)
        if (d.opening_hours) {
          try { setHours(JSON.parse(d.opening_hours)) } catch {}
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, opening_hours: JSON.stringify(hours) }),
      })
      if (res.ok) toast.success('Einstellungen gespeichert')
      else toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }))

  const updateHour = (index: number, field: keyof OpeningHour, value: string | boolean) =>
    setHours(h => h.map((hour, i) => i === index ? { ...hour, [field]: value } : hour))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          <Save size={18} /> {saving ? 'Wird gespeichert...' : 'Alle speichern'}
        </button>
      </div>

      <div className="space-y-6">

        {/* Logo + Favicon */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Logo & Favicon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              value={settings.logo_url || ''}
              onChange={(url) => set('logo_url', url)}
              label="Restaurant Logo"
            />
            <div>
              <ImageUpload
                value={settings.favicon_url || ''}
                onChange={(url) => set('favicon_url', url)}
                label="Favicon"
              />
              <p className="text-xs text-gray-400 mt-2">Wird im Browser-Tab angezeigt (empfohlen: 32×32 oder 64×64px, PNG/ICO)</p>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">SEO & Meta</h2>
          <div className="space-y-4">
            <Field label="Website Titel">
              <input value={settings.site_title || ''} onChange={e => set('site_title', e.target.value)}
                className={inputClass} placeholder="Pizzeria Da Corrado | 1140 Wien" />
            </Field>
            <Field label="Meta Beschreibung" hint={`${(settings.site_description || '').length}/160 Zeichen`}>
              <textarea value={settings.site_description || ''} onChange={e => set('site_description', e.target.value)}
                rows={3} className={inputClass + ' resize-none'}
                placeholder="Pizzeria Da Corrado in 1140 Wien..." />
            </Field>
            <Field label="Google Analytics ID" hint="Format: G-XXXXXXXXXX — wird erst nach Cookie-Zustimmung geladen">
              <input value={settings.google_analytics || ''} onChange={e => set('google_analytics', e.target.value)}
                className={inputClass} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Google Site Verification" hint="Verification Code aus der Google Search Console">
              <input value={settings.google_site_verification || ''} onChange={e => set('google_site_verification', e.target.value)}
                className={inputClass} placeholder="xxxxxxxxxxxxxxxxxxxxxxx" />
            </Field>
            <div>
              <label className="block text-sm font-medium mb-2">OG Image (Social Media Vorschaubild)</label>
              <div className="max-w-sm">
                <ImageUpload value={settings.og_image || ''} onChange={(url) => set('og_image', url)} label="OG Image hochladen" purpose="og" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Empfohlen: 1200×630px als JPG/PNG (kein WebP) — wird bei Facebook, WhatsApp etc. angezeigt</p>
            </div>
          </div>
        </div>

        {/* Restaurant Data */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Restaurant & Impressum Daten</h2>
          <p className="text-sm text-gray-500 mb-4">Diese Daten fließen automatisch in Impressum, Datenschutz und SEO ein.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Restaurantname / Unternehmensname">
              <input value={settings.restaurant_name || ''} onChange={e => set('restaurant_name', e.target.value)}
                className={inputClass} placeholder="Pizzeria Da Corrado" />
            </Field>
            <Field label="Rechtsform">
              <select value={settings.rechtsform || ''} onChange={e => set('rechtsform', e.target.value)}
                className={inputClass}>
                <option value="">Bitte wählen</option>
                <option>Einzelunternehmen</option>
                <option>e.U. (eingetragenes Unternehmen)</option>
                <option>GmbH</option>
                <option>GmbH & Co KG</option>
                <option>OG</option>
                <option>KG</option>
              </select>
            </Field>
            <Field label="Inhaber / Geschäftsführer">
              <input value={settings.inhaber_name || ''} onChange={e => set('inhaber_name', e.target.value)}
                className={inputClass} placeholder="Max Mustermann" />
            </Field>
            <Field label="ATU-Nummer (Umsatzsteuer-ID)" hint="Format: ATU12345678">
              <input value={settings.atu_nummer || ''} onChange={e => set('atu_nummer', e.target.value)}
                className={inputClass} placeholder="ATU12345678" />
            </Field>
            <Field label="Firmenbuchnummer (FN)" hint="Nur wenn im Firmenbuch eingetragen">
              <input value={settings.fn_nummer || ''} onChange={e => set('fn_nummer', e.target.value)}
                className={inputClass} placeholder="123456a" />
            </Field>
            <Field label="Firmenbuchgericht">
              <input value={settings.firmenbuchgericht || ''} onChange={e => set('firmenbuchgericht', e.target.value)}
                className={inputClass} placeholder="Handelsgericht Wien" />
            </Field>
            <Field label="Straße & Hausnummer">
              <input value={settings.restaurant_strasse || ''} onChange={e => set('restaurant_strasse', e.target.value)}
                className={inputClass} placeholder="Musterstraße 1" />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="PLZ">
                <input value={settings.restaurant_plz || ''} onChange={e => set('restaurant_plz', e.target.value)}
                  className={inputClass} placeholder="1140" />
              </Field>
              <div className="col-span-2">
                <Field label="Ort">
                  <input value={settings.restaurant_ort || ''} onChange={e => set('restaurant_ort', e.target.value)}
                    className={inputClass} placeholder="Wien" />
                </Field>
              </div>
            </div>
            <Field label="Adresse (für Footer & Google Maps)" hint="Vollständige Adresse für die Anzeige">
              <input value={settings.restaurant_address || ''} onChange={e => set('restaurant_address', e.target.value)}
                className={inputClass} placeholder="Musterstraße 1, 1140 Wien" />
            </Field>
            <Field label="Telefonnummer">
              <input value={settings.restaurant_phone || ''} onChange={e => set('restaurant_phone', e.target.value)}
                className={inputClass} placeholder="+43 1 123 456 78" />
            </Field>
            <Field label="E-Mail">
              <input value={settings.restaurant_email || ''} onChange={e => set('restaurant_email', e.target.value)}
                className={inputClass} placeholder="kontakt@pizzeria1140.at" />
            </Field>
            <Field label="Website">
              <input value={settings.restaurant_website || ''} onChange={e => set('restaurant_website', e.target.value)}
                className={inputClass} placeholder="https://pizzeria1140.at" />
            </Field>
            <Field label="Gewerbe / Branche">
              <input value={settings.gewerbe || ''} onChange={e => set('gewerbe', e.target.value)}
                className={inputClass} placeholder="Gastronomie (Gastgewerbe)" />
            </Field>
            <Field label="Zuständige Behörde (Gewerbebehörde)">
              <input value={settings.behoerde || ''} onChange={e => set('behoerde', e.target.value)}
                className={inputClass} placeholder="Magistrat der Stadt Wien" />
            </Field>
            <Field label="Breitengrad (Latitude)">
              <input value={settings.restaurant_lat || ''} onChange={e => set('restaurant_lat', e.target.value)}
                className={inputClass} placeholder="48.1985" />
            </Field>
            <Field label="Längengrad (Longitude)">
              <input value={settings.restaurant_lng || ''} onChange={e => set('restaurant_lng', e.target.value)}
                className={inputClass} placeholder="16.2989" />
            </Field>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Öffnungszeiten</h2>
          <div className="space-y-3">
            {hours.map((hour, index) => (
              <div key={`${hour.day}-${index}`} className="flex items-center gap-4 py-2 border-b last:border-0">
                <div className="w-28 text-sm font-medium text-gray-700">{hour.day}</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`closed-${index}`} checked={hour.closed}
                    onChange={e => updateHour(index, 'closed', e.target.checked)}
                    className="w-4 h-4 accent-red-600" />
                  <label htmlFor={`closed-${index}`} className="text-sm text-gray-600">Geschlossen</label>
                </div>
                {!hour.closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Von:</label>
                      <input type="time" value={hour.open} onChange={e => updateHour(index, 'open', e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Bis:</label>
                      <input type="time" value={hour.close} onChange={e => updateHour(index, 'close', e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
