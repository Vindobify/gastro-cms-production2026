import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomersTable from '@/components/customers/CustomersTable';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function DashboardCustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kunden</h1>
            <p className="mt-1 text-sm text-gray-500">
              Verwalte alle Kunden deines Restaurants
            </p>
          </div>
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Neuer Kunde
          </Link>
        </div>

        <CustomersTable />
      </div>
    </DashboardLayout>
  );
}
