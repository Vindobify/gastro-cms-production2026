import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TopProducts from '@/components/dashboard/TopProducts';
import RecentOrders from '@/components/dashboard/RecentOrders';

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Willkommen im Admin-Bereich">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <TopProducts />
        <RecentOrders />
      </div>
    </DashboardLayout>
  );
}
