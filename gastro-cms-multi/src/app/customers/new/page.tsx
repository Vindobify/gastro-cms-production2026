import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomerForm from '@/components/customers/CustomerForm';

export default function NewCustomerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuer Kunde</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle einen neuen Kunden für dein Restaurant
          </p>
        </div>

        <CustomerForm />
      </div>
    </DashboardLayout>
  );
}
