import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Features & Funktionen | Gastro CMS Österreich',
  description: 'Entdecken Sie alle Features von Gastro CMS 3.0: Online-Bestellung, Lieferung & Takeaway, PayPal & Stripe, PWA Apps, Kassensystem-Integration und mehr.',
  keywords: [
    'gastro cms features',
    'restaurant software funktionen',
    'online bestellung features',
    'lieferung takeaway',
    'paypal stripe integration',
    'pwa apps restaurant',
    'kassensystem integration',
    'reservierungssystem',
    'gastro cms funktionen'
  ],
  openGraph: {
    title: 'Features & Funktionen | Gastro CMS Österreich',
    description: 'Entdecken Sie alle Features von Gastro CMS 3.0: Online-Bestellung, Lieferung & Takeaway, PayPal & Stripe, PWA Apps und mehr.',
    type: 'website',
    url: 'https://gastro-cms.at/features',
    siteName: 'Gastro CMS 3.0',
    locale: 'de_AT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features & Funktionen | Gastro CMS Österreich',
    description: 'Entdecken Sie alle Features von Gastro CMS 3.0: Online-Bestellung, Lieferung & Takeaway, PayPal & Stripe, PWA Apps und mehr.',
  },
  alternates: {
    canonical: 'https://gastro-cms.at/features',
    languages: {
      'de-AT': 'https://gastro-cms.at/features',
    },
  },
}

export default function FeaturesPage() {
  const features = [
    {
      title: 'Lieferung & Takeaway',
      description: 'Vollständiges Liefer- und Takeaway-System mit automatischer Gebührenberechnung und Liefergebiet-Management.',
      href: '/features/lieferung',
      icon: '🚚',
      status: 'Verfügbar',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      title: 'PayPal & Stripe Integration',
      description: 'Sichere Zahlungsabwicklung mit automatischer Split-Zahlung und Provision-Abrechnung.',
      href: '/features/payment',
      icon: '💳',
      status: 'Verfügbar',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      title: 'Kassensystem Integration',
      description: 'Nahtlose Integration mit bestehenden Kassensystemen für automatische Synchronisation.',
      href: '/features/kassensystem',
      icon: '🏪',
      status: 'In Entwicklung',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'PWA Apps',
      description: 'Progressive Web Apps für Kunden und Lieferanten - installierbar auf allen Geräten.',
      href: '/features/pwa',
      icon: '📱',
      status: 'Verfügbar',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      title: 'Reservierungssystem',
      description: 'Online-Reservierungen für Restaurants mit automatischer Tischverwaltung.',
      href: '/features/reservierung',
      icon: '📅',
      status: 'Verfügbar',
      statusColor: 'bg-green-100 text-green-800'
    }
  ]

  return (
    <main id="main-content" className="min-h-screen bg-gray-50" role="main">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-6">
              Features & Funktionen
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Entdecken Sie alle Funktionen von Gastro CMS 3.0 - dem umfassenden Lieferservice-System 
              für moderne Restaurants, Lebensmittelhändler, Obsthändler und andere Betriebe, die ihren Kunden einen Lieferservice anbieten möchten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/bestellung" 
                className="bg-gradient-brand text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover-lift"
              >
                Jetzt bestellen
              </Link>
              <Link 
                href="/termin" 
                className="bg-transparent border-2 border-brand-600 text-brand-600 px-8 py-4 rounded-lg font-semibold hover:bg-brand-600 hover:text-white transition-all duration-300"
              >
                Termin vereinbaren
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift p-8 border border-gray-100"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${feature.statusColor}`}>
                    {feature.status}
                  </span>
                  <span className="text-brand-600 font-medium group-hover:text-brand-700">
                    Mehr erfahren →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Roadmap Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🚀 Roadmap & Updates
              </h2>
              <p className="text-lg text-gray-600">
                Sehen Sie, was als nächstes kommt und welche Features in Entwicklung sind.
              </p>
            </div>
            <div className="text-center">
              <Link 
                href="/roadmap"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Roadmap ansehen
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Pricing CTA */}
          <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Bereit für den Start?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Nur 10% Provision statt bis zu 30% - Jährlich nur €180 + eigene Domain inklusive
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/preise"
                className="bg-white text-brand-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Preise ansehen
              </Link>
              <Link 
                href="/bestellung"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-600 transition-all duration-300"
              >
                Jetzt bestellen
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
