import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CouponEditForm from '@/components/coupons/CouponEditForm';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gutschein bearbeiten</h1>
          <p className="text-gray-600">Bearbeite die Einstellungen des Gutscheins</p>
        </div>
        
        <CouponEditForm couponId={parseInt(id)} />
      </div>
    </DashboardLayout>
  );
}
