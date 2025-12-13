'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ConsentReOpenButton } from '@/components/ConsentProvider';
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUrl } from '@/lib/url';
import { useCartSidebar } from '@/hooks/useCartSidebar';
import CartSidebar from '@/components/cart/CartSidebar';

interface RestaurantSettings {
  restaurantName: string;
  phone: string;
  email: string;
  logo?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [restaurantData, setRestaurantData] = useState<RestaurantSettings | null>(null);
  const { state: cartState } = useCart();
  const { user, isAuthenticated, logout, checkAuth } = useAuth();
  const { isOpen: isCartOpen, openSidebar: openCart, closeSidebar: closeCart } = useCartSidebar();

  // Optimierte Auth-Überwachung - nur ein useEffect
  useEffect(() => {
    let isMounted = true;
    let hasInitialCheck = false;

    const performAuthCheck = () => {
      if (!isMounted || isAuthenticated) return;

      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      if (token) {
        checkAuth();
      }
    };

    // Initiale Auth-Prüfung
    if (!isAuthenticated && !hasInitialCheck) {
      hasInitialCheck = true;
      performAuthCheck();
    }

    // Token-Synchronisation für eingeloggte Benutzer
    if (isAuthenticated && user) {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      if (!token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
        if (authCookie) {
          const cookieToken = authCookie.split('=')[1];
          localStorage.setItem('auth-token', cookieToken);
        }
      }
    }

    // Event-Handler für Storage-Änderungen
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token' && !isAuthenticated) {
        performAuthCheck();
      }
    };

    const handleAuthTokenChange = () => {
      if (!isAuthenticated) {
        performAuthCheck();
      }
    };

    // Event-Listener registrieren
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-changed', handleAuthTokenChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-changed', handleAuthTokenChange);
    };
  }, [isAuthenticated, user, checkAuth]);

  // Restaurant-Daten laden (nur einmal)
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setRestaurantData(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Restaurant-Daten:', error);
      }
    };

    fetchRestaurantData();
  }, []);

  // User-Menü schließen wenn außerhalb geklickt wird
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Optimierte Handler mit useCallback
  const handleLogout = useCallback(async () => {
    await logout();
    setIsUserMenuOpen(false);
  }, [logout]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  // Memoized Role-Funktionen
  const getRoleLabel = useMemo(() => (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'RESTAURANT_MANAGER':
        return 'Restaurant Manager';
      case 'CUSTOMER':
        return 'Kunde';
      default:
        return 'Unbekannter Benutzer';
    }
  }, []);

  const getRoleIcon = useMemo(() => (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheckIcon className="w-4 h-4 text-red-600" />;
      case 'RESTAURANT_MANAGER':
        return <BuildingStorefrontIcon className="w-4 h-4 text-blue-600" />;
      case 'CUSTOMER':
        return <UserIcon className="w-4 h-4 text-green-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  }, []);

  // Memoized User Display Data
  const userDisplayData = useMemo(() => {
    if (!user) return null;
    return {
      displayName: user.profile?.firstName || user.email,
      fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      roleLabel: getRoleLabel(user.role),
      roleIcon: getRoleIcon(user.role)
    };
  }, [user, getRoleLabel, getRoleIcon]);

  return (
    <header className="bg-white shadow-card sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" prefetch={false}>
            {restaurantData?.logo ? (
              <img
                src={getMediaUrl(restaurantData.logo)}
                alt={`${restaurantData.restaurantName} Logo`}
                className="w-32 sm:w-40 md:w-48 h-10 sm:h-12 md:h-16 object-contain"
              />
            ) : (
              <div className="w-32 sm:w-40 md:w-48 h-10 sm:h-12 md:h-16 rounded-lg flex items-center justify-center" role="img" aria-label={`${restaurantData?.restaurantName || 'Restaurant'} Logo`} style={{ backgroundColor: 'var(--color-primary)' }}>
                <span className="font-bold text-lg sm:text-xl md:text-2xl" style={{ color: 'var(--color-body)' }}>G</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav id="navigation" className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Hauptnavigation">
            <Link
              href="/speisekarte"
              className="text-gray-700 hover:text-brand-600 transition-colors font-medium"
              prefetch={false}
            >
              Speisekarte
            </Link>
          </nav>

          {/* Cart, User Menu, Aktionen Button & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Aktionen Button */}
            <Link
              href="/aktionen"
              className="hidden md:inline-flex items-center px-4 py-2 bg-accent-rose text-white text-sm font-semibold rounded-lg hover:bg-accent-rose/90 transition-colors"
              prefetch={false}
            >
              Aktionen
            </Link>
            {/* Warenkorb */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-body)' }}
              aria-label={`Warenkorb mit ${cartState.totalItems} Artikeln`}
            >
              <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-accent-rose text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" aria-label={`${cartState.totalItems} Artikel im Warenkorb`}>
                  {cartState.totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Benutzermenü"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:block text-sm font-medium">
                  {isAuthenticated && userDisplayData ? (
                    <span className="flex items-center space-x-2">
                      <span>{userDisplayData.displayName}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}>
                        {userDisplayData.roleLabel}
                      </span>
                    </span>
                  ) : (
                    'Anmelden'
                  )}
                </span>
                <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50" role="menu" aria-label="Benutzermenü">
                  {isAuthenticated ? (
                    <>
                      {/* Eingeloggter Benutzer */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900">
                          {userDisplayData?.fullName || user?.email}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
                        <div className="flex items-center space-x-2">
                          {userDisplayData?.roleIcon}
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                            {userDisplayData?.roleLabel}
                          </span>
                        </div>
                      </div>

                      {/* Admin & Restaurant Manager Optionen */}
                      {(user?.role === 'ADMIN' || user?.role === 'RESTAURANT_MANAGER') && (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                            onClick={closeMenus}
                            prefetch={false}
                          >
                            <CogIcon className="w-4 h-4 mr-3" />
                            Dashboard
                          </Link>

                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}

                      {/* Kunden-Optionen */}
                      {user?.role === 'CUSTOMER' && (
                        <>
                          <Link
                            href="/konto"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                            onClick={closeMenus}
                            prefetch={false}
                          >
                            <UserIcon className="w-4 h-4 mr-3" />
                            Mein Konto
                          </Link>

                          <Link
                            href="/bestellungen"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                            onClick={closeMenus}
                            prefetch={false}
                          >
                            <CogIcon className="w-4 h-4 mr-3" />
                            Meine Bestellungen
                          </Link>
                        </>
                      )}

                      {/* Alle eingeloggten Benutzer */}
                      <Link
                        href="/konto"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                        onClick={closeMenus}
                        prefetch={false}
                      >
                        <CogIcon className="w-4 h-4 mr-3" />
                        Kundencenter
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Abmelden
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Nicht eingeloggter Benutzer */}
                      <Link
                        href="/login"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                        onClick={closeMenus}
                        prefetch={false}
                      >
                        <UserIcon className="w-4 h-4 mr-3" />
                        Anmelden
                      </Link>

                      <Link
                        href="/register"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                        onClick={closeMenus}
                        prefetch={false}
                      >
                        <UserIcon className="w-4 h-4 mr-3" />
                        Registrieren
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMenuToggle}
              className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:text-brand-600 transition-colors"
              aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="md:hidden py-3 border-t border-gray-200">
            <nav className="flex flex-col space-y-3" role="navigation" aria-label="Hauptnavigation">
              <Link
                href="/speisekarte"
                className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                onClick={closeMenus}
                prefetch={false}
              >
                Speisekarte
              </Link>
              <Link
                href="/aktionen"
                className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                onClick={closeMenus}
                prefetch={false}
              >
                Aktionen
              </Link>

              {/* Mobile User Menu */}
              <div className="border-t border-gray-200 pt-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 border-b border-gray-100 mb-2 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-900">
                        {userDisplayData?.fullName || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">{user?.email}</p>
                      <div className="flex items-center space-x-2">
                        {userDisplayData?.roleIcon}
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                          {userDisplayData?.roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Admin & Restaurant Manager Optionen */}
                    {(user?.role === 'ADMIN' || user?.role === 'RESTAURANT_MANAGER') && (
                      <>
                        <Link
                          href="/dashboard"
                          className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                          onClick={closeMenus}
                          prefetch={false}
                        >
                          Dashboard
                        </Link>

                        <div className="border-t border-gray-200 my-1"></div>
                      </>
                    )}

                    {/* Kunden-Optionen */}
                    {user?.role === 'CUSTOMER' && (
                      <>
                        <Link
                          href="/konto"
                          className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                          onClick={closeMenus}
                          prefetch={false}
                        >
                          Mein Konto
                        </Link>

                        <Link
                          href="/konto/bestellungen"
                          className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                          onClick={closeMenus}
                          prefetch={false}
                        >
                          Meine Bestellungen
                        </Link>
                      </>
                    )}

                    {/* Alle eingeloggten Benutzer */}
                    <Link
                      href="/konto"
                      className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                      onClick={closeMenus}
                      prefetch={false}
                    >
                      Kundencenter
                    </Link>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-gray-700 hover:text-red-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                      onClick={closeMenus}
                      prefetch={false}
                    >
                      Anmelden
                    </Link>

                    <Link
                      href="/register"
                      className="block text-gray-700 hover:text-brand-600 transition-colors font-medium py-1.5 px-2 rounded-lg hover:bg-gray-50"
                      onClick={closeMenus}
                      prefetch={false}
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Cookie Re-Open Button */}
      <ConsentReOpenButton />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </header>
  );
}
