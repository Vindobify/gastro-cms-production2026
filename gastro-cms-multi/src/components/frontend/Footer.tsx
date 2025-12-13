'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  openingHoursData: any;
  logo?: string;
}

export default function Footer() {
  const [restaurantData, setRestaurantData] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setRestaurantData(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Restaurant-Daten:', error);
      }
    };

    fetchRestaurantData();
  }, []);

  const parseOpeningHours = (hoursData: any) => {
    if (!hoursData) return null;
    
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
    
    return null;
  };

  const getDayName = (day: number) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[day] || '';
  };

  const openingHours = restaurantData?.openingHoursData ? parseOpeningHours(restaurantData.openingHoursData) : null;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-display font-semibold mb-4">
              {restaurantData?.restaurantName || 'Gastro'}
            </h3>
            <p className="text-gray-300 mb-6">
              Frische und leckere Gerichte direkt zu Ihnen nach Hause geliefert. 
              Beste Qualität und schneller Service.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPinIcon className="w-5 h-5 mr-3 text-brand-400" />
                <span>
                  {restaurantData?.address && restaurantData?.city && restaurantData?.postalCode
                    ? `${restaurantData.address}, ${restaurantData.postalCode} ${restaurantData.city}`
                    : 'Adresse wird geladen...'
                  }
                </span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <PhoneIcon className="w-5 h-5 mr-3 text-brand-400" />
                <a href={`tel:${restaurantData?.phone || ''}`} className="hover:text-white transition-colors">
                  {restaurantData?.phone || 'Telefon wird geladen...'}
                </a>
              </div>
              
              <div className="flex items-center text-gray-300">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-brand-400" />
                <a href={`mailto:${restaurantData?.email || ''}`} className="hover:text-white transition-colors">
                  {restaurantData?.email || 'E-Mail wird geladen...'}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Schnellzugriff</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/speisekarte" className="text-gray-300 hover:text-white transition-colors">
                  Speisekarte
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/konto" className="text-gray-300 hover:text-white transition-colors">
                  Kundencenter
                </Link>
              </li>
              <li>
                <Link href="/tisch-reservierung" className="text-gray-300 hover:text-white transition-colors">
                  Tisch reservieren
                </Link>
              </li>
              <li>
                <Link href="/warenkorb" className="text-gray-300 hover:text-white transition-colors">
                  Warenkorb
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-brand-400" />
              Öffnungszeiten
            </h4>
            
                         {openingHours && Array.isArray(openingHours) && openingHours.length > 0 ? (
               <div className="space-y-2 text-sm">
                 {openingHours.map((day: any, index: number) => (
                   <div key={index} className="flex justify-between">
                     <span className="text-gray-300">{getDayName(day.dayOfWeek)}</span>
                     <span className="text-white">
                       {day.startTime} - {day.endTime}
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-gray-300 text-sm">
                 Öffnungszeiten werden geladen...
               </div>
             )}
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8 mb-6">
          <h4 className="text-lg font-semibold mb-4 text-white">Rechtliches & Datenschutz</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const event = new CustomEvent('cc:reopen')
                window.dispatchEvent(event)
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Cookie-Einstellungen öffnen"
            >
              🍪 Cookie-Einstellungen
            </button>
            
                 <Link
                   href="/datenschutz"
                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                   aria-label="Datenschutzerklärung öffnen"
                 >
                   🔒 Datenschutz
                 </Link>
                 
                 <Link
                   href="/agb"
                   className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                   aria-label="AGB öffnen"
                 >
                   📋 AGB
                 </Link>
                 
                 <Link
                   href="/datenauskunft"
                   className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                   aria-label="Datenauskunft öffnen"
                 >
                   📊 Datenauskunft
                 </Link>
                 
                 <Link
                   href="/cookies"
                   className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                   aria-label="Cookie-Management öffnen"
                 >
                   ⚙️ Cookie-Management
                 </Link>
                 
                 <Link
                   href="/allergeneinformation"
                   className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                   aria-label="Allergeneinformation öffnen"
                 >
                   🥜 Allergeneinformation
                 </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {restaurantData?.restaurantName || 'Gastro'}. Alle Rechte vorbehalten.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/impressum" className="text-gray-400 hover:text-white text-sm transition-colors">
              Impressum
            </Link>
            <Link href="/agb" className="text-gray-400 hover:text-white text-sm transition-colors">
              AGB
            </Link>
            <Link href="/datenschutz" className="text-gray-400 hover:text-white text-sm transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
