'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

interface ServiceCard {
  id: number
  headline: string
  link?: string | null
  text: string
  imageUrl?: string | null
  imageAlt?: string | null
  order: number
  active: boolean
}

const emptyForm = { headline: '', text: '', imageUrl: '', imageAlt: '', link: '' }

export default function AngebotAdmin() {
  const [cards, setCards] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchCards() }, [])

  const fetchCards = async () => {
    const res = await fetch('/api/service-cards')
    setCards(await res.json())
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.headline) return toast.error('Headline ist erforderlich')
    const res = await fetch('/api/service-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: cards.length }),
    })
    if (res.ok) {
      toast.success('Karte hinzugefügt')
      setForm(emptyForm)
      setShowForm(false)
      fetchCards()
    }
  }

  const handleEdit = (card: ServiceCard) => {
    setEditId(card.id)
    setForm({
      headline: card.headline,
      text: card.text,
      imageUrl: card.imageUrl || '',
      imageAlt: card.imageAlt || '',
      link: card.link || '',
    })
  }

  const handleUpdate = async () => {
    if (!editId) return
    const res = await fetch(`/api/service-cards/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Karte aktualisiert')
      setEditId(null)
      setForm(emptyForm)
      fetchCards()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Wirklich löschen?')) return
    await fetch(`/api/service-cards/${id}`, { method: 'DELETE' })
    toast.success('Karte gelöscht')
    fetchCards()
  }

  const toggleActive = async (card: ServiceCard) => {
    await fetch(`/api/service-cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !card.active }),
    })
    fetchCards()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Angebot Karten</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Karte hinzufügen
        </button>
      </div>

      {(showForm || editId) && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Karte bearbeiten' : 'Neue Karte'}</h2>
          <div className="space-y-4">
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} label="Kartenbild" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Headline *</label>
                <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="z.B. Lieferservice" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bild Alt-Text</label>
                <input value={form.imageAlt} onChange={e => setForm(f => ({ ...f, imageAlt: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Bildbeschreibung für SEO" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text *</label>
              <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                rows={3} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Beschreibungstext der Karte" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link (optional)</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://bestellung.pizzeria1140.at" />
              <p className="text-xs text-gray-400 mt-1">Wird als Button im Modal angezeigt</p>
            </div>
            <div className="flex gap-3">
              {editId ? (
                <>
                  <button type="button" onClick={handleUpdate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Check size={16} /> Speichern
                  </button>
                  <button type="button" onClick={() => { setEditId(null); setForm(emptyForm) }} className="flex items-center gap-2 border px-6 py-2 rounded-lg">
                    <X size={16} /> Abbrechen
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={handleAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium">Hinzufügen</button>
                  <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">Abbrechen</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className={`bg-white rounded-2xl shadow overflow-hidden ${!card.active ? 'opacity-60' : ''}`}>
            {card.imageUrl && (
              <div className="h-40 relative">
                <img src={card.imageUrl} alt={card.imageAlt || card.headline} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-800">{card.headline}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{card.text}</p>
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => toggleActive(card)}
                  className={`text-xs px-3 py-1 rounded-full cursor-pointer ${card.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {card.active ? 'Aktiv' : 'Inaktiv'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => { handleEdit(card); setShowForm(false) }} className="text-blue-500 hover:text-blue-700">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(card.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-500">
          <p>Noch keine Angebot-Karten.</p>
        </div>
      )}
    </div>
  )
}
