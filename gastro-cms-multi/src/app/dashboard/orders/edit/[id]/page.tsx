import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OrderEditForm from '@/components/orders/OrderEditForm';

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bestellung bearbeiten</h1>
          <p className="text-gray-600">Bearbeite die Bestellung #{id}</p>
        </div>
        
        <OrderEditForm orderId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
