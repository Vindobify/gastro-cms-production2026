import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomerEditForm from '@/components/customers/CustomerEditForm';
import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({ params }: CustomerEditPageProps) {
  const { id } = await params;
  const customerId = parseInt(id);

  if (isNaN(customerId)) {
    notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/customers"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Zurück zu Kunden
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Kunde bearbeiten
            </h1>
            <p className="text-sm text-gray-500">
              Bearbeite die Informationen für {customer.firstName} {customer.lastName}
            </p>
          </div>
          
          <div className="px-6 py-4">
            <CustomerEditForm customer={customer} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
