'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiParameter {
  name: string;
  type: string;
  description: string;
}

interface ApiMethod {
  method: string;
  url: string;
  description: string;
  auth: string;
  parameters?: ApiParameter[];
  body?: string;
  response: string;
}

interface ApiEndpoint {
  title: string;
  description: string;
  baseUrl: string;
  methods: ApiMethod[];
}

export default function ApiDocumentation() {
  const { isAdmin } = useAuth();
  const [activeEndpoint, setActiveEndpoint] = useState('products');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600">Nur Administratoren haben Zugriff auf die API-Dokumentation.</p>
        </div>
      </div>
    );
  }

  const endpoints: Record<string, ApiEndpoint> = {
    products: {
      title: 'Produkte API',
      description: 'Verwalten Sie Ihr Produktsortiment',
      baseUrl: '/api/products',
      methods: [
        {
          method: 'GET',
          url: '/api/products',
          description: 'Alle Produkte abrufen',
          auth: 'Öffentlich (Lesen)',
          parameters: [
            { name: 'categoryId', type: 'number', description: 'Filter nach Kategorie-ID' },
            { name: 'search', type: 'string', description: 'Suchbegriff für Name/Beschreibung' },
            { name: 'top', type: 'number', description: 'Anzahl der Top-Produkte' }
          ],
          response: `{
  "products": [
    {
      "id": 1,
      "name": "Pizza Margherita",
      "description": "Klassische Pizza mit Tomaten und Mozzarella",
      "price": 8.50,
      "categoryId": 1,
      "allergens": ["Gluten", "Milch"],
      "isActive": true
    }
  ]
}`
        },
        {
          method: 'POST',
          url: '/api/products',
          description: 'Neues Produkt erstellen',
          auth: 'Admin/Manager',
          body: `{
  "name": "Pizza Margherita",
  "description": "Klassische Pizza",
  "price": 8.50,
  "categoryId": 1,
  "allergens": ["Gluten", "Milch"]
}`,
          response: `{
  "id": 1,
  "name": "Pizza Margherita",
  "createdAt": "2024-01-01T12:00:00Z"
}`
        }
      ]
    },
    orders: {
      title: 'Bestellungen API',
      description: 'Verwalten Sie Kundenbestellungen',
      baseUrl: '/api/orders',
      methods: [
        {
          method: 'GET',
          url: '/api/orders',
          description: 'Bestellungen abrufen',
          auth: 'Authentifiziert',
          parameters: [
            { name: 'status', type: 'string', description: 'Filter nach Status (PENDING, CONFIRMED, etc.)' },
            { name: 'customerId', type: 'number', description: 'Filter nach Kunden-ID' },
            { name: 'limit', type: 'number', description: 'Maximale Anzahl Ergebnisse' }
          ],
          response: `{
  "orders": [
    {
      "id": 1,
      "orderNumber": "123456",
      "customerId": 1,
      "totalAmount": 25.50,
      "status": "PENDING",
      "deliveryType": "DELIVERY",
      "createdAt": "2024-01-01T12:00:00Z",
      "orderItems": [...]
    }
  ]
}`
        },
        {
          method: 'POST',
          url: '/api/orders',
          description: 'Neue Bestellung erstellen',
          auth: 'Kunde+',
          body: `{
  "customerData": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max@example.com",
    "phone": "+43123456789"
  },
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "extras": []
    }
  ],
  "orderType": "delivery",
  "paymentMethod": "cash"
}`,
          response: `{
  "success": true,
  "orderId": 1,
  "orderNumber": "123456"
}`
        }
      ]
    },
    customers: {
      title: 'Kunden API',
      description: 'Kundendaten verwalten',
      baseUrl: '/api/customers',
      methods: [
        {
          method: 'GET',
          url: '/api/customers',
          description: 'Alle Kunden abrufen',
          auth: 'Admin/Manager',
          response: `{
  "customers": [
    {
      "id": 1,
      "firstName": "Max",
      "lastName": "Mustermann",
      "email": "max@example.com",
      "phone": "+43123456789",
      "totalOrders": 15,
      "totalSpent": 245.50
    }
  ]
}`
        }
      ]
    },
    analytics: {
      title: 'Analytics API',
      description: 'Geschäftsdaten und Statistiken',
      baseUrl: '/api/analytics',
      methods: [
        {
          method: 'GET',
          url: '/api/analytics',
          description: 'Geschäftsstatistiken abrufen',
          auth: 'Admin/Manager',
          parameters: [
            { name: 'period', type: 'string', description: 'Zeitraum (today, week, month, year)' },
            { name: 'startDate', type: 'string', description: 'Startdatum (YYYY-MM-DD)' },
            { name: 'endDate', type: 'string', description: 'Enddatum (YYYY-MM-DD)' }
          ],
          response: `{
  "revenue": {
    "total": 1250.50,
    "orders": 45,
    "averageOrderValue": 27.79
  },
  "topProducts": [...],
  "customerStats": {...}
}`
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Dokumentation</h1>
          <p className="mt-2 text-gray-600">
            Vollständige Referenz für die GastroCMS REST API
          </p>
        </div>

        {/* Authentifizierung Info */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Authentifizierung</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-blue-800">API-Schlüssel verwenden:</h3>
              <div className="mt-2 bg-white p-3 rounded border font-mono text-sm">
                <div>Header: <span className="text-blue-600">Authorization: Bearer YOUR_API_KEY</span></div>
                <div>oder</div>
                <div>Header: <span className="text-blue-600">X-API-Key: YOUR_API_KEY</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Base URL:</h3>
              <div className="mt-1 bg-white p-3 rounded border font-mono text-sm">
                https://ihr-domain.com
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Endpunkte</h3>
              <nav className="space-y-2">
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <button
                    key={key}
                    onClick={() => setActiveEndpoint(key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeEndpoint === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {endpoint.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow">
              {Object.entries(endpoints).map(([key, endpoint]) => (
                <div
                  key={key}
                  className={`${activeEndpoint === key ? 'block' : 'hidden'}`}
                >
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{endpoint.title}</h2>
                    <p className="mt-2 text-gray-600">{endpoint.description}</p>
                    <div className="mt-4 bg-gray-100 p-3 rounded font-mono text-sm">
                      Base URL: {endpoint.baseUrl}
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {endpoint.methods.map((method, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-3 py-1 rounded text-sm font-medium ${
                            method.method === 'GET' ? 'bg-green-100 text-green-800' :
                            method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {method.method}
                          </span>
                          <code className="text-lg font-mono">{method.url}</code>
                        </div>

                        <p className="text-gray-700 mb-4">{method.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Berechtigung:</span>
                            <span className="ml-2 text-sm text-gray-900">{method.auth}</span>
                          </div>
                        </div>

                        {method.parameters && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Parameter:</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {method.parameters.map((param, paramIdx) => (
                                    <tr key={paramIdx}>
                                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                                      <td className="px-4 py-2 text-sm text-gray-700">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {method.body && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Request Body:</h4>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                              <code>{method.body}</code>
                            </pre>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                            <code>{method.response}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Beispiele */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Beispiel-Requests</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">cURL Beispiel:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <code>{`curl -X GET "https://ihr-domain.com/api/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">JavaScript Beispiel:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <code>{`const response = await fetch('https://ihr-domain.com/api/products', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Python Beispiel:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <code>{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://ihr-domain.com/api/products', headers=headers)
data = response.json()
print(data)`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Fehlerbehandlung */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fehlerbehandlung</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">HTTP Status Codes:</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li><code className="bg-gray-100 px-2 py-1 rounded">200</code> - Erfolg</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">201</code> - Erfolgreich erstellt</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">400</code> - Ungültige Anfrage</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">401</code> - Nicht authentifiziert</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">403</code> - Keine Berechtigung</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">404</code> - Nicht gefunden</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">429</code> - Rate Limit überschritten</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">500</code> - Server Fehler</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Fehler Response Format:</h3>
              <pre className="mt-2 bg-gray-100 p-4 rounded-md text-sm">
                <code>{`{
  "error": "Beschreibung des Fehlers",
  "code": "ERROR_CODE",
  "details": {
    "field": "Spezifische Fehlerdetails"
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
