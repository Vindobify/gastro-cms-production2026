'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold font-display mb-4 text-gradient">
              Gastro CMS 3.0
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Lieferservice neu gedacht – mit nur 10% Provision, eigener Domain und PWA-Apps. 
              Mach dein Geschäft unabhängig von den großen Plattformen – ob Restaurant, Lebensmittelhandel, Obsthandel oder andere Betriebe mit Lieferservice.
            </p>
            <div className="space-y-2 text-gray-300">
              <p>📍 Markt 141, 2572 Kaumberg, Österreich</p>
              <p>📧 office@gastro-cms.at</p>
              <p>📱 +43 660 546 78 06</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Schnellzugriff</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#calculator" className="text-gray-300 hover:text-white transition-colors">
                  Kostenrechner
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </a>
              </li>
              <li>
                <Link href="/bestellung" className="text-gray-300 hover:text-white transition-colors">
                  Bestellen
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="text-gray-300 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-300 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-gray-300 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          {/* Compliance Badges */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-white">Rechtliches & Datenschutz</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const event = new CustomEvent('cc:reopen')
                  window.dispatchEvent(event)
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Cookie-Einstellungen öffnen"
              >
                🍪 Cookie-Einstellungen
              </button>
              
              <a
                href="/datenschutz"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Datenschutzerklärung öffnen"
              >
                🔒 Datenschutz
              </a>
              
              <a
                href="/agb"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="AGB öffnen"
              >
                📋 AGB
              </a>
              
              <a
                href="/datenauskunft"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Datenauskunft öffnen"
              >
                📊 Datenauskunft
              </a>
              
              <a
                href="/cookies"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Cookie-Management öffnen"
              >
                ⚙️ Cookie-Management
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 NextPuls Digital - Mario Gaupmann. Alle Rechte vorbehalten.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ in Österreich</span>
              <span className="text-green-400 font-semibold">✅ 100% DSGVO & Barrierefrei</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
