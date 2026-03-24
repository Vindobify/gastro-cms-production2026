import { prisma } from '@/lib/db'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Impressum | Pizzeria Da Corrado 1140 Wien',
  robots: { index: false },
}

async function getData() {
  const [page, socialLinks, settingsArr] = await Promise.all([
    prisma.legalPage.findUnique({ where: { type: 'impressum' } }),
    prisma.socialMedia.findMany({ where: { active: true } }),
    prisma.settings.findMany(),
  ])
  const settings = settingsArr.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {} as Record<string, string>)
  return { page, socialLinks, settings }
}

export default async function ImpressumPage() {
  const { page, socialLinks, settings } = await getData()

  return (
    <>
      <Header logoUrl={settings.logo_url} socialLinks={socialLinks} phone={settings.restaurant_phone} />
      <main className="pt-24 pb-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-3xl p-10 mb-10 text-white">
            <p className="text-red-200 text-xs font-semibold tracking-widest uppercase mb-2">Rechtliches</p>
            <h1 className="text-4xl md:text-5xl font-black">Impressum</h1>
            <p className="text-red-200 mt-3 text-sm">Gemäß § 5 ECG (E-Commerce-Gesetz) und § 25 MedienG</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
            {page?.content ? (
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <h2>Angaben gemäß § 5 ECG</h2>
                <p><strong>{settings.restaurant_name || 'Pizzeria Da Corrado'}</strong><br />
                {settings.restaurant_address || 'Linzer Straße'}<br />
                1140 Wien, Österreich</p>
                {settings.restaurant_phone && <p><strong>Telefon:</strong> <a href={`tel:${settings.restaurant_phone}`}>{settings.restaurant_phone}</a></p>}
                {settings.restaurant_email && <p><strong>E-Mail:</strong> <a href={`mailto:${settings.restaurant_email}`}>{settings.restaurant_email}</a></p>}
                <h2>Unternehmensgegenstand</h2>
                <p>Gastronomie / Restaurant</p>
                <h2>Haftungsausschluss</h2>
                <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer settings={settings} socialLinks={socialLinks} />
    </>
  )
}
