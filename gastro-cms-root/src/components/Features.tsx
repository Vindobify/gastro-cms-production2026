'use client'

import React from 'react'

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
            Warum Gastro CMS 3.0?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ein <strong>durchdachtes und hochprofessionelles Framework</strong>, das speziell für Lieferservices entwickelt wurde – 
            professionell konzipiert für <strong>Restaurants, Lebensmittelhändler, Obsthändler und alle anderen Geschäfte, die ihren Kunden einen Lieferservice anbieten möchten</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Nur 10% Provision</h3>
            <p className="text-gray-600">
              Statt 30% bei anderen Anbietern zahlst du nur 10% fixe Kosten – das sind 20% mehr Gewinn für dich!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Eigene Domain</h3>
            <p className="text-gray-600">
              Deine Kunden bestellen direkt über deine Website – keine Abhängigkeit von externen Plattformen.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">PWA Apps</h3>
            <p className="text-gray-600">
              Native App-Erlebnis für deine Kunden und Lieferanten – installierbar auf allen Geräten.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Push-Nachrichten</h3>
            <p className="text-gray-600">
              Sofortige Benachrichtigungen über neue Bestellungen – nie wieder eine Bestellung verpassen.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-red-50 to-rose-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kundenverwaltung</h3>
            <p className="text-gray-600">
              Vollständige Kundenverwaltung mit Bestellhistorie, Lieblingsgerichten und Treuepunkten.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Zahlungsintegration</h3>
            <p className="text-gray-600">
              PayPal und Stripe Integration für sichere Online-Zahlungen – alle Zahlungsarten unterstützt.
            </p>
          </div>

          {/* Community Development Banner */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 rounded-2xl hover-lift card-shadow">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-4 font-display">
                  Gemeinsam entwickeln wir das beste System!
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Unser <strong>professionelles Framework</strong> wird <strong>kontinuierlich weiterentwickelt</strong> durch unsere gemeinsame Community. 
                  <strong>Gemeinsam entwickeln wir die Funktionen</strong>, die du wirklich brauchst, und schaffen so 
                  das beste System für deine Lieferungen!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">📅 Wochenmenü + Bestellung</h4>
                    <p className="text-sm opacity-90">Wöchentlich wechselnde Menüs mit direkter Bestellmöglichkeit</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">⏰ Vorbestellungen</h4>
                    <p className="text-sm opacity-90">Kunden können für später vorbestellen</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">🏢 Firmenbestellungen</h4>
                    <p className="text-sm opacity-90">Spezielle Funktionen für Firmenkunden</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">💡 Deine Ideen</h4>
                    <p className="text-sm opacity-90">Was fehlt dir? Wir entwickeln es gemeinsam!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 7 - Benutzerverwaltung - jetzt in der dritten Reihe */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-8 rounded-2xl hover-lift card-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Benutzerverwaltung</h3>
            <p className="text-gray-600">
              Vollständige Benutzerverwaltung für Restaurant Manager, Lieferanten und Kunden mit rollenbasierten Berechtigungen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
