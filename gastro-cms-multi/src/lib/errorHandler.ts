// Zentrale Fehlerbehandlung für API-Aufrufe
import { useAuth } from '@/contexts/AuthContext';

export interface ApiError {
  error: string;
  status: number;
  message?: string;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private authContext: any = null;

  private constructor() {}

  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  public setAuthContext(authContext: any) {
    this.authContext = authContext;
  }

  public async handleResponse(response: Response): Promise<any> {
    if (response.ok) {
      return await response.json();
    }

    const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    
    switch (response.status) {
      case 401:
        console.warn('401 Unauthorized - Benutzer wird abgemeldet');
        if (this.authContext?.logout) {
          await this.authContext.logout();
        }
        // Weiterleitung zur Login-Seite
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard/login';
        }
        throw new Error('Nicht authentifiziert - Sie wurden abgemeldet');
        
      case 403:
        console.warn('403 Forbidden - Keine Berechtigung');
        throw new Error('Keine Berechtigung für diese Aktion');
        
      case 404:
        console.warn('404 Not Found');
        throw new Error('Ressource nicht gefunden');
        
      case 429:
        console.warn('429 Too Many Requests - Rate Limit erreicht');
        throw new Error('Zu viele Anfragen - Bitte warten Sie einen Moment');
        
      case 500:
        console.error('500 Internal Server Error');
        throw new Error('Interner Serverfehler - Bitte versuchen Sie es später erneut');
        
      default:
        console.error(`API Error ${response.status}:`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status} Fehler`);
    }
  }

  public async fetchWithErrorHandling(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Cookies automatisch mitsenden
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Netzwerkfehler - Bitte überprüfen Sie Ihre Internetverbindung');
    }
  }
}

// Hook für einfache Verwendung in React-Komponenten
export function useApiErrorHandler() {
  const authContext = useAuth();
  const handler = ApiErrorHandler.getInstance();
  
  // Auth-Context setzen
  handler.setAuthContext(authContext);
  
  // Fallback-Funktion falls der Handler nicht verfügbar ist
  const fallbackFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  };
  
  return {
    fetchWithErrorHandling: handler.fetchWithErrorHandling?.bind(handler) || fallbackFetch,
    handleResponse: handler.handleResponse?.bind(handler) || (async (response: Response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    })
  };
}

// Utility-Funktion für einfache API-Aufrufe
export async function apiCall(url: string, options: RequestInit = {}): Promise<any> {
  const handler = ApiErrorHandler.getInstance();
  return await handler.fetchWithErrorHandling(url, options);
}
