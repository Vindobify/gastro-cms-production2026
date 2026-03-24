'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Trash2, Check, X, Pencil, Upload } from 'lucide-react'

interface RestaurantImage {
  id: number
  url: string
  altText: string
  title?: string | null
  description?: string | null
  order: number
  active: boolean
}

interface PendingImage {
  tempId: string
  url: string
  altText: string
  title: string
  description: string
  uploading: boolean
}

export default function RestaurantBilderAdmin() {
  const [images, setImages] = useState<RestaurantImage[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingImage[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ altText: '', title: '', description: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    const res = await fetch('/api/restaurant-images')
    setImages(await res.json())
    setLoading(false)
  }

  const handleFiles = async (files: FileList) => {
    const newPending: PendingImage[] = Array.from(files).map(f => ({
      tempId: `${Date.now()}-${Math.random()}`,
      url: '',
      altText: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      title: '',
      description: '',
      uploading: true,
    }))
    setPending(prev => [...prev, ...newPending])

    await Promise.all(Array.from(files).map(async (file, i) => {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const { url } = await res.json()
        setPending(prev => prev.map(item =>
          item.tempId === newPending[i].tempId ? { ...item, url, uploading: false } : item
        ))
      } catch {
        setPending(prev => prev.filter(item => item.tempId !== newPending[i].tempId))
        toast.error(`Upload fehlgeschlagen: ${file.name}`)
      }
    }))
  }

  const savePending = async () => {
    const ready = pending.filter(p => !p.uploading && p.url)
    if (!ready.length) return toast.error('Keine Bilder zum Speichern')
    const missing = ready.filter(p => !p.altText)
    if (missing.length) return toast.error('Bitte Alt-Text für alle Bilder ausfüllen (SEO)')

    await Promise.all(ready.map((p, i) =>
      fetch('/api/restaurant-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: p.url,
          altText: p.altText,
          title: p.title || null,
          description: p.description || null,
          order: images.length + i,
        }),
      })
    ))
    toast.success(`${ready.length} Bild(er) gespeichert`)
    setPending([])
    fetchImages()
  }

  const removePending = (tempId: string) =>
    setPending(prev => prev.filter(p => p.tempId !== tempId))

  const updatePending = (tempId: string, field: keyof Omit<PendingImage, 'tempId' | 'uploading'>, value: string) =>
    setPending(prev => prev.map(p => p.tempId === tempId ? { ...p, [field]: value } : p))

  const startEdit = (img: RestaurantImage) => {
    setEditId(img.id)
    setEditForm({ altText: img.altText || '', title: img.title || '', description: img.description || '' })
  }

  const saveEdit = async () => {
    if (!editId) return
    await fetch(`/api/restaurant-images/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    toast.success('Gespeichert')
    setEditId(null)
    fetchImages()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Wirklich löschen?')) return
    await fetch(`/api/restaurant-images/${id}`, { method: 'DELETE' })
    toast.success('Bild gelöscht')
    fetchImages()
  }

  const toggleActive = async (img: RestaurantImage) => {
    await fetch(`/api/restaurant-images/${img.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !img.active }),
    })
    fetchImages()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Bilder</h1>
          <p className="text-sm text-gray-500 mt-1">Alt-Text wird im Frontend als Bildunterschrift angezeigt</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Upload size={18} /> Bilder hochladen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Pending uploads */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Neue Bilder — bitte Alt-Text ausfüllen</h2>
            <div className="flex gap-2">
              <button onClick={() => setPending([])} className="border px-4 py-1.5 rounded-lg text-sm">Verwerfen</button>
              <button
                onClick={savePending}
                disabled={pending.some(p => p.uploading)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
              >
                <Check size={16} /> Alle speichern
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(p => (
              <div key={p.tempId} className="border rounded-xl overflow-hidden">
                <div className="relative h-40 bg-gray-100">
                  {p.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => removePending(p.tempId)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Alt-Text (SEO) *</label>
                    <input
                      value={p.altText}
                      onChange={e => updatePending(p.tempId, 'altText', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 mt-0.5"
                      placeholder="z.B. Innenraum Pizzeria Da Corrado"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Titel</label>
                    <input
                      value={p.title}
                      onChange={e => updatePending(p.tempId, 'title', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 mt-0.5"
                      placeholder="Bildtitel (optional)"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Beschreibung</label>
                    <input
                      value={p.description}
                      onChange={e => updatePending(p.tempId, 'description', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 mt-0.5"
                      placeholder="Wird im Frontend angezeigt"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone when empty */}
      {images.length === 0 && pending.length === 0 && (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files) }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="font-medium text-gray-500">Bilder hier ablegen oder klicken</p>
          <p className="text-xs text-gray-400 mt-1">Mehrere Bilder auf einmal möglich • PNG, JPG, WebP</p>
        </div>
      )}

      {/* Existing images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className={`bg-white rounded-xl shadow overflow-hidden ${!img.active ? 'opacity-50' : ''}`}>
            <div className="relative h-40">
              <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
            </div>
            {editId === img.id ? (
              <div className="p-3 space-y-2">
                <div>
                  <label className="text-xs text-gray-600">Alt-Text *</label>
                  <input value={editForm.altText} onChange={e => setEditForm(f => ({ ...f, altText: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Titel</label>
                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Beschreibung</label>
                  <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500" />
                </div>
                <div className="flex gap-1">
                  <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1 rounded text-xs font-medium">
                    <Check size={12} className="inline mr-0.5" />OK
                  </button>
                  <button onClick={() => setEditId(null)} className="flex-1 border py-1 rounded text-xs">
                    <X size={12} className="inline" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <p className="text-xs font-medium text-gray-700 truncate">{img.altText}</p>
                {img.description && <p className="text-xs text-gray-400 truncate mt-0.5">{img.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => toggleActive(img)}
                    className={`text-xs px-2 py-0.5 rounded-full ${img.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {img.active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(img)} className="text-blue-500 hover:text-blue-700">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(img.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
