import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react'

interface FooterProps {
  settings?: Record<string, string>
  socialLinks?: { platform: string; url: string; icon?: string | null }[]
}

type HourRow = { day: string; open: string; close: string; closed: boolean }

function getOpeningHours(settings: Record<string, string>): HourRow[] {
  try {
    if (!settings.opening_hours) return []
    const raw = JSON.parse(settings.opening_hours) as unknown[]
    if (!Array.isArray(raw)) return []
    return raw.map((row): HourRow => {
      const r = row as Record<string, unknown>
      const day =
        typeof r.day === 'string'
          ? r.day
          : typeof r.key === 'string'
            ? r.key
            : ''
      return {
        day,
        open: typeof r.open === 'string' ? r.open : '11:00',
        close: typeof r.close === 'string' ? r.close : '22:00',
        closed: Boolean(r.closed),
      }
    })
  } catch {
    return []
  }
}

export default function Footer({ settings = {}, socialLinks = [] }: FooterProps) {
  const hours = getOpeningHours(settings)
  const restaurantName = settings.restaurant_name || 'Pizzeria Da Corrado'

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook size={18} />
      case 'instagram': return <Instagram size={18} />
      case 'youtube': return <Youtube size={18} />
      default: return <span className="text-xs font-bold">{platform[0]}</span>
    }
  }

  const getSocialColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'hover:bg-blue-600'
      case 'instagram': return 'hover:bg-pink-600'
      case 'youtube': return 'hover:bg-red-600'
      case 'tiktok': return 'hover:bg-gray-700'
      default: return 'hover:bg-gray-600'
    }
  }

  return (
    <footer className="bg-gray-950 text-white">
      {/* Top bar */}
      <div className="bg-red-700 py-3">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 flex items-center justify-center text-sm">
          <p className="text-red-100">
            <span className="font-semibold text-white">Tischreservierung:</span>{' '}
            {settings.restaurant_phone ? (
              <a href={`tel:${settings.restaurant_phone}`} className="text-white hover:underline">{settings.restaurant_phone}</a>
            ) : 'Bitte anrufen'}
          </p>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={restaurantName}
                width={220}
                height={56}
                sizes="220px"
                className="h-14 w-auto mb-6 brightness-0 invert"
              />
            ) : (
              <div className="mb-6">
                <p className="text-xs text-red-400 font-semibold tracking-widest uppercase">Pizzeria Ristorante</p>
                <h3 className="text-3xl font-black text-white leading-tight">Da<br /><span className="text-red-500">Corrado</span></h3>
              </div>
            )}
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Authentische italienische Küche im Herzen von 1140 Wien. Seit Jahren Ihr Lieblingsrestaurant für Pizza, Pasta, Burger und mehr.
            </p>
            {/* Social */}
            {socialLinks.length > 0 && (
              <div className="flex gap-2">
                {socialLinks.map((link, i) => (
                  <a
                    key={`${link.platform}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 bg-gray-800 ${getSocialColor(link.platform)} rounded-full flex items-center justify-center transition-colors`}
                    aria-label={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 pb-3 border-b border-gray-800">Navigation</h4>
            <nav className="space-y-3">
              {[
                { href: '/', label: 'Startseite' },
                { href: '/#speisekarte', label: 'Speisekarte' },
                { href: '/#angebot', label: 'Unser Angebot' },
                { href: '/#galerie', label: 'Restaurant' },
                { href: '/#reservierung', label: 'Tischreservierung' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="block text-gray-400 hover:text-white hover:pl-1 transition-all text-sm">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 pb-3 border-b border-gray-800">Kontakt</h4>
            <div className="space-y-4">
              {settings.restaurant_address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.restaurant_address + ', Wien')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0 group-hover:text-red-400" />
                  <span className="text-sm">{settings.restaurant_address}<br />Wien, Österreich</span>
                </a>
              )}
              {settings.restaurant_phone && (
                <a href={`tel:${settings.restaurant_phone}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Phone size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm">{settings.restaurant_phone}</span>
                </a>
              )}
              {settings.restaurant_email && (
                <a href={`mailto:${settings.restaurant_email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Mail size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm">{settings.restaurant_email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 pb-3 border-b border-gray-800">
              <Clock size={14} className="inline mr-2 text-red-500" />
              Öffnungszeiten
            </h4>
            {hours.length > 0 ? (
              <div className="space-y-2">
                {hours.map((h: HourRow, i: number) => (
                  <div key={`${h.day}-${i}`} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-24">{h.day}</span>
                    {h.closed ? (
                      <span className="text-red-400 font-medium">Geschlossen</span>
                    ) : (
                      <span className="text-gray-300 whitespace-nowrap">{h.open} – {h.close}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Mo–So: 11:00 – 22:00</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm text-center">
            © {new Date().getFullYear()} {restaurantName}. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/impressum" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
