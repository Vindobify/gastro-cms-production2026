'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Phone, Mail, Users, Clock, MessageSquare } from 'lucide-react'

interface Reservation {
  id: number
  name: string
  phone: string
  email: string
  persons: number
  date: string
  time: string
  message?: string | null
  status: string
  createdAt: string
}

const VIENNA_TZ = 'Europe/Vienna'

export default function ReservierungenAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/reservierung')
      .then(r => r.json())
      .then(d => {
        setReservations(Array.isArray(d) ? d : [])
        setLoading(false)
      })
  }, [])

  const filtered = reservations.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.email.toLowerCase().includes(filter.toLowerCase()) ||
    r.phone.includes(filter) ||
    r.date.includes(filter)
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Reservierungen</h1>
        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
          {reservations.length} Gesamt
        </span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Suchen nach Name, E-Mail, Telefon, Datum..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl shadow">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p>{reservations.length === 0 ? 'Noch keine Reservierungen.' : 'Keine Ergebnisse.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-red-500 flex-shrink-0" />
                    <span className="font-semibold">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-red-500 flex-shrink-0" />
                    <a href={`tel:${r.phone}`} className="hover:text-red-600">{r.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-red-500 flex-shrink-0" />
                    <a href={`mailto:${r.email}`} className="hover:text-red-600 truncate">{r.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-red-500 flex-shrink-0" />
                    <span>{r.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-red-500 flex-shrink-0" />
                    <span>{r.time} Uhr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-red-500 flex-shrink-0" />
                    <span>{r.persons} {r.persons === 1 ? 'Person' : 'Personen'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString('de-AT', {
                    timeZone: VIENNA_TZ,
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {r.message && (
                <div className="mt-3 pt-3 border-t flex items-start gap-2 text-sm text-gray-600">
                  <MessageSquare size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p>{r.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
