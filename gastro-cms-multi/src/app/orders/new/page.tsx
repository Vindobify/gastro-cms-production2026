import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OrderForm from '@/components/orders/OrderForm';

export default function NewOrderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Bestellung</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle eine neue Bestellung für dein Restaurant
          </p>
        </div>

        <OrderForm />
      </div>
    </DashboardLayout>
  );
}
