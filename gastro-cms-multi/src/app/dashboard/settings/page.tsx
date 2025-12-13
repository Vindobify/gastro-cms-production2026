import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SettingsFormWithTabs from '@/components/settings/SettingsFormWithTabs';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="mt-1 text-sm text-gray-500">
            Konfiguriere dein Restaurant, die Lieferung und rechtliche Inhalte
          </p>
        </div>

        <SettingsFormWithTabs />
      </div>
    </DashboardLayout>
  );
}
