'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

interface SlideImage {
  id: number
  url: string
  altText?: string | null
  title?: string | null
  description?: string | null
  link?: string | null
  imageRight?: string | null
  order: number
  active: boolean
}

const emptyForm = { url: '', altText: '', title: '', description: '', link: '', imageRight: '' }

export default function SlideshowAdmin() {
  const [slides, setSlides] = useState<SlideImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    const res = await fetch('/api/slideshow')
    setSlides(await res.json())
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.url) return toast.error('Bitte ein Hintergrundbild hochladen')
    const payload = {
      url: form.url,
      altText: form.altText || null,
      title: form.title || null,
      description: form.description || null,
      link: form.link || null,
      imageRight: form.imageRight || null,
    }
    const res = editId
      ? await fetch(`/api/slideshow/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/slideshow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, order: slides.length }) })

    if (res.ok) {
      toast.success(editId ? 'Slide aktualisiert' : 'Slide hinzugefügt')
      setForm(emptyForm)
      setShowForm(false)
      setEditId(null)
      fetchSlides()
    } else {
      toast.error('Fehler beim Speichern')
    }
  }

  const startEdit = (slide: SlideImage) => {
    setEditId(slide.id)
    setForm({
      url: slide.url,
      altText: slide.altText || '',
      title: slide.title || '',
      description: slide.description || '',
      link: slide.link || '',
      imageRight: slide.imageRight || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(emptyForm)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Slide wirklich löschen?')) return
    await fetch(`/api/slideshow/${id}`, { method: 'DELETE' })
    toast.success('Slide gelöscht')
    fetchSlides()
  }

  const toggleActive = async (slide: SlideImage) => {
    await fetch(`/api/slideshow/${slide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !slide.active }),
    })
    fetchSlides()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Slideshow</h1>
        <button
          onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(s => !s) }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Slide hinzufügen
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8 border-2 border-red-100">
          <h2 className="text-lg font-semibold mb-6">{editId ? '✏️ Slide bearbeiten' : '➕ Neuer Slide'}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Hintergrundbild *</p>
              <ImageUpload value={form.url} onChange={(url) => setForm(f => ({ ...f, url }))} label="" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Bild rechts (optional)</p>
              <ImageUpload value={form.imageRight} onChange={(url) => setForm(f => ({ ...f, imageRight: url }))} label="" />
              <p className="text-xs text-gray-400 mt-1">Wird rechts neben dem Text angezeigt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="z.B. Willkommen bei Da Corrado" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alt-Text (SEO)</label>
              <input value={form.altText} onChange={e => setForm(f => ({ ...f, altText: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Bildbeschreibung für Google" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" rows={2}
              placeholder="Kurzer Beschreibungstext unter dem Titel" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Button Link (optional)</label>
            <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://... oder /tischreservierung" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-medium">
              <Check size={18} /> {editId ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
            <button onClick={cancelForm} className="flex items-center gap-2 border px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50">
              <X size={18} /> Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Slides grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className={`bg-white rounded-2xl shadow overflow-hidden ${!slide.active ? 'opacity-50' : ''}`}>
            <div className="relative h-44">
              <img src={slide.url} alt={slide.altText || ''} className="w-full h-full object-cover" />
              {slide.imageRight && (
                <div className="absolute bottom-2 right-2 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow">
                  <img src={slide.imageRight} alt="Bild rechts" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="p-4">
              {slide.title && <p className="font-semibold text-gray-800 truncate">{slide.title}</p>}
              {slide.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{slide.description}</p>}
              {slide.link && <p className="text-xs text-blue-500 mt-1 truncate">🔗 {slide.link}</p>}
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => toggleActive(slide)}
                  className={`text-xs px-3 py-1 rounded-full cursor-pointer ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slide.active ? 'Aktiv' : 'Inaktiv'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(slide)} className="text-blue-500 hover:text-blue-700 p-1">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && !showForm && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="font-medium">Noch keine Slides. Fügen Sie den ersten hinzu!</p>
        </div>
      )}
    </div>
  )
}
