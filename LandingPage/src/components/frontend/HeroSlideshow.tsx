'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SlideImage {
  id: number
  url: string
  altText?: string | null
  title?: string | null
  description?: string | null
  link?: string | null
  imageRight?: string | null
}

export default function HeroSlideshow({ slides }: { slides: SlideImage[] }) {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback((index: number) => setCurrent(index), [])
  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo])
  const goPrev = () => goTo((current - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(goNext, 7000)
    return () => clearInterval(t)
  }, [goNext, slides.length])

  if (!slides.length) {
    return (
      <section className="relative h-screen bg-gray-950 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-transparent" />
        <div className="relative max-w-8xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-2xl">
            <p className="text-red-400 text-xs font-bold tracking-[0.4em] uppercase mb-6">Willkommen</p>
            <h1 className="text-6xl sm:text-8xl font-black text-white leading-none mb-6">
              Pizzeria<br /><span className="text-red-500">Da Corrado</span>
            </h1>
            <p className="text-gray-300 text-xl mb-10">Authentische Italienische Küche · 1140 Wien</p>
            <Link href="/tischreservierung"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105">
              Tisch reservieren
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const slide = slides[current]

  return (
    <section className="relative h-screen overflow-hidden bg-gray-950">
      {slides.map((s, i) => (
        <div key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={s.url} alt={s.altText || 'Pizzeria Da Corrado'} fill
            className="object-cover" priority={i === 0} sizes="100vw" />
          <div className={`absolute inset-0 ${s.imageRight
            ? 'bg-gradient-to-r from-black/85 via-black/60 to-black/20'
            : 'bg-gradient-to-t from-black/70 via-black/40 to-black/20'}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full max-w-8xl mx-auto px-6 sm:px-10 flex items-center">
        <div className="w-full flex items-center justify-between gap-8 lg:gap-16">

          {/* LEFT: Text */}
          <div className="flex-1 max-w-2xl">
            {slide.title && (
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-4 drop-shadow-xl">
                {slide.title}
              </h2>
            )}
            {slide.description && (
              <p className="text-gray-200 text-base sm:text-xl mb-8 leading-relaxed max-w-lg">
                {slide.description}
              </p>
            )}
            {slide.link && (
              <Link href={slide.link}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-2xl">
                Mehr erfahren
              </Link>
            )}
          </div>

          {/* RIGHT: Image */}
          {slide.imageRight && (
            <div className="hidden lg:flex flex-shrink-0">
              <div className="relative w-[380px] xl:w-[460px] h-[460px] xl:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image src={slide.imageRight} alt={slide.title || 'Da Corrado'}
                  fill className="object-cover" sizes="460px" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          <button onClick={goPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-3 sm:p-4 transition-all border border-white/20">
            <ChevronLeft size={22} />
          </button>
          <button onClick={goNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-3 sm:p-4 transition-all border border-white/20">
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-8 left-6 sm:left-10 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full h-2 ${i === current ? 'bg-white w-8' : 'bg-white/40 w-2'}`} />
            ))}
          </div>
          <div className="absolute bottom-8 right-6 sm:right-10 z-20 text-white/40 text-xs font-mono tracking-widest">
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>
        </>
      )}
    </section>
  )
}
