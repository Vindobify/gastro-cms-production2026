'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ExternalLink } from 'lucide-react'

interface ServiceCard {
  id: number
  headline: string
  text: string
  imageUrl?: string | null
  imageAlt?: string | null
  link?: string | null
}

function normalizeUtf8Text(value: string) {
  // Fixes common mojibake like "hÃ¶chste" -> "höchste" from legacy DB encodings.
  if (!/[ÃÂ]/.test(value)) return value
  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return value
  }
}

export default function ServiceCards({ cards }: { cards: ServiceCard[] }) {
  const [modal, setModal] = useState<ServiceCard | null>(null)

  if (!cards.length) return null

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-red-600 text-sm font-semibold tracking-[0.3em] uppercase mb-3">Was wir bieten</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">Unser Angebot</h2>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-2 lg:columns-3 gap-4 space-y-4">
          {cards.map((card, i) => {
            const tall = i === 0 || i === 4
            return (
              <div
                key={card.id}
                onClick={() => setModal(card)}
                className={`break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500 ${tall ? 'h-[300px] sm:h-[420px]' : 'h-[200px] sm:h-[280px]'}`}
              >
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.imageAlt || card.headline}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-base sm:text-2xl font-black mb-1 sm:mb-2 drop-shadow leading-tight">{normalizeUtf8Text(card.headline)}</h3>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3 hidden sm:block">
                    {normalizeUtf8Text(card.text)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {modal.imageUrl && (
              <div className="relative h-56 w-full">
                <Image src={modal.imageUrl} alt={modal.imageAlt || modal.headline} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{normalizeUtf8Text(modal.headline)}</h3>
                <button onClick={() => setModal(null)} className="ml-4 text-gray-400 hover:text-gray-700 flex-shrink-0">
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{normalizeUtf8Text(modal.text)}</p>
              {modal.link && (
                <a
                  href={modal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: '#D60000' }}
                >
                  <ExternalLink size={15} /> Mehr erfahren
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
