import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DeliveryDriversTable from '@/components/delivery-drivers/DeliveryDriversTable';
import DeliveryDriversMap from '@/components/delivery-drivers/DeliveryDriversMap';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function DashboardDeliveryDriversPage() {
  return (
    <DashboardLayout title="Lieferanten" subtitle="Verwalte alle Lieferanten und verfolge ihre Standorte">
      <div className="space-y-6">
        {/* Header mit Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lieferanten-Verwaltung</h2>
            <p className="text-gray-600 mt-1">
              Überwache alle Lieferanten und ihre aktuellen Standorte
            </p>
          </div>
          <Link
            href="/dashboard/delivery-drivers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Neuer Lieferant
          </Link>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Live-Standorte</h3>
            <p className="text-sm text-gray-600 mt-1">
              Alle aktiven Lieferanten werden in Echtzeit angezeigt
            </p>
          </div>
          <div className="p-6">
            <DeliveryDriversMap />
          </div>
        </div>

        {/* Lieferanten-Tabelle */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Alle Lieferanten</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verwaltung und Übersicht aller Lieferanten
            </p>
          </div>
          <div className="p-6">
            <DeliveryDriversTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
