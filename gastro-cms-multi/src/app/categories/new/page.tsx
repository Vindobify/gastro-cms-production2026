import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CategoryForm from '@/components/categories/CategoryForm';

export default function NewCategoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Kategorie</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle eine neue Produktkategorie
          </p>
        </div>

        <CategoryForm />
      </div>
    </DashboardLayout>
  );
}
