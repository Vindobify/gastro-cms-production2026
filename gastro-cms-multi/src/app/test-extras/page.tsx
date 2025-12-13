'use client';

import { useState, useEffect } from 'react';

export default function TestExtrasPage() {
  const [extras, setExtras] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [extrasRes, productsRes] = await Promise.all([
        fetch('/api/extras'),
        fetch('/api/products')
      ]);

      if (extrasRes.ok) {
        const extrasData = await extrasRes.json();
        setExtras(extrasData);
        console.log('Extras geladen:', extrasData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        console.log('Produkte geladen:', productsData);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Lade...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test: Extras & Produkte</h1>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Extras */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Extras ({extras.length})</h2>
          {extras.length === 0 ? (
            <p className="text-gray-500">Keine Extras vorhanden</p>
          ) : (
            <div className="space-y-3">
              {extras.map((extra: any) => (
                <div key={extra.id} className="border p-3 rounded">
                  <h3 className="font-medium">{extra.name}</h3>
                  <p className="text-sm text-gray-600">{extra.description}</p>
                  <p className="text-sm">Typ: {extra.selectionType}</p>
                  <p className="text-sm">Extras: {extra.extras?.length || 0}</p>
                  <p className="text-sm">Produkte: {extra.products?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produkte */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Produkte ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">Keine Produkte vorhanden</p>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <div key={product.id} className="border p-3 rounded">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm">Preis: €{product.price}</p>
                  <p className="text-sm">Extras: {product.productExtras?.length || 0}</p>
                  {product.productExtras && product.productExtras.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Zugewiesene Extras:</p>
                      {product.productExtras.map((pe: any) => (
                        <div key={pe.id} className="text-xs text-gray-500 ml-2">
                          - {pe.extraGroup.name} ({pe.extraGroup.extraItems.length} Optionen)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
