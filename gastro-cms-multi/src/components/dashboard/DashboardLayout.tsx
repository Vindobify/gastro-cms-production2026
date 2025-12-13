'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import ErrorBoundary from '../ErrorBoundary';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard',
  subtitle = 'Willkommen im Admin-Bereich'
}: DashboardLayoutProps) {
  const { isDeliveryDriver, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Prüfe Authentifizierung
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    // Prüfe ob Benutzer Admin oder Restaurant Manager ist
    if (!loading && isAuthenticated && user) {
      const allowedRoles = ['ADMIN', 'RESTAURANT_MANAGER'];
      if (!allowedRoles.includes(user.role)) {
        router.push('/login?error=unauthorized');
        return;
      }
    }

    if (!loading && isDeliveryDriver) {
      // Lieferanten zum Lieferanten-Dashboard weiterleiten
      router.push('/delivery-driver-dashboard');
    }
  }, [isDeliveryDriver, loading, isAuthenticated, user, router]);

  // Zeige nichts während Ladevorgang oder wenn nicht authentifiziert
  if (loading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  // Zeige nichts, wenn Lieferant
  if (isDeliveryDriver) {
    return null;
  }
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
