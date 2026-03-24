'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

interface SpeisekarteData {
  id?: number
  imageUrl?: string
  pdfUrl?: string
  title: string
  description?: string
}

export default function SpeisekarteAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<SpeisekarteData>({
    title: 'Unsere Speisekarte',
    imageUrl: '',
    pdfUrl: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/speisekarte')
      .then(r => r.json())
      .then(d => {
        if (d.id) setData(d)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/speisekarte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Speisekarte gespeichert')
        const updated = await res.json()
        setData(updated)
      } else {
        toast.error('Fehler beim Speichern')
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    setData(d => ({ ...d, pdfUrl: url }))
    toast.success('PDF hochgeladen')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Speisekarte</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Save size={18} /> {saving ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Titel</label>
          <input
            value={data.title}
            onChange={e => setData(d => ({ ...d, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Unsere Speisekarte"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beschreibung</label>
          <textarea
            value={data.description || ''}
            onChange={e => setData(d => ({ ...d, description: e.target.value }))}
            rows={5}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Beschreibung der Speisekarte (HTML möglich)"
          />
          <p className="text-xs text-gray-400 mt-1">HTML-Tags werden unterstützt</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUpload
            value={data.imageUrl || ''}
            onChange={(url) => setData(d => ({ ...d, imageUrl: url }))}
            label="Speisekarte Vorschaubild"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Speisekarte PDF</label>
            {data.pdfUrl ? (
              <div className="border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">PDF hochgeladen</p>
                  <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    PDF ansehen
                  </a>
                </div>
                <button
                  onClick={() => setData(d => ({ ...d, pdfUrl: '' }))}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Entfernen
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <p className="font-medium text-gray-500">PDF hier hochladen</p>
                  <p className="text-xs text-gray-400 mt-1">Nur PDF-Dateien</p>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
