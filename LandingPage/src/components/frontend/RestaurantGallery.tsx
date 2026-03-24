'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
  id: number
  url: string
  altText: string
  title?: string | null
  description?: string | null
}

/** Nur volle Reihen zu je 3 Bildern – keine einzelnen „Lücken“ in der letzten Zeile. */
function imagesForGridOfThree(images: GalleryImage[]) {
  const n = Math.floor(images.length / 3) * 3
  return n > 0 ? images.slice(0, n) : []
}

export default function RestaurantGallery({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const gridImages = useMemo(() => imagesForGridOfThree(images), [images])

  if (!images.length) return null
  if (!gridImages.length) return null

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + gridImages.length) % gridImages.length : null))
  const next = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % gridImages.length : null))

  const current = lightboxIndex !== null ? gridImages[lightboxIndex] : null

  return (
    <>
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="text-center mb-12">
            <p className="text-red-600 text-sm font-semibold tracking-[0.3em] uppercase mb-3">Unser Lokal</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Restaurant Bilder</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {gridImages.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => openLightbox(index)}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                  {img.description && (
                    <p className="text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {img.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && current && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Bildergalerie"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
          >
            <X size={32} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
          >
            <ChevronRight size={28} />
          </button>

          <div
            className="relative max-w-5xl max-h-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={current.altText}
              width={1920}
              height={1080}
              unoptimized
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
            {(current.title || current.altText || current.description) && (
              <div className="text-center text-white max-w-xl px-4">
                {current.title && <h3 className="text-xl font-bold mb-1">{current.title}</h3>}
                {!current.title && <h3 className="text-lg font-semibold mb-1">{current.altText}</h3>}
                {current.description && <p className="text-gray-300 text-sm">{current.description}</p>}
              </div>
            )}
            <p className="text-white/40 text-xs">
              {lightboxIndex + 1} / {gridImages.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
