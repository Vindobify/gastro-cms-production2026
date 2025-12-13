import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DeliveryDriverEditForm from '@/components/delivery-drivers/DeliveryDriverEditForm';

interface EditDeliveryDriverPageProps {
  params: {
    id: string;
  };
}

export default async function EditDeliveryDriverPage({ params }: EditDeliveryDriverPageProps) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  return (
    <DashboardLayout title="Lieferant bearbeiten" subtitle="Bearbeite die Lieferanten-Daten">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lieferant bearbeiten</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ändere die Daten des Lieferanten
            </p>
          </div>
          <div className="p-6">
            <DeliveryDriverEditForm id={id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
