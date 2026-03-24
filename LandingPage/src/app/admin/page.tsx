import { prisma } from '@/lib/db'
import { Images, Calendar, Grid3X3, Gift } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [slides, reservations, carousel, services] = await Promise.all([
      prisma.slideshowImage.count(),
      prisma.reservation.count(),
      prisma.carouselImage.count(),
      prisma.serviceCard.count(),
    ])
    return { slides, reservations, carousel, services }
  } catch {
    return { slides: 0, reservations: 0, carousel: 0, services: 0 }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Slideshow Bilder', value: stats.slides, icon: Images, color: 'bg-blue-500' },
    { label: 'Reservierungen', value: stats.reservations, icon: Calendar, color: 'bg-green-500' },
    { label: 'Carousel Bilder', value: stats.carousel, icon: Grid3X3, color: 'bg-purple-500' },
    { label: 'Angebot Karten', value: stats.services, icon: Gift, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow p-6">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-gray-500 text-sm mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Willkommen im Admin Panel</h2>
        <p className="text-gray-600">Verwalten Sie hier alle Inhalte Ihrer Website. Nutzen Sie das Menü links für die Navigation.</p>
      </div>
    </div>
  )
}
