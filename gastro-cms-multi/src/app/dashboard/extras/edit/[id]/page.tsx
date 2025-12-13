import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExtraEditForm from '@/components/extras/ExtraEditForm';

interface EditExtraPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExtraPage({ params }: EditExtraPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extras bearbeiten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bearbeite die Einstellungen für die ausgewählten Extras
          </p>
        </div>

        <ExtraEditForm extraId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
