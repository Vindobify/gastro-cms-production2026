import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CouponsTable from '@/components/coupons/CouponsTable';

export default function CouponsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gutschein-Verwaltung</h1>
            <p className="text-gray-600">Erstelle und verwalte Gutscheine für deine Kunden</p>
          </div>
          <a
            href="/coupons/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Neuen Gutschein erstellen
          </a>
        </div>
        
        <CouponsTable />
      </div>
    </DashboardLayout>
  );
}
