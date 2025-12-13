import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Seite nicht gefunden
          </h2>
          <p className="text-gray-600 mt-2">
            Die angeforderte Seite konnte nicht gefunden werden.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Zur Startseite
          </Link>
          
          <div className="text-sm text-gray-500">
            <Link
              href="/speisekarte"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Speisekarte ansehen
            </Link>
            {' • '}
            <Link
              href="/kontakt"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
