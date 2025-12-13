import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExtrasTable from '@/components/extras/ExtrasTable';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ExtrasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Extras</h1>
            <p className="mt-1 text-sm text-gray-500">
              Verwalte alle Produkt-Extras (Zutaten, Beilagen, etc.)
            </p>
          </div>
          <Link
            href="/extras/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Neues Extra
          </Link>
        </div>

        <ExtrasTable />
      </div>
    </DashboardLayout>
  );
}
