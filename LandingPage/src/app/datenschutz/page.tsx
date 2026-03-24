import { prisma } from '@/lib/db'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Pizzeria Da Corrado 1140 Wien',
  robots: { index: false },
}

async function getData() {
  const [page, socialLinks, settingsArr] = await Promise.all([
    prisma.legalPage.findUnique({ where: { type: 'datenschutz' } }),
    prisma.socialMedia.findMany({ where: { active: true } }),
    prisma.settings.findMany(),
  ])
  const settings = settingsArr.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {} as Record<string, string>)
  return { page, socialLinks, settings }
}

export default async function DatenschutzPage() {
  const { page, socialLinks, settings } = await getData()

  return (
    <>
      <Header logoUrl={settings.logo_url} socialLinks={socialLinks} phone={settings.restaurant_phone} />
      <main className="pt-24 pb-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-10 mb-10 text-white">
            <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">Rechtliches</p>
            <h1 className="text-4xl md:text-5xl font-black">Datenschutz&shy;erklärung</h1>
            <p className="text-gray-400 mt-3 text-sm">Gemäß DSGVO (Datenschutz-Grundverordnung) und DSG (Datenschutzgesetz)</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
            {page?.content ? (
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-a:text-red-600"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <h2>1. Datenschutz auf einen Blick</h2>
                <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.</p>
                <h2>2. Verantwortliche Stelle</h2>
                <p>{settings.restaurant_name || 'Pizzeria Da Corrado'}<br />{settings.restaurant_address || 'Linzer Straße'}, 1140 Wien<br />E-Mail: {settings.restaurant_email || 'kontakt@pizzeria1140.at'}</p>
                <h2>3. Ihre Rechte</h2>
                <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger. Weiters haben Sie das Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.</p>
                <h2>4. Kontaktformular</h2>
                <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zum Zweck der Bearbeitung der Anfrage gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
                <h2>5. Cookies</h2>
                <p>Diese Website verwendet keine Tracking-Cookies. Es werden ausschließlich technisch notwendige Session-Cookies verwendet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer settings={settings} socialLinks={socialLinks} />
    </>
  )
}
