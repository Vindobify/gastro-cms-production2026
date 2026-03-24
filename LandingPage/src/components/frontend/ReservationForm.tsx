'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { reservationFormSchema, type ReservationFormData } from '@/lib/reservationSchema'
import { User, Phone, Mail, Users, Calendar, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'


const VIENNA_TZ = 'Europe/Vienna'

function getViennaTodayIsoDate() {
  const now = new Date()
  const viennaDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIENNA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return viennaDate
}

function Field({ icon: Icon, label, error, children }: {
  icon: React.ElementType
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
        <Icon size={14} className="text-red-400" />
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"

export default function ReservationForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
  })

  const onSubmit = async (data: ReservationFormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservierung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Reservierungsanfrage erfolgreich gesendet!')
        reset()
        setTimeout(() => setSent(false), 5000)
      } else {
        let msg = 'Fehler beim Senden. Bitte versuchen Sie es erneut.'
        try {
          const j = await res.json()
          if (j?.error && typeof j.error === 'string') msg = j.error
        } catch {
          /* ignore */
        }
        toast.error(msg)
      }
    } catch {
      toast.error('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle size={64} className="text-green-400 mb-4" />
        <h3 className="text-2xl font-black text-white mb-2">Vielen Dank!</h3>
        <p className="text-gray-400">Ihre Reservierungsanfrage wurde erfolgreich gesendet. Wir melden uns bald bei Ihnen.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Name + Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field icon={User} label="Name *" error={errors.name?.message}>
          <input {...register('name')} className={inputClass} placeholder="Ihr Name" />
        </Field>
        <Field icon={Phone} label="Telefonnummer *" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="text"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+43 … oder z. B. Tel. Durchwahl"
          />
        </Field>
      </div>

      {/* Email */}
      <Field icon={Mail} label="E-Mail Adresse *" error={errors.email?.message}>
        <input {...register('email')} type="email" className={inputClass} placeholder="name@beispiel.at" />
      </Field>

      {/* Persons */}
      <Field icon={Users} label="Anzahl Personen *" error={errors.persons?.message}>
        <select {...register('persons')} className={inputClass + ' cursor-pointer'}>
          <option value="" className="bg-gray-900">Bitte wählen</option>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <option key={n} value={n} className="bg-gray-900">{n} {n === 1 ? 'Person' : 'Personen'}</option>
          ))}
          <option value="mehr" className="bg-gray-900">Mehr als 10 Personen</option>
        </select>
      </Field>

      {/* Date + Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field icon={Calendar} label="Datum *" error={errors.date?.message}>
          <input
            {...register('date')}
            type="date"
            min={getViennaTodayIsoDate()}
            className={inputClass + ' [color-scheme:dark]'}
          />
        </Field>
        <Field icon={Clock} label="Uhrzeit *" error={errors.time?.message}>
          <input {...register('time')} type="time" min="11:00" max="21:00" className={inputClass + ' [color-scheme:dark]'} />
        </Field>
      </div>

      {/* Message */}
      <Field icon={MessageSquare} label="Ihre Nachricht (optional)">
        <textarea
          {...register('message')}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Besondere Wünsche, Geburtstag, Jubiläum..."
        />
      </Field>

      {/* DSGVO Checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register('datenschutz')}
            className="mt-0.5 w-4 h-4 accent-red-500 flex-shrink-0"
          />
          <span className="text-white/60 text-xs leading-relaxed">
            Ich stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Reservierungsanfrage gemäß der{' '}
            <Link href="/datenschutz" className="text-red-400 hover:text-red-300 underline" target="_blank">
              Datenschutzerklärung
            </Link>{' '}
            zu. Die Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben. *
          </span>
        </label>
        {errors.datenschutz && (
          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.datenschutz.message}</p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-2" />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 shadow-2xl"
        style={{ background: '#D60000' }}
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Wird gesendet...
          </>
        ) : (
          <>
            <Send size={18} />
            Tisch reservieren
          </>
        )}
      </button>

      <p className="text-center text-white/30 text-xs">
        Kostenlos & unverbindlich · Wir bestätigen Ihre Reservierung telefonisch
      </p>
    </form>
  )
}
