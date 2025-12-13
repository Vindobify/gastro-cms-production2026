import React from 'react'
import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ConsentProvider } from '@/components/ConsentProvider'
import CookieBanner from '@/components/CookieBanner'
import ConsentScripts from '@/components/ConsentScripts'
import MaintenanceCheck from '@/components/MaintenanceCheck'

// Google Fonts konfigurieren - nur die wichtigsten Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap'
})

function getDefaultSEOSettings() {
  return {
    restaurantName: 'Gastro CMS',
    description: 'Professionelles Restaurant Management System',
    address: '',
    phone: '',
    email: '',
    city: '',
    postalCode: ''
  }
}

// Static metadata for build time
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Gastro CMS - Restaurant Management System',
    template: '%s | Gastro CMS'
  },
  description: 'Professionelles Restaurant Management System für Online-Bestellungen und Verwaltung.',
  keywords: ['Restaurant', 'Gastro', 'CMS', 'Bestellung', 'Lieferung', 'Online', 'Food', 'Delivery'],
  authors: [{ name: 'Gastro CMS' }],
  creator: 'Gastro CMS',
  publisher: 'Gastro CMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'Gastro CMS - Restaurant Management System',
    description: 'Professionelles Restaurant Management System für Online-Bestellungen und Verwaltung.',
    siteName: 'Gastro CMS',
    images: [{
      url: '/favicon.ico',
      width: 1200,
      height: 630,
      alt: 'Gastro CMS',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gastro CMS - Restaurant Management System',
    description: 'Professionelles Restaurant Management System für Online-Bestellungen und Verwaltung.',
    images: ['/favicon.ico'],
  },
  alternates: {
    canonical: '/',
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seoSettings = getDefaultSEOSettings()
  
  return (
    <html 
      lang="de" 
      suppressHydrationWarning={true}
      className={`
        ${inter.variable}
        ${roboto.variable}
      `}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#059669" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={seoSettings.restaurantName} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="font-sans" suppressHydrationWarning={true}>
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h1>JavaScript erforderlich</h1>
              <p>Diese Anwendung benötigt JavaScript. Bitte aktivieren Sie JavaScript in Ihrem Browser.</p>
            </div>
          </div>
        </noscript>
        
        <ConsentProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <div id="root">
                  <header role="banner" style={{ display: 'none' }}>
                    <h1>{seoSettings.restaurantName} - Restaurant Management System</h1>
                  </header>
                  
                  <main id="main-content" role="main">
                    {children}
                  </main>
                  
                  <footer role="contentinfo" style={{ display: 'none' }}>
                    <p>&copy; 2024 {seoSettings.restaurantName}. Alle Rechte vorbehalten.</p>
                  </footer>
                </div>
                  
                  {/* Maintenance Check */}
                  <MaintenanceCheck />
                
                {/* DSGVO Cookie Management */}
                <CookieBanner />
                <ConsentScripts />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ConsentProvider>
      </body>
    </html>
  )
}