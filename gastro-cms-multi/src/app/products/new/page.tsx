import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neues Produkt</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle ein neues Produkt für dein Restaurant
          </p>
        </div>

        <ProductForm />
      </div>
    </DashboardLayout>
  );
}
