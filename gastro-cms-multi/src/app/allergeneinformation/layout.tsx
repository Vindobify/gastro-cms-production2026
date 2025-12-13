import { metadata } from './metadata'

export { metadata }

export default function AllergeneinformationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav role="navigation" aria-label="Hauptnavigation" className="sr-only">
        <ul>
          <li><a href="/">Startseite</a></li>
          <li><a href="/speisekarte">Speisekarte</a></li>
          <li><a href="/warenkorb">Warenkorb</a></li>
          <li><a href="/kontakt">Kontakt</a></li>
        </ul>
      </nav>
      
      <div id="skip-link">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded z-50">
          Zum Hauptinhalt springen
        </a>
      </div>
      
      {children}
    </div>
  )
}
