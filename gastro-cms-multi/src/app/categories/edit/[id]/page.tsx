import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CategoryEditForm from '@/components/categories/CategoryEditForm';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategorie bearbeiten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bearbeite die Details der ausgewählten Kategorie
          </p>
        </div>

        <CategoryEditForm categoryId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
