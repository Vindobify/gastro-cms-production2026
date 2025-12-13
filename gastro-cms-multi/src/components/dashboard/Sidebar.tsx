'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  GiftIcon,
  Squares2X2Icon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  TruckIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PresentationChartLineIcon,
  QrCodeIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const navigationSections = [
  {
    title: 'Übersicht',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Bestellungen', href: '/dashboard/orders', icon: ClipboardDocumentListIcon },
      { name: 'Umsätze', href: '/dashboard/revenue', icon: ChartBarIcon },
    ]
  },
  {
    title: 'Produktverwaltung',
    items: [
      { name: 'Produkte', href: '/dashboard/products', icon: CubeIcon },
      { name: 'Kategorien', href: '/dashboard/categories', icon: TagIcon },
      { name: 'Extras', href: '/dashboard/extras', icon: Squares2X2Icon },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Slideshow', href: '/dashboard/marketing/slideshow', icon: PresentationChartLineIcon },
      { name: 'QR Code Generator', href: '/dashboard/marketing/qr-generator', icon: QrCodeIcon },
      { name: 'Gutscheine', href: '/dashboard/coupons', icon: GiftIcon },
    ]
  },
  {
    title: 'Kundenverwaltung',
    items: [
      { name: 'Kunden', href: '/dashboard/customers', icon: UserGroupIcon },
      { name: 'Lieferanten', href: '/dashboard/delivery-drivers', icon: TruckIcon },
      { name: 'Benutzer', href: '/dashboard/users', icon: UsersIcon },
    ]
  },
  {
    title: 'System & Tools',
    items: [
      { name: 'API Control', href: '/dashboard/api-control', icon: KeyIcon },
      { name: 'SEO', href: '/dashboard/seo', icon: MagnifyingGlassIcon },
      { name: 'Mediathek', href: '/dashboard/media', icon: PhotoIcon },
      { name: 'Einstellungen', href: '/dashboard/settings', icon: CogIcon },
      { name: 'Hilfe', href: '/dashboard/help', icon: QuestionMarkCircleIcon },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isDeliveryDriver } = useAuth();
  const [appVersion, setAppVersion] = useState('3.0.0');

  // Lieferanten dürfen nicht auf das Admin-Dashboard zugreifen
  if (isDeliveryDriver) {
    return null;
  }

  useEffect(() => {
    // Fetch app version from API
    fetch('/api/updates/status')
      .then(res => res.json())
      .then(data => {
        if (data.currentVersion) {
          setAppVersion(data.currentVersion);
        }
      })
      .catch(() => {
        // Fallback to default version
        setAppVersion('3.0.0');
      });
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-slate-800">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-900">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-brand-600 font-bold text-lg">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-lg font-semibold">Gastro CMS</span>
              <span className="text-slate-300 text-xs">v{appVersion}</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${isActive
                          ? 'bg-slate-700 text-white shadow-md'
                          : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                          } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        <item.icon
                          className={`${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                            } mr-3 flex-shrink-0 h-5 w-5`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Info & Logout section */}
          <div className="flex-shrink-0 border-t border-slate-700">
            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Restaurant Manager'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {user?.role === 'DELIVERY_DRIVER' && (
              <div className="p-4 border-b border-slate-700">
                <Link
                  href="/delivery-driver-dashboard"
                  className="flex items-center text-slate-200 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <TruckIcon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">Lieferanten-Dashboard</span>
                </Link>
              </div>
            )}
            <div className="p-4 space-y-2">
              <Link href="/" className="flex items-center w-full group">
                <div className="w-6 h-6 flex items-center justify-center mr-3">
                  <span className="text-slate-300 group-hover:text-white text-sm">🏠</span>
                </div>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  Zur Hauptseite
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full group text-left"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-slate-300 group-hover:text-white mr-3" />
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  Abmelden
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
