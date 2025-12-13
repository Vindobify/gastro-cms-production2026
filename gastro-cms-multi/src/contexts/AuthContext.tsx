'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  avatar?: string;
  preferences?: any;
}

interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'RESTAURANT_MANAGER' | 'DELIVERY_DRIVER' | 'CUSTOMER' | 'GUEST';
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRestaurantManager: boolean;
  isDeliveryDriver: boolean;
  isCustomer: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hilfsfunktionen für Rollenprüfung
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isRestaurantManager = user?.role === 'RESTAURANT_MANAGER';
  const isDeliveryDriver = user?.role === 'DELIVERY_DRIVER';
  const isCustomer = user?.role === 'CUSTOMER';

  // Session überprüfen (mit useCallback für stabile Referenz)
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Nur noch Cookie-basierte Authentifizierung - kein localStorage/sessionStorage
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Cookies automatisch mitsenden
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Session ungültig
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // CSRF-Token abrufen
  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
      }
      return null;
    } catch (error) {
      console.error('Fehler beim Abrufen des CSRF-Tokens:', error);
      return null;
    }
  };

  // Login
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      
      // CSRF-Token vor dem Login abrufen
      const csrfToken = await getCSRFToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // CSRF-Token in Header setzen falls verfügbar
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers,
        credentials: 'include', // Cookies automatisch verwalten
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Login fehlgeschlagen');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrierung
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // CSRF-Token vor der Registrierung abrufen
      const csrfToken = await getCSRFToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // CSRF-Token in Header setzen falls verfügbar
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        // Registrierung erfolgreich - nicht automatisch einloggen
        // Benutzer wird zur Login-Seite weitergeleitet
        return true;
      } else {
        console.error('Registrierungsfehler:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Logout-Request senden
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      
      // Wichtig: Nach dem Logout zur Login-Seite weiterleiten
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/login';
      }
    }
  };

  // Initial Session-Check (nur einmal beim Mount)
  useEffect(() => {
    checkAuth();
    
    // Cleanup function für potentielle Event Listeners
    return () => {
      // Hier würden Event Listeners entfernt werden
      // Aktuell keine vorhanden, aber für zukünftige Verwendung
    };
  }, [checkAuth]); // checkAuth als Dependency

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated,
    isAdmin,
    isRestaurantManager,
    isDeliveryDriver,
    isCustomer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
