import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RevenueDashboard from '@/components/revenue/RevenueDashboard';

export default function RevenuePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Umsatz & Reports</h1>
            <p className="text-gray-600">Detaillierte Umsatzübersicht und Steuerabgabe</p>
          </div>
        </div>
        
        <RevenueDashboard />
      </div>
    </DashboardLayout>
  );
}
