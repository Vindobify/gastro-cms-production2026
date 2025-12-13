import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductExtrasManager from '@/components/products/ProductExtrasManager';

interface ProductExtrasPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductExtrasPage({ params }: ProductExtrasPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produkt Extras verwalten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ordne Extras dem Produkt zu oder entferne sie
          </p>
        </div>

        <ProductExtrasManager productId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
