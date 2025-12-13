'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DeliveryDriverSidebar from './DeliveryDriverSidebar';
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon,
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline';

interface DeliveryDriverLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DeliveryDriverLayout({ 
  children, 
  title = 'Lieferanten-Dashboard',
  subtitle = 'Verwalte deine zugewiesenen Bestellungen'
}: DeliveryDriverLayoutProps) {
  const { user, isAuthenticated, isDeliveryDriver, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/delivery-driver-dashboard/login');
        return;
      }

      if (!isDeliveryDriver) {
        // Benutzer ist kein Lieferant - weiterleiten zum normalen Dashboard
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isDeliveryDriver, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Zeige Loading-Spinner während der Authentifizierung
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Lade Lieferanten-Dashboard...</p>
        </div>
      </div>
    );
  }

  // Zeige nichts, wenn nicht authentifiziert oder kein Lieferant
  if (!isAuthenticated || !isDeliveryDriver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="ml-3 flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">Gastro CMS</h1>
                <p className="text-xs text-gray-500">Lieferanten App</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'L'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Lieferant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <DeliveryDriverSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-sm w-full bg-white shadow-2xl">
            <DeliveryDriverSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center space-x-6">
                <button className="p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <BellIcon className="h-6 w-6" />
                </button>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 shadow-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
