import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AllergensTable from '@/components/allergens/AllergensTable';

export default function AllergensPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Allergene</h1>
            <p className="text-gray-600">Verwaltung der Allergene für Produkte</p>
          </div>
        </div>
        
        <AllergensTable />
      </div>
    </DashboardLayout>
  );
}
