import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiken & Analysen</h1>
          <p className="mt-1 text-sm text-gray-500">
            Übersicht über Umsätze, Bestellungen und Produkt-Performance
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
