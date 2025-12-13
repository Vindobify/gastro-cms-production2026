'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentArrowDownIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface RevenueData {
  period: string;
  totalRevenue: number;
  totalRevenueNet: number;
  totalTax: number;
  totalOrders: number;
  averageOrderValue: number;
  taxBreakdown: {
    tax10: number;
    tax20: number;
    tax0: number;
  };
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    revenueNet: number;
    tax: number;
  }>;
}

interface ReportPeriod {
  label: string;
  value: string;
  days: number;
}

const REPORT_PERIODS: ReportPeriod[] = [
  { label: 'Heute', value: 'today', days: 1 },
  { label: 'Letzte 7 Tage', value: 'week', days: 7 },
  { label: 'Letzte 30 Tage', value: 'month', days: 30 },
  { label: 'Letzte 90 Tage', value: 'quarter', days: 90 },
  { label: 'Dieses Jahr', value: 'year', days: 365 }
];

export default function RevenueDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const period = REPORT_PERIODS.find(p => p.value === selectedPeriod);
      const response = await fetch(`/api/revenue?period=${selectedPeriod}&days=${period?.days || 30}`);
      
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      
      // Überprüfe ob Daten vorhanden sind
      if (!revenueData) {
        alert('Keine Umsatzdaten verfügbar. Bitte warte, bis die Daten geladen sind.');
        return;
      }

      const period = REPORT_PERIODS.find(p => p.value === selectedPeriod);
      
      console.log('Sending data to PDF API:', {
        period: selectedPeriod,
        days: period?.days || 30,
        data: revenueData
      });

      const response = await fetch('/api/revenue/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
          days: period?.days || 30,
          data: revenueData
        }),
      });

      if (response.ok) {
        // Prüfe den Content-Type der Antwort
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
          // Echte PDF - herunterladen
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `umsatz-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // HTML-Fallback - öffne in neuem Tab für PDF-Druck
          const htmlContent = await response.text();
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
            
            // Warte kurz und dann öffne den Druckdialog
            setTimeout(() => {
              newWindow.print();
            }, 500);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('PDF API error:', errorData);
        alert(`Fehler beim Generieren der PDF: ${errorData.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fehler beim Generieren der PDF. Bitte überprüfe die Konsole für Details.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Umsatzdaten verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zeitraum-Auswahl und PDF-Download */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Zeitraum auswählen</h3>
            <p className="text-sm text-gray-500">Wähle den Zeitraum für deinen Report</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {REPORT_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={generatePDF}
              disabled={generatingPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {generatingPDF ? 'PDF wird erstellt...' : 'PDF herunterladen'}
            </button>
          </div>
        </div>
      </div>

      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bruttoumsatz (inkl. MwSt.)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €{formatPrice(revenueData.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Netto-Umsatz (exkl. MwSt.)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €{formatPrice(revenueData.totalRevenueNet)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamte MwSt.
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €{formatPrice(revenueData.totalTax)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bestellungen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {revenueData.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MwSt. Aufschlüsselung */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">MwSt. Aufschlüsselung</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">20% MwSt.</span>
            </div>
            <span className="text-lg font-bold text-green-900">
              €{formatPrice(revenueData.taxBreakdown.tax20)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">10% MwSt.</span>
            </div>
            <span className="text-lg font-bold text-blue-900">
              €{formatPrice(revenueData.taxBreakdown.tax10)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">0% MwSt.</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              €{formatPrice(revenueData.taxBreakdown.tax0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tägliche Aufschlüsselung */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tägliche Aufschlüsselung</h3>
        <div className="space-y-3">
          {revenueData.dailyBreakdown.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(day.date)}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-500">
                  {day.orders} Bestellungen
                </span>
                <span className="text-sm font-medium text-gray-900">
                  €{formatPrice(day.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-Produkte */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top-Produkte nach Umsatz</h3>
        <div className="space-y-4">
          {revenueData.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  #{index + 1}
                </span>
                <span className="text-sm text-gray-900">{product.name}</span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm text-gray-500">
                  {product.sales} Verkäufe
                </div>
                <div className="text-sm font-medium text-gray-900">
                  €{formatPrice(product.revenue)} (Brutto)
                </div>
                <div className="text-xs text-gray-500">
                  €{formatPrice(product.revenueNet)} (Netto) + €{formatPrice(product.tax)} (MwSt.)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steuerabgabe Zusammenfassung */}
      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Steuerabgabe Zusammenfassung</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Für Steuerabgabe relevant:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Netto-Umsatz: €{formatPrice(revenueData.totalRevenueNet)}</li>
                <li>• 20% MwSt.: €{formatPrice(revenueData.taxBreakdown.tax20)}</li>
                <li>• 10% MwSt.: €{formatPrice(revenueData.taxBreakdown.tax10)}</li>
                <li>• 0% MwSt.: €{formatPrice(revenueData.taxBreakdown.tax0)}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Gesamtbeträge:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Bruttoumsatz: €{formatPrice(revenueData.totalRevenue)}</li>
                <li>• Gesamte MwSt.: €{formatPrice(revenueData.totalTax)}</li>
                <li>• Bestellungen: {revenueData.totalOrders}</li>
                <li>• Ø Bestellwert: €{formatPrice(revenueData.averageOrderValue)}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
