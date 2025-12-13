import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExtraForm from '@/components/extras/ExtraForm';

export default function NewExtraPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neues Extra</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle ein neues Produkt-Extra (Zutat, Beilage, etc.)
          </p>
        </div>

        <ExtraForm />
      </div>
    </DashboardLayout>
  );
}
