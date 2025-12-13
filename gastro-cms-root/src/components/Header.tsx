'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header id="navigation" className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 w-full" role="banner">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/logo.png" 
                  alt="Gastro CMS 3.0 Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    // Fallback falls Logo nicht existiert
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <span className="hidden text-2xl font-bold text-gradient font-display">
                  Gastro CMS 3.0
                </span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <div className="relative group">
                <button 
                  className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-label="Features-Menü öffnen"
                >
                  Features
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                  role="menu"
                  aria-label="Features-Untermenü"
                >
                    <div className="py-2">
                      <Link href="/features/lieferung" className={`block px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${pathname.includes('/features/lieferung') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-700'}`} role="menuitem">
                        Lieferung & Takeaway
                      </Link>
                    <Link href="/features/payment" className={`block px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${pathname.includes('/features/payment') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-700'}`} role="menuitem">
                      PayPal & Stripe
                    </Link>
                    <Link href="/features/pwa" className={`block px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${pathname.includes('/features/pwa') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-700'}`} role="menuitem">
                      PWA Apps
                    </Link>
                    <Link href="/features/reservierung" className={`block px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${pathname.includes('/features/reservierung') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-700'}`} role="menuitem">
                      Reservierungssystem
                    </Link>
                    <Link href="/roadmap" className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-200 mt-2 pt-2">
                      🚀 Roadmap & Updates
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/preise" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/preise') ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                Preise
              </Link>
              <a href="#calculator" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Rechner
              </a>
              <a href="#faq" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                FAQ
              </a>
              <a href="#contact" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Kontakt
              </a>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Link href="/bestellung" className="bg-gradient-brand text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover-lift">
                    Jetzt bestellen
                  </Link>
                  <Link href="/termin" className="bg-transparent border-2 border-brand-600 text-brand-600 px-6 py-2 rounded-lg font-semibold hover:bg-brand-600 hover:text-white transition-all duration-300">
                    Termin vereinbaren
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Navigation schließen" : "Navigation öffnen"}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200" role="navigation" aria-label="Mobile Navigation">
              <div className="text-gray-600 px-3 py-2 text-base font-medium">
                Features
              </div>
              <div className="pl-6 space-y-1">
                <Link href="/features/lieferung" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/features/lieferung' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                  Lieferung & Takeaway
                </Link>
                <Link href="/features/payment" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/features/payment' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                  PayPal & Stripe
                </Link>
                <Link href="/features/pwa" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/features/pwa' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                  PWA Apps
                </Link>
                <Link href="/features/reservierung" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/features/reservierung' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                  Reservierungssystem
                </Link>
                <Link href="/roadmap" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-brand-600 border-t border-gray-200 mt-2 pt-2">
                  🚀 Roadmap & Updates
                </Link>
              </div>
              <Link href="/preise" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/preise' ? 'text-brand-600 bg-brand-50' : 'text-gray-600 hover:text-brand-600'}`}>
                Preise
              </Link>
              <a href="https://gastro-cms.at#calculator" className="text-gray-600 hover:text-brand-600 block px-3 py-2 rounded-md text-base font-medium">
                Rechner
              </a>
              <a href="https://gastro-cms.at#faq" className="text-gray-600 hover:text-brand-600 block px-3 py-2 rounded-md text-base font-medium">
                FAQ
              </a>
              <a href="https://gastro-cms.at#contact" className="text-gray-600 hover:text-brand-600 block px-3 py-2 rounded-md text-base font-medium">
                Kontakt
              </a>
              <div className="space-y-2 pt-2">
                <Link href="/bestellung" className="bg-gradient-brand text-white block px-3 py-2 rounded-md text-base font-medium text-center">
                  Jetzt bestellen
                </Link>
                <Link href="/termin" className="bg-transparent border-2 border-brand-600 text-brand-600 block px-3 py-2 rounded-md text-base font-medium text-center">
                  Termin vereinbaren
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
