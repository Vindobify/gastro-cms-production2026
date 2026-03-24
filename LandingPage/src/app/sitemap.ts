import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://pizzeria1140.at'
  const now = new Date()
  let contentLastModified = now

  try {
    const [settings, legalPages, cards, slides, carousel, gallery, menu] = await Promise.all([
      prisma.settings.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.legalPage.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.serviceCard.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.slideshowImage.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.carouselImage.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.restaurantImage.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
      prisma.speisekarte.findMany({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 }),
    ])

    const allDates = [
      settings[0]?.updatedAt,
      legalPages[0]?.updatedAt,
      cards[0]?.updatedAt,
      slides[0]?.updatedAt,
      carousel[0]?.updatedAt,
      gallery[0]?.updatedAt,
      menu[0]?.updatedAt,
    ].filter((d): d is Date => d instanceof Date)

    if (allDates.length > 0) {
      contentLastModified = new Date(Math.max(...allDates.map((d) => d.getTime())))
    }
  } catch {
    contentLastModified = now
  }

  return [
    { url: base, lastModified: contentLastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/impressum`, lastModified: contentLastModified, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: contentLastModified, changeFrequency: 'monthly', priority: 0.2 },
  ]
}
