'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Check, X, Pencil, Upload } from 'lucide-react'

interface CarouselImage {
  id: number
  url: string
  altText?: string | null
  title?: string | null
  order: number
  active: boolean
}

interface PendingImage {
  tempId: string
  url: string
  altText: string
  title: string
  uploading: boolean
}

export default function CarouselAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingImage[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ altText: '', title: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    const res = await fetch('/api/carousel')
    setImages(await res.json())
    setLoading(false)
  }

  const handleFiles = async (files: FileList) => {
    const newPending: PendingImage[] = Array.from(files).map(f => ({
      tempId: `${Date.now()}-${Math.random()}`,
      url: '',
      altText: '',
      title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      uploading: true,
    }))
    setPending(prev => [...prev, ...newPending])

    await Promise.all(newPending.map(async (p, i) => {
      const formData = new FormData()
      formData.append('file', files[i])
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const { url } = await res.json()
        setPending(prev => prev.map(item =>
          item.tempId === p.tempId ? { ...item, url, uploading: false } : item
        ))
      } catch {
        setPending(prev => prev.filter(item => item.tempId !== p.tempId))
        toast.error(`Upload fehlgeschlagen: ${files[i].name}`)
      }
    }))
  }

  const savePending = async () => {
    const ready = pending.filter(p => !p.uploading && p.url)
    if (!ready.length) return toast.error('Keine Bilder zum Speichern')

    await Promise.all(ready.map((p, i) =>
      fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: p.url,
          altText: p.altText || null,
          title: p.title || null,
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

  const updatePending = (tempId: string, field: 'altText' | 'title', value: string) =>
    setPending(prev => prev.map(p => p.tempId === tempId ? { ...p, [field]: value } : p))

  const startEdit = (img: CarouselImage) => {
    setEditId(img.id)
    setEditForm({ altText: img.altText || '', title: img.title || '' })
  }

  const saveEdit = async () => {
    if (!editId) return
    await fetch(`/api/carousel/${editId}`, {
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
    await fetch(`/api/carousel/${id}`, { method: 'DELETE' })
    toast.success('Bild gelöscht')
    fetchImages()
  }

  const toggleActive = async (img: CarouselImage) => {
    await fetch(`/api/carousel/${img.id}`, {
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
        <h1 className="text-2xl font-bold">Carousel Slider</h1>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Bilder hinzufügen
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
            <h2 className="text-lg font-semibold">Neue Bilder ({pending.length})</h2>
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
                <div className="relative h-36 bg-gray-100">
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
                  <input
                    value={p.title}
                    onChange={e => updatePending(p.tempId, 'title', e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Titel"
                  />
                  <input
                    value={p.altText}
                    onChange={e => updatePending(p.tempId, 'altText', e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Alt-Text (SEO)"
                  />
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
          <p className="text-xs text-gray-400 mt-1">Mehrere Bilder auf einmal möglich</p>
        </div>
      )}

      {/* Existing images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className={`bg-white rounded-2xl shadow overflow-hidden ${!img.active ? 'opacity-50' : ''}`}>
            <div className="relative h-40">
              <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
            </div>
            {editId === img.id ? (
              <div className="p-3 space-y-2">
                <input
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Titel"
                />
                <input
                  value={editForm.altText}
                  onChange={e => setEditForm(f => ({ ...f, altText: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Alt-Text (SEO)"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1 rounded text-sm font-medium">
                    <Check size={14} className="inline mr-1" />Speichern
                  </button>
                  <button onClick={() => setEditId(null)} className="flex-1 border py-1 rounded text-sm">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                {img.title && <p className="font-medium text-sm truncate">{img.title}</p>}
                {img.altText && <p className="text-xs text-gray-400 truncate">{img.altText}</p>}
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => toggleActive(img)}
                    className={`text-xs px-2 py-1 rounded-full ${img.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {img.active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(img)} className="text-blue-500 hover:text-blue-700">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(img.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
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
