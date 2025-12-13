'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Slideshow from '@/components/frontend/Slideshow';
import CanonicalTag from '@/components/seo/CanonicalTag';
import StructuredData from '@/components/seo/StructuredData';
import SEOHead from '@/components/seo/SEOHead';

import {
  ClockIcon, MapPinIcon, PhoneIcon, TruckIcon, StarIcon, HeartIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';



interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  logo?: string;
  openingHoursData: any;
  deliveryDistricts: string;
  minOrderAmount?: number | null;
  deliveryFee?: number | null;
  freeDeliveryThreshold?: number | null;
  orderDeadline?: string;
}

export default function FrontendLandingPage() {
  const [restaurantData, setRestaurantData] = useState<RestaurantSettings | null>(null);
  const [seoSettings, setSeoSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noTenant, setNoTenant] = useState(false);
  const [currentHost, setCurrentHost] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.hostname);
    }

    const fetchData = async () => {
      try {
        // Lade Restaurant-Einstellungen
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.status === 404) {
          setNoTenant(true);
          setLoading(false);
          return;
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setRestaurantData(settingsData);
        }

        // Lade SEO-Einstellungen
        const seoRes = await fetch('/api/seo-settings');
        if (seoRes.ok) {
          const seoData = await seoRes.json();
          setSeoSettings(seoData);
          
          // Dynamisch den Titel der Seite ändern
          if (seoData.metaTitle) {
            document.title = seoData.metaTitle;
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseOpeningHours = (hoursData: any) => {
    if (!hoursData) return [];
    
    // Falls es bereits ein Array ist
    if (Array.isArray(hoursData)) {
      return hoursData;
    }
    
    // Falls es ein Objekt ist (z.B. {monday: {start: '11:00', end: '23:00'}})
    if (typeof hoursData === 'object' && hoursData !== null) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days.map((day, index) => {
        const dayData = hoursData[day as keyof typeof hoursData];
        if (dayData && typeof dayData === 'object' && 'start' in dayData && 'end' in dayData) {
          return {
            dayOfWeek: index,
            startTime: dayData.start,
            endTime: dayData.end
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    return [];
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayIndex] || 'Unbekannt';
  };

  const openingHours = restaurantData?.openingHoursData ? parseOpeningHours(restaurantData.openingHoursData) : [];

  const structuredData = restaurantData ? {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurantData.restaurantName,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurantData.address,
      "addressLocality": restaurantData.city,
      "postalCode": restaurantData.postalCode
    },
    "telephone": restaurantData.phone,
    "email": restaurantData.email,
    "priceRange": "€€",
    "openingHours": openingHours?.map((day: any) => 
      `${getDayName(day.dayOfWeek)} ${day.startTime}-${day.endTime}`
    ) || []
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  if (noTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white shadow rounded-xl p-8 text-center border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Hier entsteht ein Lieferservice</h1>
          <p className="text-gray-600 mb-6">
            Für die Domain <span className="font-mono text-gray-800">{currentHost || '–'}</span> wird gerade
            ein Gastro CMS 3.0 Lieferservice vorbereitet. Sobald das Restaurant angelegt und aktiviert ist,
            erscheint hier das vollständige Bestellerlebnis.
          </p>
          <div className="text-sm text-gray-500">Bitte später erneut versuchen.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* SEO Head mit den gespeicherten Einstellungen */}
      <SEOHead
        title={seoSettings?.metaTitle || restaurantData?.restaurantName || 'Restaurant'}
        description={seoSettings?.metaDescription || 'Willkommen in unserem Restaurant'}
        canonical="/"
        ogImage={seoSettings?.ogImage}
        ogType="website"
      />
      
      <CanonicalTag path="/" />
      {structuredData && <StructuredData type="restaurant" data={structuredData} settings={restaurantData} />}
      <Header />
      
      {/* Hero Section mit Slideshow */}
      <Slideshow />

      {/* Kategorien Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Unsere Kategorien
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie unsere vielfältige Auswahl an köstlichen Speisen
            </p>
          </div>
          
          {/* Einfache Kategorien-Liste */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-strong transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-200 p-6 text-center">
              <div className="text-4xl mb-4">🍕</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pizza</h3>
              <p className="text-sm text-gray-500">1 Produkt</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-strong transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-200 p-6 text-center">
              <div className="text-4xl mb-4">🍝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pasta</h3>
              <p className="text-sm text-gray-500">1 Produkt</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-strong transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-200 p-6 text-center">
              <div className="text-4xl mb-4">🥗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Salate</h3>
              <p className="text-sm text-gray-500">0 Produkte</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-strong transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-200 p-6 text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weitere</h3>
              <p className="text-sm text-gray-500">0 Produkte</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/speisekarte"
              className="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Alle Kategorien ansehen
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Öffnungszeiten & Kontakt */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Öffnungszeiten & Kontakt
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Wir sind für Sie da - Kontaktieren Sie uns gerne für Bestellungen oder Fragen
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Öffnungszeiten */}
            <div className="bg-white rounded-3xl shadow-card-strong p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4" style={{backgroundColor: 'var(--color-background)'}}>
                  <ClockIcon className="w-6 h-6" style={{color: 'var(--color-primary)'}} />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Öffnungszeiten</h3>
              </div>
              
              <div className="space-y-3">
                {openingHours.length > 0 ? (
                  openingHours.map((day: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700">{getDayName(day.dayOfWeek)}</span>
                      <span className="text-gray-600">{day.startTime} - {day.endTime}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Öffnungszeiten werden geladen...</p>
                )}
              </div>
            </div>

            {/* Lieferung */}
            <div className="bg-white rounded-3xl shadow-card-strong p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4" style={{backgroundColor: 'var(--color-background)'}}>
                  <TruckIcon className="w-6 h-6" style={{color: 'var(--color-primary)'}} />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Lieferung</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mindestbestellwert:</span>
                  <span className="font-semibold text-gray-900">
                    €{Number(restaurantData?.minOrderAmount || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Liefergebühr:</span>
                  <span className="font-semibold text-gray-900">
                    €{Number(restaurantData?.deliveryFee || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {restaurantData?.freeDeliveryThreshold && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kostenlos ab:</span>
                    <span className="font-semibold text-gray-900">
                      €{Number(restaurantData?.freeDeliveryThreshold || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {restaurantData?.deliveryDistricts ? (
                      <>
                        <span className="font-medium text-gray-700">Lieferung in:</span><br />
                        <span style={{color: 'var(--color-primary)'}}>
                          {(() => {
                            try {
                              const districts = JSON.parse(restaurantData.deliveryDistricts);
                              return districts.join(', ');
                            } catch {
                              return restaurantData.deliveryDistricts;
                            }
                          })()}
                        </span>
                      </>
                    ) : (
                      'Lieferung in alle Stadtteile'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Kontakt */}
            <div className="bg-white rounded-3xl shadow-card-strong p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4" style={{backgroundColor: 'var(--color-background)'}}>
                  <EnvelopeIcon className="w-6 h-6" style={{color: 'var(--color-primary)'}} />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Kontakt</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-3" style={{color: 'var(--color-text-secondary)'}} />
                  <div>
                    <p className="font-medium text-gray-900">{restaurantData?.address}</p>
                    <p className="text-gray-600">{restaurantData?.postalCode} {restaurantData?.city}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-3" style={{color: 'var(--color-text-secondary)'}} />
                  <a href={`tel:${restaurantData?.phone}`} className="font-medium" style={{color: 'var(--color-primary)'}}>
                    {restaurantData?.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-3" style={{color: 'var(--color-text-secondary)'}} />
                  <a href={`mailto:${restaurantData?.email}`} className="font-medium" style={{color: 'var(--color-primary)'}}>
                    {restaurantData?.email}
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  href="/kontakt"
                  className="inline-block w-full text-center px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-body)'}}
                >
                  Kontakt aufnehmen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}