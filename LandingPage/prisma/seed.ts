import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('ComPaq1987!', 12)
  await prisma.user.upsert({
    where: { email: 'office@nextpuls.com' },
    update: {},
    create: {
      email: 'office@nextpuls.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  // Default settings
  const defaultSettings = [
    { key: 'site_title', value: 'Pizzeria Da Corrado | 1140 Wien' },
    { key: 'site_description', value: 'Pizzeria Da Corrado in 1140 Wien - Authentische italienische Küche, Pizza, Pasta, Burger und mehr. Lieferservice und Tischreservierung.' },
    { key: 'logo_url', value: '' },
    { key: 'restaurant_name', value: 'Pizzeria Da Corrado' },
    { key: 'restaurant_address', value: 'Linzer Straße, 1140 Wien' },
    { key: 'restaurant_phone', value: '' },
    { key: 'restaurant_email', value: 'kontakt@pizzeria1140.at' },
    { key: 'restaurant_lat', value: '48.1985' },
    { key: 'restaurant_lng', value: '16.2989' },
    { key: 'opening_hours', value: JSON.stringify([
      { day: 'Montag', open: '11:00', close: '22:00', closed: false },
      { day: 'Dienstag', open: '11:00', close: '22:00', closed: false },
      { day: 'Mittwoch', open: '11:00', close: '22:00', closed: false },
      { day: 'Donnerstag', open: '11:00', close: '22:00', closed: false },
      { day: 'Freitag', open: '11:00', close: '22:30', closed: false },
      { day: 'Samstag', open: '11:00', close: '22:30', closed: false },
      { day: 'Sonntag', open: '11:00', close: '23:00', closed: false },
    ])},
    { key: 'og_image', value: '' },
    { key: 'google_analytics', value: '' },
  ]

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value },
    })
  }

  // Default service cards
  const serviceCards = [
    { headline: 'Lieferservice', text: 'Unser schneller Lieferservice bringt Ihre Lieblingsgerichte direkt zu Ihnen nach Hause!', imageUrl: '/uploads/Da-Corrado-Lieferservice.webp', imageAlt: 'Lieferservice Pizzeria Da Corrado', order: 1 },
    { headline: 'Weine', text: 'Unverwechselbarer Geschmack und höchste Qualität – ein wahrer Genuss! Reservieren Sie heute noch einen Tisch bei uns.', imageUrl: '/uploads/Wein.webp', imageAlt: 'Weine Da Corrado', order: 2 },
    { headline: 'Schnitzel', text: 'Unsere Schnitzel und Cordon Bleu werden aus hochwertigem Fleisch zubereitet und goldbraun gebraten – ein unvergleichlicher Genuss!', imageUrl: '/uploads/Wiener-Schnitzel-scaled.jpg', imageAlt: 'Wiener Schnitzel Da Corrado', order: 3 },
    { headline: 'Fisch', text: 'Unsere Fischspezialitäten sind fangfrisch und meisterhaft zubereitet – ein wahrer Genuss für Fischliebhaber!', imageUrl: '/uploads/Fischgerichte.jpg', imageAlt: 'Fischgerichte Da Corrado', order: 4 },
    { headline: 'Pasta', text: 'Spaghetti ist eine der bekanntesten Pastasorten und besteht aus Hartweizengriß und Wasser. Sie werden oft mit verschiedenen Saucen wie Bolognese oder Carbonara serviert und sind weltweit beliebt.', imageUrl: '/uploads/Spaghetti-scaled.jpg', imageAlt: 'Pasta Da Corrado', order: 5 },
  ]

  for (const card of serviceCards) {
    await prisma.serviceCard.create({ data: card })
  }

  // Default social media
  await prisma.socialMedia.createMany({
    data: [
      { platform: 'Facebook', url: 'https://www.facebook.com/pizzeria1140', icon: 'facebook', order: 1 },
    ],
    skipDuplicates: true,
  })

  // Default legal pages
  await prisma.legalPage.upsert({
    where: { type: 'impressum' },
    update: {},
    create: {
      type: 'impressum',
      content: `<h1>Impressum</h1>
<h2>Angaben gemäß § 5 ECG</h2>
<p><strong>Pizzeria Da Corrado</strong><br>
Linzer Straße<br>
1140 Wien<br>
Österreich</p>
<p>E-Mail: kontakt@pizzeria1140.at</p>
<h2>Unternehmensgegenstand</h2>
<p>Gastronomie / Restaurant</p>
<h2>Haftungsausschluss</h2>
<p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>`,
    },
  })

  await prisma.legalPage.upsert({
    where: { type: 'datenschutz' },
    update: {},
    create: {
      type: 'datenschutz',
      content: `<h1>Datenschutzerklärung</h1>
<h2>1. Datenschutz auf einen Blick</h2>
<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.</p>
<h2>2. Verantwortliche Stelle</h2>
<p>Pizzeria Da Corrado<br>Linzer Straße, 1140 Wien<br>E-Mail: kontakt@pizzeria1140.at</p>
<h2>3. Ihre Rechte</h2>
<p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.</p>
<h2>4. Kontaktformular</h2>
<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zum Zweck der Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>`,
    },
  })

  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
