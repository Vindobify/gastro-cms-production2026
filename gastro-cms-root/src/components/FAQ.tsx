'use client'

import React, { useState } from 'react'

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "Was ist Gastro CMS 3.0?",
      answer: "Gastro CMS 3.0 ist eine vollständige Lieferservice-Lösung für Restaurants. Es bietet eine eigene Website, PWA-Apps für Kunden und Lieferanten, sowie alle notwendigen Funktionen für Bestellmanagement, Kundenverwaltung und Zahlungsabwicklung – alles mit nur 10% Provision."
    },
    {
      question: "Warum nur 10% Provision statt 30%?",
      answer: "Wir sind ein österreichisches Unternehmen und haben keine teuren Marketing-Kampagnen oder internationale Strukturen zu finanzieren. Unser Fokus liegt auf der Entwicklung und dem Support für lokale Restaurants, nicht auf Gewinnmaximierung."
    },
    {
      question: "Was ist eine PWA-App?",
      answer: "PWA steht für Progressive Web App. Das sind Apps, die wie normale Smartphone-Apps funktionieren, aber über den Browser installiert werden. Deine Kunden können sie auf ihrem Home-Bildschirm installieren und haben das gleiche Erlebnis wie bei einer nativen App."
    },
    {
      question: "Brauche ich technische Kenntnisse?",
      answer: "Nein! Wir kümmern uns um alles: Domain-Einrichtung, Hosting, App-Entwicklung und laufenden Support. Du musst dich nur um dein Restaurant kümmern – den Rest übernehmen wir."
    },
    {
      question: "Welche Zahlungsarten werden unterstützt?",
      answer: "Wir integrieren PayPal und Stripe, wodurch alle gängigen Zahlungsarten unterstützt werden: Kreditkarten, Bankomat, SEPA, Apple Pay, Google Pay und mehr. Deine Kunden können sicher und bequem bezahlen."
    },
    {
      question: "Wie funktioniert die Lieferanten-App?",
      answer: "Deine Lieferanten erhalten eine eigene App, über die sie neue Bestellungen sehen, den Status aktualisieren und mit den Kunden kommunizieren können. Push-Nachrichten sorgen dafür, dass keine Bestellung verpasst wird."
    },
    {
      question: "Gibt es eine Mindestvertragslaufzeit?",
      answer: "Nein! Du kannst jederzeit kündigen. Wir sind überzeugt von unserem Service und möchten, dass du aus Überzeugung bei uns bleibst, nicht wegen Verträgen."
    },
    {
      question: "Wie schnell kann ich starten?",
      answer: "Nach der Bestellung richten wir dein System innerhalb von 2-3 Werktagen ein. Du erhältst Zugang zu deinem Dashboard und kannst sofort mit der Konfiguration beginnen. Die Apps sind dann in wenigen Tagen verfügbar."
    }
  ]

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
            ❓ Häufige Fragen
          </h2>
          <p className="text-xl text-gray-600">
            Alles was du über Gastro CMS 3.0 wissen musst
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <span className={`text-2xl transition-transform ${openItems.includes(index) ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
