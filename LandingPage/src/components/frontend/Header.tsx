'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Facebook, ChevronRight, Phone, PhoneCall } from 'lucide-react'

interface HeaderProps {
  logoUrl?: string | null
  socialLinks?: { platform: string; url: string; icon?: string | null }[]
  phone?: string
}

export default function Header({ logoUrl, socialLinks = [], phone }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* Von Unterseiten (Impressum, Datenschutz) immer zuerst zur Startseite, dann Anker */
  const navLinks = [
    { href: '/#speisekarte', label: 'Speisekarte' },
    { href: '/#angebot', label: 'Angebot' },
    { href: '/#galerie', label: 'Restaurant' },
    { href: '/#reservierung', label: 'Tischreservierung' },
  ]

  const facebookLink = socialLinks.find(s => s.platform.toLowerCase() === 'facebook')

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Pizzeria Da Corrado"
                  width={150}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain max-h-12"
                />
              ) : (
                <div className="font-bold text-xl">
                  <span style={{ color: '#D60000' }}>Da</span>{' '}
                  <span style={{ color: '#06880c' }}>Corrado</span>
                </div>
              )}
            </Link>

            <nav className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {facebookLink && (
                <a href={facebookLink.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  <Facebook size={20} />
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-full transition-colors"
                  style={{ background: '#D60000' }}
                >
                  <PhoneCall size={14} />
                  {phone}
                </a>
              )}
            </nav>

            <div className="lg:hidden flex items-center gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-full"
                  style={{ background: '#D60000' }}
                >
                  <PhoneCall size={13} />
                  {phone}
                </a>
              )}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menü öffnen"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-in drawer from right */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#f0f0f0' }}>
          {logoUrl ? (
            <Image src={logoUrl} alt="Da Corrado" width={120} height={40} className="h-9 w-auto object-contain" />
          ) : (
            <span className="font-black text-lg" style={{ color: '#D60000' }}>Da Corrado</span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menü schließen"
          >
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-6 py-4 text-gray-800 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span>{link.label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-6 border-t" style={{ borderColor: '#f0f0f0' }}>
          <Link
            href="/#reservierung"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-2xl text-sm transition-all hover:opacity-90"
            style={{ background: '#D60000' }}
          >
            <Phone size={16} />
            Tisch reservieren
          </Link>
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 mt-3 w-full border-2 font-bold py-3.5 rounded-2xl text-sm transition-all hover:bg-red-50"
              style={{ borderColor: '#D60000', color: '#D60000' }}
            >
              <PhoneCall size={16} />
              {phone}
            </a>
          )}
          {facebookLink && (
            <a
              href={facebookLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 text-blue-600 font-medium text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Facebook size={16} /> Facebook
            </a>
          )}
          <p className="text-center text-gray-400 text-xs mt-4">Pizzeria Da Corrado · 1140 Wien</p>
        </div>
      </div>
    </>
  )
}
