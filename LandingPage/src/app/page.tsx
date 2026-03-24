import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settingsArr = await prisma.settings.findMany()
    const settings = settingsArr.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {} as Record<string, string>)
    return buildPageMetadata(settings, {
      title: settings.site_title || 'Pizzeria Da Corrado | Authentische Italienische Küche · 1140 Wien',
      description: settings.site_description || 'Pizzeria Ristorante Da Corrado in 1140 Wien – Pizza, Pasta, Burger & mehr. Seit 1989. Jetzt online bestellen oder Tisch reservieren.',
      path: '/',
    })
  } catch {
    return {
      title: 'Pizzeria Da Corrado | 1140 Wien',
      description: 'Authentische Italienische Küche in 1140 Wien',
    }
  }
}

import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'
import HeroSlideshow from '@/components/frontend/HeroSlideshow'
import DualCarousel from '@/components/frontend/DualCarousel'
import ServiceCards from '@/components/frontend/ServiceCards'
import RestaurantGallery from '@/components/frontend/RestaurantGallery'
import ReservationForm from '@/components/frontend/ReservationForm'

async function getData() {
  try {
    const [slides, carouselImages, serviceCards, restaurantImages, socialLinks, settingsArr, speisekarte] = await Promise.all([
      prisma.slideshowImage.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      prisma.carouselImage.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      prisma.serviceCard.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      prisma.restaurantImage.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 50 }),
      prisma.socialMedia.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      prisma.settings.findMany(),
      prisma.speisekarte.findFirst(),
    ])
    const settings = settingsArr.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {} as Record<string, string>)
    return { slides, carouselImages, serviceCards, restaurantImages, socialLinks, settings, speisekarte }
  } catch {
    return { slides: [], carouselImages: [], serviceCards: [], restaurantImages: [], socialLinks: [], settings: {}, speisekarte: null }
  }
}

export default async function HomePage() {
  const { slides, carouselImages, serviceCards, restaurantImages, socialLinks, settings, speisekarte } = await getData()

  return (
    <>
      <Header logoUrl={settings.logo_url} socialLinks={socialLinks} phone={settings.restaurant_phone} />
      <main className="pt-16">
        <HeroSlideshow slides={slides} />

        {/* Speisekarte Section */}
        {speisekarte && (
          <section id="speisekarte" className="py-16 bg-white">
            <div className="max-w-8xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  {speisekarte.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={speisekarte.imageUrl}
                        alt="Speisekarte Pizzeria Da Corrado"
                        width={1200}
                        height={800}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="w-full h-auto"
                      />
                      {speisekarte.pdfUrl && (
                        <a
                          href={speisekarte.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <span className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold">
                            PDF ansehen
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-6">{speisekarte.title}</h2>
                  {speisekarte.description && (
                    <div className="text-gray-600 leading-relaxed prose" dangerouslySetInnerHTML={{ __html: speisekarte.description }} />
                  )}
                  {speisekarte.pdfUrl && (
                    <a
                      href={speisekarte.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                    >
                      Speisekarte als PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dual Carousel */}
        <DualCarousel images={carouselImages} />

        {/* Service Cards */}
        <section id="angebot">
          <ServiceCards cards={serviceCards} />
        </section>

        {/* Restaurant Images */}
        <section id="galerie">
          <RestaurantGallery images={restaurantImages} />
        </section>

        {/* Tischreservierung */}
        <section id="reservierung" className="py-20 bg-gray-950">
          <div className="max-w-8xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-red-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">Direkt online</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Tisch reservieren</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Reservieren Sie jetzt Ihren Tisch – schnell, einfach und kostenlos.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ReservationForm />
            </div>
          </div>
        </section>

      </main>
      <Footer settings={settings} socialLinks={socialLinks} />
    </>
  )
}
