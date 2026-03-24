'use client'

import Image from 'next/image'

interface CarouselImage {
  id: number
  url: string
  altText?: string | null
  title?: string | null
}

export default function DualCarousel({ images }: { images: CarouselImage[] }) {
  if (!images.length) return null

  const doubled = [...images, ...images, ...images]

  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="mb-8 overflow-hidden">
        <div className="flex animate-scroll-left gap-4" style={{ width: `${doubled.length * 280}px` }}>
          {doubled.map((image, index) => (
            <div key={`top-${index}`} className="flex-shrink-0 w-64">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText || image.title || 'Da Corrado'}
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              {image.title && (
                <p className="text-center text-xs text-gray-500 mt-2 truncate px-1">{image.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-scroll-right gap-4" style={{ width: `${doubled.length * 280}px` }}>
          {[...doubled].reverse().map((image, index) => (
            <div key={`bottom-${index}`} className="flex-shrink-0 w-64">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText || image.title || 'Da Corrado'}
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              {image.title && (
                <p className="text-center text-xs text-gray-500 mt-2 truncate px-1">{image.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
