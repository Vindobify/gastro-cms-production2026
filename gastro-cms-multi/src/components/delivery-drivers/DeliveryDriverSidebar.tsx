'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon,
  XMarkIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const deliveryDriverNavigation = [
  {
    title: 'Hauptmenü',
    items: [
      { 
        name: 'Übersicht', 
        href: '/delivery-driver-dashboard', 
        icon: HomeIcon, 
        description: 'Dashboard & Status',
        color: 'blue',
        badge: null
      },
      { 
        name: 'Bestellungen', 
        href: '/delivery-driver-dashboard/orders', 
        icon: ClipboardDocumentListIcon, 
        description: 'Meine Aufträge',
        color: 'green',
        badge: null
      },
      { 
        name: 'Statistiken', 
        href: '/delivery-driver-dashboard', 
        icon: ChartBarIcon, 
        description: 'Lieferstatistiken',
        color: 'purple',
        badge: 'Neu'
      },
      { 
        name: 'GPS-Standort', 
        href: '/delivery-driver-dashboard/location', 
        icon: MapPinIcon, 
        description: 'Position teilen',
        color: 'orange',
        badge: null
      },
      { 
        name: 'Profil', 
        href: '/delivery-driver-dashboard/profile', 
        icon: UserIcon, 
        description: 'Einstellungen',
        color: 'gray',
        badge: null
      },
    ]
  }
];

interface DeliveryDriverSidebarProps {
  onClose?: () => void;
}

export default function DeliveryDriverSidebar({ onClose }: DeliveryDriverSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    totalNotifications: 0,
    newOrdersToday: 0,
    statusUpdatesToday: 0,
    pendingOrders: 0,
    overdueOrders: 0,
    notifications: []
  });
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Benachrichtigungen laden
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/delivery-drivers/notifications', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    
    // Alle 30 Sekunden aktualisieren
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onClose?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50',
      purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50',
      orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-600 hover:bg-orange-50',
      gray: isActive ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-50',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const getIconBgClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: isActive ? 'bg-blue-700' : 'bg-blue-100 group-hover:bg-blue-200',
      green: isActive ? 'bg-green-700' : 'bg-green-100 group-hover:bg-green-200',
      purple: isActive ? 'bg-purple-700' : 'bg-purple-100 group-hover:bg-purple-200',
      orange: isActive ? 'bg-orange-700' : 'bg-orange-100 group-hover:bg-orange-200',
      gray: isActive ? 'bg-gray-700' : 'bg-gray-100 group-hover:bg-gray-200',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <TruckIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Gastro CMS</h1>
            <p className="text-xs text-gray-500">Lieferanten App</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* User Profile */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <span className="text-xl font-bold text-white">
              {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'L'}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-xl font-bold text-gray-900">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </p>
            <p className="text-sm text-gray-600 font-medium">Lieferant</p>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 shadow-sm"></div>
              <span className="text-sm text-green-600 font-semibold">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
        {deliveryDriverNavigation.map((section) => (
          <div key={section.title}>
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                      isActive
                        ? `${getColorClasses(item.color, true)} shadow-xl transform scale-105`
                        : `${getColorClasses(item.color, false)} hover:shadow-lg`
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${getIconBgClasses(item.color, isActive)}`}>
                      <item.icon
                        className={`h-6 w-6 ${
                          isActive ? 'text-white' : `text-${item.color}-600 group-hover:text-${item.color}-700`
                        }`}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <p className="font-bold">{item.name}</p>
                        {item.badge && (
                          <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Notifications & Logout */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-3">
        {/* Notifications */}
        <button className="group flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 rounded-2xl hover:bg-yellow-50 hover:text-yellow-700 transition-all duration-200">
          <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-yellow-100">
            <BellIcon className="h-6 w-6 text-gray-600 group-hover:text-yellow-600" />
          </div>
          <div className="ml-4 flex-1 text-left">
            <p className="font-bold">Benachrichtigungen</p>
            <p className="text-sm text-gray-500 group-hover:text-yellow-600">
              {notificationsLoading ? 'Lade...' : 
               notifications.totalNotifications === 0 ? 'Keine neuen' :
               `${notifications.totalNotifications} neue`}
            </p>
          </div>
          {!notificationsLoading && notifications.totalNotifications > 0 && (
            <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
              notifications.overdueOrders > 0 ? 'bg-red-500' :
              notifications.pendingOrders > 0 ? 'bg-orange-500' :
              'bg-blue-500'
            }`}>
              {notifications.totalNotifications}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 rounded-2xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-red-100">
            <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-600 group-hover:text-red-600" />
          </div>
          <div className="ml-4 flex-1 text-left">
            <p className="font-bold">Abmelden</p>
            <p className="text-sm text-gray-500 group-hover:text-red-600">Sitzung beenden</p>
          </div>
        </button>
      </div>
    </div>
  );
}
