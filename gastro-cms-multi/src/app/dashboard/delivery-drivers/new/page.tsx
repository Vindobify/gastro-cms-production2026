'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DeliveryDriverForm from '@/components/delivery-drivers/DeliveryDriverForm';

export default function NewDeliveryDriverPage() {
  return (
    <DashboardLayout title="Neuer Lieferant" subtitle="Füge einen neuen Lieferanten hinzu">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lieferant erstellen</h3>
            <p className="text-sm text-gray-600 mt-1">
              Fülle alle Pflichtfelder aus, um einen neuen Lieferanten hinzuzufügen
            </p>
          </div>
          <div className="p-6">
            <DeliveryDriverForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
