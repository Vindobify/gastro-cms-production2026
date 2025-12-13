'use client';

import { useState, useEffect } from 'react';
import { useApiErrorHandler } from '@/lib/errorHandler';
import { 
  ChartBarIcon,
  ClockIcon,
  CurrencyEuroIcon,
  StarIcon,
  TruckIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface DeliveryStats {
  period: string;
  totalDeliveries: number;
  totalEarnings: number;
  totalTips: number;
  averageDeliveryTime: number;
  averageRating: number;
  dailyChartData: Array<{
    date: string;
    deliveries: number;
    earnings: number;
    tips: number;
  }>;
  topOrders: Array<{
    orderNumber: string;
    deliveries: number;
    totalAmount: number;
    tips: number;
  }>;
  recentDeliveries: Array<{
    id: number;
    orderNumber: string;
    deliveryDate: string;
    deliveryTime: number | null;
    earnings: number;
    tips: number;
    rating: number | null;
  }>;
}

const periodOptions = [
  { value: 'day', label: 'Heute', icon: '📅' },
  { value: 'week', label: 'Diese Woche', icon: '📊' },
  { value: 'month', label: 'Dieser Monat', icon: '📈' },
  { value: 'year', label: 'Dieses Jahr', icon: '🗓️' }
];

const filterOptions = [
  { value: 'all', label: 'Alle', icon: '📊' },
  { value: 'deliveries', label: 'Nur Lieferungen', icon: '🚚' },
  { value: 'tips', label: 'Mit Trinkgeld', icon: '💰' },
  { value: 'rated', label: 'Bewertet', icon: '⭐' }
];

export default function DeliveryStatsCarousel() {
  const apiHandler = useApiErrorHandler();
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sicherstellen, dass fetchWithErrorHandling verfügbar ist
  const fetchWithErrorHandling = apiHandler?.fetchWithErrorHandling || (async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  });

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod, selectedFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await fetchWithErrorHandling(`/api/delivery-drivers/stats?period=${selectedPeriod}&filter=${selectedFilter}`);
      setStats(data);
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
            Lieferstatistiken
          </h3>
        </div>
        <div className="px-4 py-8 sm:px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
            Lieferstatistiken
          </h3>
        </div>
        <div className="px-4 py-8 sm:px-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Daten</h3>
          <p className="text-gray-500">Noch keine Lieferungen in diesem Zeitraum.</p>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Hauptstatistiken
    <div key="main-stats" className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center shadow-xl">
          <TruckIcon className="h-10 w-10 mx-auto mb-3" />
          <div className="text-3xl font-bold">{stats?.totalDeliveries || 0}</div>
          <div className="text-blue-100 font-medium">Lieferungen</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center shadow-xl">
          <CurrencyEuroIcon className="h-10 w-10 mx-auto mb-3" />
          <div className="text-3xl font-bold">€{(stats?.totalEarnings || 0).toFixed(0)}</div>
          <div className="text-green-100 font-medium">Umsatz</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white text-center shadow-xl">
          <CurrencyEuroIcon className="h-10 w-10 mx-auto mb-3" />
          <div className="text-3xl font-bold">€{(stats?.totalTips || 0).toFixed(0)}</div>
          <div className="text-yellow-100 font-medium">Trinkgeld</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center shadow-xl">
          <StarIcon className="h-10 w-10 mx-auto mb-3" />
          <div className="text-3xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</div>
          <div className="text-purple-100 font-medium">Bewertung</div>
        </div>
      </div>
    </div>,

    // Slide 2: Durchschnittswerte
    <div key="averages" className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ClockIcon className="h-6 w-6 mr-3 text-gray-600" />
          Durchschnittswerte
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Durchschnittliche Lieferzeit</span>
            <span className="text-2xl font-bold text-gray-900">{stats?.averageDeliveryTime || 0} Min</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Durchschnittlicher Umsatz</span>
            <span className="text-2xl font-bold text-gray-900">€{((stats?.totalEarnings || 0) / ((stats?.totalDeliveries || 0) || 1)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Durchschnittliches Trinkgeld</span>
            <span className="text-2xl font-bold text-gray-900">€{((stats?.totalTips || 0) / ((stats?.totalDeliveries || 0) || 1)).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>,

    // Slide 3: Tägliche Aufschlüsselung
    <div key="daily-breakdown" className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-3 text-gray-600" />
          Tägliche Aufschlüsselung
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {(stats?.dailyChartData || []).slice(0, 7).map((day, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(day.date).toLocaleDateString('de-DE', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
                <div className="text-sm text-gray-500 font-medium">{day.deliveries} Lieferungen</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">€{day.earnings.toFixed(0)}</div>
                <div className="text-sm text-green-600 font-bold">+€{day.tips.toFixed(0)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header mit Filter */}
      <div className="px-6 py-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-2xl mr-4">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Lieferstatistiken</h3>
              <p className="text-gray-600 font-medium">Deine Performance im Überblick</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Period Filter */}
        <div className="flex space-x-3 overflow-x-auto mb-4">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedPeriod === option.value
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Options */}
        <div className="flex space-x-3 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedFilter === option.value
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Content */}
      <div className="px-6 py-6">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  {slide}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-3 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentSlide === index ? 'bg-purple-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
