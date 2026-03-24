'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface SocialMedia {
  id: number
  platform: string
  url: string
  icon?: string | null
  active: boolean
  order: number
}

export default function SocialMediaAdmin() {
  const [items, setItems] = useState<SocialMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ platform: '', url: '', icon: '' })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/social-media')
    setItems(await res.json())
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.platform || !form.url) return toast.error('Plattform und URL sind erforderlich')
    const res = await fetch('/api/social-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: items.length }),
    })
    if (res.ok) {
      toast.success('Link hinzugefügt')
      setForm({ platform: '', url: '', icon: '' })
      setShowForm(false)
      fetchItems()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Wirklich löschen?')) return
    await fetch(`/api/social-media/${id}`, { method: 'DELETE' })
    toast.success('Link gelöscht')
    fetchItems()
  }

  const toggleActive = async (item: SocialMedia) => {
    await fetch(`/api/social-media/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    fetchItems()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Social Media</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Link hinzufügen
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Neuer Social Media Link</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plattform *</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value, icon: e.target.value.toLowerCase() }))}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Wählen...</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter/X</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://www.facebook.com/..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium">Hinzufügen</button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`bg-white rounded-2xl shadow p-5 flex items-center justify-between ${!item.active ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{item.platform[0]}</span>
              </div>
              <div>
                <p className="font-semibold">{item.platform}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate max-w-xs block">
                  {item.url}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleActive(item)}
                className={`text-xs px-3 py-1 rounded-full cursor-pointer ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.active ? 'Aktiv' : 'Inaktiv'}
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-500">
          <p>Noch keine Social Media Links.</p>
        </div>
      )}
    </div>
  )
}
