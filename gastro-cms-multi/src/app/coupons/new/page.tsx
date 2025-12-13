import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CouponForm from '@/components/coupons/CouponForm';

export default function NewCouponPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuen Gutschein erstellen</h1>
          <p className="text-gray-600">Erstelle einen neuen Gutschein für deine Kunden</p>
        </div>
        
        <CouponForm />
      </div>
    </DashboardLayout>
  );
}
