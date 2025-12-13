'use client';

import { useState, useEffect } from 'react';
import { useApiErrorHandler } from '@/lib/errorHandler';
import {
  CurrencyEuroIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';


interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenueNet: number;
  totalTax: number;
  revenueChange: number;
  revenueNetChange: number;
  taxChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenueNet: 0,
    totalTax: 0,
    revenueChange: 0,
    revenueNetChange: 0,
    taxChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard stats...');
        
        // Direkte fetch-Anfrage mit Fallback
        const response = await fetch(`/api/dashboard/stats?t=${Date.now()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dashboard stats fetched successfully:', data);
        
        if (isMounted) {
          setStats(data);
          setHasLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
          // Nur bei Fehlern Stats auf 0 setzen, wenn noch nie geladen wurde
          if (!hasLoaded) {
            setStats({
              totalRevenue: 0,
              totalOrders: 0,
              totalProducts: 0,
              totalCustomers: 0,
              totalRevenueNet: 0,
              totalTax: 0,
              revenueChange: 0,
              revenueNetChange: 0,
              taxChange: 0,
              ordersChange: 0,
              productsChange: 0,
              customersChange: 0
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [hasLoaded]);


  // Hilfsfunktion für Prozent-Formatierung und Typ-Bestimmung
  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : change < 0 ? '' : '';
    const type = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    return {
      text: change === 0 ? '0%' : `${sign}${change}%`,
      type
    };
  };

  // Debug logging
  console.log('Current stats state:', stats);
  console.log('totalRevenue:', stats.totalRevenue, 'type:', typeof stats.totalRevenue);

  const statCards = [
    {
      name: 'Gesamtumsatz (inkl. MwSt.)',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyEuroIcon,
      color: 'bg-green-500',
      change: formatChange(stats.revenueChange).text,
      changeType: formatChange(stats.revenueChange).type
    },
    {
      name: 'Netto-Umsatz (exkl. MwSt.)',
      value: `€${stats.totalRevenueNet.toFixed(2)}`,
      icon: CurrencyEuroIcon,
      color: 'bg-blue-500',
      change: formatChange(stats.revenueNetChange).text,
      changeType: formatChange(stats.revenueNetChange).type
    },
    {
      name: 'Gesamte MwSt.',
      value: `€${stats.totalTax.toFixed(2)}`,
      icon: CurrencyEuroIcon,
      color: 'bg-purple-500',
      change: formatChange(stats.taxChange).text,
      changeType: formatChange(stats.taxChange).type
    },
    {
      name: 'Bestellungen',
      value: stats.totalOrders.toString(),
      icon: ShoppingCartIcon,
      color: 'bg-orange-500',
      change: formatChange(stats.ordersChange).text,
      changeType: formatChange(stats.ordersChange).type
    },
    {
      name: 'Produkte',
      value: stats.totalProducts.toString(),
      icon: CubeIcon,
      color: 'bg-indigo-500',
      change: formatChange(stats.productsChange).text,
      changeType: formatChange(stats.productsChange).type
    },
    {
      name: 'Kunden',
      value: stats.totalCustomers.toString(),
      icon: UsersIcon,
      color: 'bg-pink-500',
      change: formatChange(stats.customersChange).text,
      changeType: formatChange(stats.customersChange).type
    }
  ];

  if (loading && !hasLoaded) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !hasLoaded) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Fehler beim Laden der Statistiken
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className={`font-medium ${
                item.changeType === 'positive' ? 'text-green-600' : 
                item.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.change}
              </span>
              <span className="text-gray-500"> seit letztem Monat</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
