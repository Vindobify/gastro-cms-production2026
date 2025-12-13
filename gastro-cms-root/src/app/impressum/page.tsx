import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 font-display mb-8">
            Impressum & Datenschutz
          </h1>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Impressum</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Medieninhaber & Herausgeber</h3>
              <p className="text-gray-700 mb-2">
                <strong>NextPuls Digital e.U.</strong><br />
                Inhaber: Mario Gaupmann<br />
                Markt 141<br />
                2572 Kaumberg<br />
                Österreich
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Kontakt</h3>
              <p className="text-gray-700 mb-2">
                E-Mail: <a href="mailto:office@nextpuls.com" className="text-brand-600 hover:text-brand-700">office@nextpuls.com</a><br />
                Website: <a href="https://www.nextpuls.com" className="text-brand-600 hover:text-brand-700">www.nextpuls.com</a>
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Unternehmensangaben</h3>
              <p className="text-gray-700 mb-2">
                <strong>Unternehmensform:</strong> Einzelunternehmen<br />
                <strong>Gewerbebehörde:</strong> Bezirkshauptmannschaft Lilienfeld<br />
                <strong>Mitglied der:</strong> Wirtschaftskammer Niederösterreich
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rechtliche Hinweise & Haftungsausschluss</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Anwendbares Recht</h3>
              <p className="text-gray-700 mb-4">
                Diese Website und alle damit verbundenen Rechtsbeziehungen unterliegen ausschließlich 
                dem österreichischen Recht unter Ausschluss des UN-Kaufrechts (CISG). 
                Maßgeblich sind die Bestimmungen des österreichischen ABGB, UGB und des 
                österreichischen Datenschutzgesetzes (DSG) sowie der EU-DSGVO.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Gerichtsstand</h3>
              <p className="text-gray-700 mb-4">
                Für alle Streitigkeiten aus oder im Zusammenhang mit dieser Website ist ausschließlich 
                das sachlich zuständige Gericht am Sitz des Unternehmens (Bezirksgericht Lilienfeld) 
                zuständig. NextPuls Digital e.U. behält sich vor, auch andere Gerichtsstände zu wählen.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Haftungsausschluss für Inhalte</h3>
              <p className="text-gray-700 mb-4">
                Als Diensteanbieter sind wir gemäß § 17 E-Commerce-Gesetz (ECG) für eigene Inhalte 
                auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 18 bis 20 ECG 
                sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder 
                gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, 
                die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4. Haftungsausschluss für Links</h3>
              <p className="text-gray-700 mb-4">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                der Seiten verantwortlich.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">5. Urheberrecht</h3>
              <p className="text-gray-700 mb-4">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und 
                jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der 
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6. Markenrecht</h3>
              <p className="text-gray-700 mb-4">
                Alle auf dieser Website genannten und ggf. durch Dritte geschützten Marken- und 
                Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen 
                Markenrechts und den Besitzrechten der jeweiligen eingetragenen Eigentümer.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7. Datenschutz</h3>
              <p className="text-gray-700 mb-4">
                Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich. 
                Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies, 
                soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche 
                Zustimmung nicht an Dritte weitergegeben. Eine detaillierte Datenschutzerklärung 
                finden Sie unter <a href="/datenschutz" className="text-brand-600 hover:text-brand-700">/datenschutz</a>.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">8. Online-Streitbeilegung (OS-Plattform)</h3>
              <p className="text-gray-700 mb-4">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. 
                Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, 
                an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Allgemeine Geschäftsbedingungen</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Geltungsbereich</h3>
              <p className="text-gray-700 mb-4">
                Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen NextPuls Digital 
                und Kunden über die Nutzung von Gastro CMS 3.0.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Leistungen</h3>
              <p className="text-gray-700 mb-4">
                NextPuls Digital stellt eine vollständige Lieferservice-Lösung bereit, einschließlich 
                Website, PWA-Apps, Zahlungsintegration und Support. Die genauen Leistungen ergeben sich 
                aus dem jeweiligen Vertrag.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Preise und Zahlung</h3>
              <p className="text-gray-700 mb-4">
                Die Preise ergeben sich aus der aktuellen Preisliste. Alle Preise verstehen sich 
                zuzüglich der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt monatlich im Voraus.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4. Kündigung</h3>
              <p className="text-gray-700 mb-4">
                Der Vertrag kann mit einer Frist von 30 Tagen zum Monatsende gekündigt werden. 
                Das Kündigungsrecht bleibt unberührt.
              </p>
            </div>


            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Kontakt</h3>
              <p className="text-gray-700">
                Bei Fragen zu diesem Impressum oder unseren Geschäftsbedingungen 
                wenden Sie sich bitte an:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>NextPuls Digital e.U.</strong><br />
                Inhaber: Mario Gaupmann<br />
                Markt 141, 2572 Kaumberg, Österreich<br />
                E-Mail: <a href="mailto:office@nextpuls.com" className="text-brand-600 hover:text-brand-700">office@nextpuls.com</a><br />
                Website: <a href="https://www.nextpuls.com" className="text-brand-600 hover:text-brand-700">www.nextpuls.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
