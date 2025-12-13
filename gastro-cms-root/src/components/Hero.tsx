'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Gastro CMS 3.0 - Nur 10% Provision
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-4xl mx-auto">
            Schluss mit bis zu 30% Provisionen! Gastro CMS 3.0 macht dein Geschäft unabhängig – ob Restaurant, Lebensmittelhändler, Obsthändler oder andere Betriebe mit Lieferservice – mit nur 10% fixen Kosten, eigener Domain, PWA-Apps und vollständiger Kontrolle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="#calculator" 
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover-lift shadow-lg"
            >
              💰 Kosten berechnen
            </Link>
            <Link 
              href="/bestellung" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover-lift"
            >
              🚀 Jetzt bestellen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
