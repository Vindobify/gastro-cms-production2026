'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Allergen {
  code: string;
  name: string;
  description: string;
  color: string;
}

const STANDARD_ALLERGENS: Allergen[] = [
  { code: 'A', name: 'Gluten', description: 'Enthält Gluten', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'B', name: 'Krebstiere', description: 'Enthält Krebstiere', color: 'bg-red-100 text-red-800' },
  { code: 'C', name: 'Eier', description: 'Enthält Eier', color: 'bg-orange-100 text-orange-800' },
  { code: 'D', name: 'Fische', description: 'Enthält Fische', color: 'bg-blue-100 text-blue-800' },
  { code: 'E', name: 'Erdnüsse', description: 'Enthält Erdnüsse', color: 'bg-brown-100 text-brown-800' },
  { code: 'F', name: 'Sojabohnen', description: 'Enthält Sojabohnen', color: 'bg-green-100 text-green-800' },
  { code: 'G', name: 'Milch', description: 'Enthält Milch', color: 'bg-gray-100 text-gray-800' },
  { code: 'H', name: 'Schalenfrüchte', description: 'Enthält Schalenfrüchte', color: 'bg-purple-100 text-purple-800' },
  { code: 'I', name: 'Sellerie', description: 'Enthält Sellerie', color: 'bg-lime-100 text-lime-800' },
  { code: 'J', name: 'Senf', description: 'Enthält Senf', color: 'bg-amber-100 text-amber-800' },
  { code: 'K', name: 'Sesamsamen', description: 'Enthält Sesamsamen', color: 'bg-stone-100 text-stone-800' },
  { code: 'L', name: 'Schwefeldioxid', description: 'Enthält Schwefeldioxid', color: 'bg-slate-100 text-slate-800' },
  { code: 'M', name: 'Lupinen', description: 'Enthält Lupinen', color: 'bg-indigo-100 text-indigo-800' },
  { code: 'N', name: 'Weichtiere', description: 'Enthält Weichtiere', color: 'bg-pink-100 text-pink-800' },
  { code: 'NONE', name: 'Keine Allergene', description: 'Keine Allergene vorhanden', color: 'bg-green-100 text-green-800' }
];

export default function AllergensTable() {
  const [allergens, setAllergens] = useState<Allergen[]>(STANDARD_ALLERGENS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAllergens = allergens.filter(allergen =>
    allergen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allergen.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Standard-Allergene</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Allergene suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ExclamationTriangleIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beschreibung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farbe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllergens.map((allergen) => (
                <tr key={allergen.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {allergen.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {allergen.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {allergen.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${allergen.color}`}>
                      Beispiel
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Allergene-Verwaltung
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Diese Tabelle zeigt alle Standard-Allergene, die in der EU für Lebensmittelkennzeichnung verwendet werden. 
                  Diese Allergene können Produkten zugewiesen werden, um Kunden über mögliche allergische Reaktionen zu informieren.
                </p>
                <p className="mt-2">
                  <strong>Wichtig:</strong> Das Allergen "NONE" (Keine Allergene) kann einem Produkt zugewiesen werden, 
                  wenn es garantiert keine Allergene enthält.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
