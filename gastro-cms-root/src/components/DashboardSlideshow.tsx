'use client'

import React, { useState, useEffect } from 'react'

interface Slide {
  id: number
  title: string
  description: string
  image: string
  features: string[]
  highlight?: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Dashboard Übersicht",
    description: "Behalten Sie den Überblick über Ihr Restaurant mit dem modernen Dashboard. Alle wichtigen Kennzahlen auf einen Blick.",
    image: "/1. Dashboard Start.png",
    features: [
      "Echtzeit-Übersicht aller wichtigen Kennzahlen",
      "Intuitive Navigation zwischen allen Bereichen",
      "Responsive Design für alle Geräte",
      "Schneller Zugriff auf alle Funktionen"
    ],
    highlight: "Ihr zentraler Kommandozentrale"
  },
  {
    id: 2,
    title: "Produktkatalog",
    description: "Verwalten Sie Ihren kompletten Produktkatalog mit Bildern, Preisen und Beschreibungen. Einfach und effizient.",
    image: "/2. Dashboard Produkte.png",
    features: [
      "Vollständige Produktverwaltung mit Bildern",
      "Automatische Preiskalkulation mit MwSt.",
      "Kategorie-basierte Organisation",
      "Allergene und Zusatzstoffe verwalten"
    ],
    highlight: "Ihre komplette Speisekarte digital"
  },
  {
    id: 3,
    title: "Kategorien organisieren",
    description: "Strukturieren Sie Ihre Produkte mit intelligenten Kategorien. Perfekt organisiert für Ihre Kunden.",
    image: "/3. Dashboard Kategorien.png",
    features: [
      "Flexible Kategorie-Struktur",
      "Automatische Sortierung",
      "SEO-optimierte Beschreibungen",
      "Mobile-optimierte Darstellung"
    ],
    highlight: "Perfekt strukturiert"
  },
  {
    id: 4,
    title: "Extras & Zusätze",
    description: "Verwalten Sie Extras, Zusätze und Sonderwünsche Ihrer Gäste. Alles personalisierbar und flexibel.",
    image: "/4. Dashboard Extras.png",
    features: [
      "Unbegrenzte Extra-Optionen",
      "Preisgestaltung pro Extra",
      "Allergene und Zusatzstoffe",
      "Automatische Berechnung"
    ],
    highlight: "Maximale Flexibilität"
  },
  {
    id: 5,
    title: "Kundenverwaltung",
    description: "Verwalten Sie alle Ihre Kunden zentral. Kontaktdaten, Bestellhistorie und Präferenzen an einem Ort.",
    image: "/5. Dashboard Kunden.png",
    features: [
      "Vollständige Kundenprofile",
      "Bestellhistorie pro Kunde",
      "Kundenpräferenzen speichern",
      "Direkter Kontakt per E-Mail"
    ],
    highlight: "Ihre Kunden im Fokus"
  },
  {
    id: 6,
    title: "Bestellungen verwalten",
    description: "Verwalten Sie alle Bestellungen effizient und übersichtlich. Von der Eingang bis zur Abrechnung - alles an einem Ort.",
    image: "/6. Dashboard Bestellungen.png",
    features: [
      "Live-Bestellungen in Echtzeit",
      "Automatische Kategorisierung",
      "Status-Tracking für jede Bestellung",
      "Export-Funktionen für die Buchhaltung"
    ],
    highlight: "Nie wieder Bestellungen verlieren"
  },
  {
    id: 7,
    title: "Gutscheine & Rabatte",
    description: "Erstellen und verwalten Sie Gutscheine und Rabattaktionen. Steigern Sie Ihre Kundenbindung.",
    image: "/7. Dashboard Gutscheine.png",
    features: [
      "Gutscheine erstellen und verwalten",
      "Rabattcodes generieren",
      "Gültigkeitszeiträume festlegen",
      "Automatische Anwendung im Warenkorb"
    ],
    highlight: "Mehr Umsatz durch Aktionen"
  },
  {
    id: 8,
    title: "DSGVO & Datenschutz",
    description: "DSGVO-konforme Verwaltung aller datenschutzrechtlichen Anfragen. Alles rechtssicher dokumentiert.",
    image: "/8. Dashboard DSGVO.png",
    features: [
      "Datenauskunftsanfragen verwalten",
      "Löschungsanträge bearbeiten",
      "Einwilligungen dokumentieren",
      "Automatische Compliance-Prüfung"
    ],
    highlight: "Rechtssicher und transparent"
  },
  {
    id: 9,
    title: "Einstellungen & Konfiguration",
    description: "Passen Sie Ihr System an Ihre Bedürfnisse an. Von E-Mail-Einstellungen bis zu Zahlungsmethoden.",
    image: "/9. Dashboard Einstellungen.png",
    features: [
      "Firmendaten verwalten",
      "E-Mail-Konfiguration",
      "Zahlungsmethoden einrichten",
      "Systemeinstellungen anpassen"
    ],
    highlight: "Alles nach Ihren Wünschen"
  },
  {
    id: 10,
    title: "Benutzerverwaltung",
    description: "Verwalten Sie alle Benutzer und deren Berechtigungen. Sicherheit und Zugriffskontrolle in einem.",
    image: "/10. Dashboard Benutzer.png",
    features: [
      "Benutzer erstellen und verwalten",
      "Rollenbasierte Berechtigungen",
      "Sichere Authentifizierung",
      "Aktivitätsprotokolle"
    ],
    highlight: "Sicherheit an erster Stelle"
  }
]

export default function DashboardSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlay(false)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-display mb-4">
            🎛️ Dashboard Features
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Entdecken Sie die mächtigen Funktionen Ihres Gastro CMS Dashboards. 
            Alles was Sie für die Verwaltung Ihres Restaurants brauchen.
          </p>
        </div>

        {/* Mobile-First Slideshow */}
        <div className="relative">
          {/* Main Slide Container */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden">
            
            {/* Image Section */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-50 flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl p-4">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Navigation Arrows - Mobile Optimized */}
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slide Info - Top Right */}
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <span className="text-xs md:text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {currentSlide + 1} / {slides.length}
                </span>
                {isAutoPlay && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Auto
                  </span>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-8 lg:p-12">
              {/* Title and Highlight */}
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {slides[currentSlide].title}
                </h3>
                {slides[currentSlide].highlight && (
                  <p className="text-lg md:text-xl text-blue-600 font-semibold mb-4">
                    {slides[currentSlide].highlight}
                  </p>
                )}
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>

              {/* Features - Mobile Optimized Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                {slides[currentSlide].features.map((feature, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm md:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button 
                  onClick={scrollToContact}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Termin vereinbaren
                </button>
              </div>
            </div>
          </div>

          {/* Slide Indicators - Bottom */}
          <div className="flex justify-center mt-4 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Controls - Bottom Right */}
          <div className="flex justify-center mt-4">
            <button
              onClick={toggleAutoPlay}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isAutoPlay
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isAutoPlay ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}