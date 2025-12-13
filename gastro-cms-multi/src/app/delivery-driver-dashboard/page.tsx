import DeliveryDriverDashboard from '@/components/delivery-drivers/DeliveryDriverDashboard';
import { redirect } from 'next/navigation';

export default function DeliveryDriverDashboardPage() {
  // Diese Seite ist nur für Lieferanten zugänglich
  // Die Authentifizierung wird in der Komponente geprüft
  return <DeliveryDriverDashboard />;
}
