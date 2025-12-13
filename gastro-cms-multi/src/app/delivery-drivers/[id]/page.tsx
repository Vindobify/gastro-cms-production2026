import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DeliveryDriverDetailView from '@/components/delivery-drivers/DeliveryDriverDetailView';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

interface DeliveryDriverDetailPageProps {
  params: {
    id: string;
  };
}

export default function DeliveryDriverDetailPage({ params }: DeliveryDriverDetailPageProps) {
  const id = parseInt(params.id);

  return (
    <DashboardLayout title="Lieferant Details" subtitle="Detaillierte Informationen zum Lieferanten">
      <div className="space-y-6">
        {/* Header mit Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/delivery-drivers"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Link>
          </div>
          
          <Link
            href={`/delivery-drivers/edit/${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            Bearbeiten
          </Link>
        </div>

        {/* Lieferanten-Details */}
        <DeliveryDriverDetailView id={id} />
      </div>
    </DashboardLayout>
  );
}
