'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ExternalLink, Tag } from 'lucide-react'

interface DeliveryWidgetProps {
  logoUrl?: string
}

export default function DeliveryWidget({ logoUrl }: DeliveryWidgetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop: vertical tab on right center */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Lieferservice – 20% Rabatt"
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center bg-white hover:bg-gray-50 transition-colors rounded-l-2xl shadow-2xl cursor-pointer"
        style={{ borderLeft: '4px solid #D60000' }}
      >
        {/* Logo column */}
        <div style={{ position: 'relative', width: 27, overflow: 'hidden', padding: '16px 0' }}>
          {logoUrl ? (
            <>
              <div style={{ width: 1, height: 90, visibility: 'hidden' }} />
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                width: 90, height: 27,
              }}>
                <Image
                  src={logoUrl}
                  alt="Da Corrado"
                  width={90}
                  height={27}
                  sizes="90px"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </>
          ) : (
            <span className="font-black text-xs" style={{ color: '#D60000', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>DC</span>
          )}
        </div>
        <div className="w-px self-stretch my-3" style={{ background: '#D60000', opacity: 0.2 }} />
        <div className="px-2 py-4 flex items-center">
          <span className="font-black text-[11px] tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#D60000' }}>
            Lieferservice
          </span>
        </div>
      </button>

      {/* Mobile: compact button bottom right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Lieferservice – 20% Rabatt"
        className="lg:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 bg-white shadow-2xl rounded-2xl px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors animate-bounce"
        style={{ borderLeft: '4px solid #D60000' }}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt="Da Corrado" width={48} height={18} sizes="48px" style={{ width: 48, height: 18, objectFit: 'contain' }} />
        ) : (
          <span className="font-black text-xs" style={{ color: '#D60000' }}>DC</span>
        )}
        <span className="font-black text-[10px] tracking-[0.2em] uppercase" style={{ color: '#D60000' }}>
          Lieferservice
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header band */}
            <div className="relative px-8 pt-8 pb-6 text-center" style={{ background: '#D60000' }}>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>

              {logoUrl && (
                <div className="w-32 h-20 relative mx-auto mb-4">
                  <Image src={logoUrl} alt="Da Corrado" fill className="object-contain brightness-0 invert" />
                </div>
              )}
              <p className="text-red-200 text-xs font-bold tracking-[0.3em] uppercase mb-2">Exklusiv für Sie</p>
              <h2 className="text-white text-5xl font-black leading-none">20%</h2>
              <p className="text-white font-bold text-xl mt-1">Rabatt</p>
            </div>

            {/* Coupon tear line */}
            <div className="relative flex items-center">
              <div className="w-6 h-6 rounded-full -ml-3 flex-shrink-0" style={{ background: '#f3f4f6' }} />
              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-1" />
              <div className="w-6 h-6 rounded-full -mr-3 flex-shrink-0" style={{ background: '#f3f4f6' }} />
            </div>

            {/* Coupon body */}
            <div className="px-8 py-6 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Tag size={14} style={{ color: '#06880c' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#06880c' }}>
                  Bei Direktbestellung
                </span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Bestellen Sie direkt über unsere Website und sparen Sie{' '}
                <strong>20% auf Ihre gesamte Bestellung</strong> – ohne Zwischenhändler, schnell & einfach!
              </p>

              <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-6 text-left border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#06880c' }}>🎉 Immer neue Aktionen!</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Bei uns gibt es regelmäßig Sonderaktionen, saisonale Rabatte und exklusive Angebote für Direktbesteller. Lohnt sich, öfter vorbeizuschauen!
                </p>
              </div>

              <a
                href="https://bestellung.pizzeria1140.at"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-2xl text-base transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
                style={{ background: '#D60000' }}
                onClick={() => setOpen(false)}
              >
                Jetzt bestellen & sparen
                <ExternalLink size={16} />
              </a>

              <p className="text-gray-400 text-xs mt-4">
                Gültig für Online-Bestellungen unter bestellung.pizzeria1140.at
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
