import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductEditForm from '@/components/products/ProductEditForm';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produkt bearbeiten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bearbeite die Details des ausgewählten Produkts
          </p>
        </div>

        <ProductEditForm productId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
