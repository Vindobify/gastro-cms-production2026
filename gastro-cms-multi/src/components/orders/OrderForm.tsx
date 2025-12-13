'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface OrderFormData {
  customerId: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedExtras: Array<{
      extraGroupId: number;
      extraItemId: number;
      name: string;
      price: number;
    }>;
  }>;
  deliveryType: string;
  deliveryTime: string;
  deliveryMinutes?: number;
  notes: string;
  couponCode: string;
  appliedCoupon?: {
    id: number;
    code: string;
    name: string;
    discountAmount: number;
    discountDescription: string;
  };
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  articleNumber?: string;
}

interface Category {
  id: number;
  name: string;
}

interface ExtraGroup {
  id: number;
  name: string;
  description?: string;
  selectionType: string;
  isRequired: boolean;
  maxSelections?: number;
  minSelections: number;
  extras: Array<{
    id: number;
    name: string;
    price: number;
    isFree: boolean;
  }>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  products: Array<{
    id: number;
    name: string;
  }>;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function OrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [extras, setExtras] = useState<ExtraGroup[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: 0,
    orderItems: [],
    deliveryType: 'PICKUP',
    deliveryTime: '',
    deliveryMinutes: undefined,
    notes: '',
    couponCode: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchExtras();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExtras = async () => {
    try {
      const response = await fetch('/api/extras');
      if (response.ok) {
        const data = await response.json();
        setExtras(data);
      }
    } catch (error) {
      console.error('Error fetching extras:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Gefilterte Produkte basierend auf Kategorie und Suchbegriff
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.articleNumber && product.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Extras für ein bestimmtes Produkt
  const getProductExtras = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    return extras.filter(extraGroup => {
      // Direkte Produkt-Zuordnung
      const hasDirectProduct = extraGroup.products.some(p => p.id === productId);
      
      // Kategorie-Zuordnung
      const hasCategory = product.categoryId && 
        extraGroup.categories.some(c => c.id === product.categoryId);
      
      return hasDirectProduct || hasCategory;
    });
  };

  const addOrderItem = (product: Product) => {
    setFormData(prev => {
      const newOrderItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        selectedExtras: []
      };
      
      return {
        ...prev,
        orderItems: [...prev.orderItems, newOrderItem]
      };
    });
  };

  const updateOrderItem = (index: number, field: 'quantity', value: number) => {
    setFormData(prev => {
      const newOrderItems = [...prev.orderItems];
      const item = { ...newOrderItems[index] };
      
      if (field === 'quantity') {
        item.quantity = value;
        const extrasTotal = item.selectedExtras.reduce((sum, e) => sum + e.price, 0);
        item.totalPrice = (value * item.unitPrice) + extrasTotal;
      }
      
      newOrderItems[index] = item;
      return { ...prev, orderItems: newOrderItems };
    });
  };

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const toggleExtra = (itemIndex: number, extraGroup: ExtraGroup, extraItem: {
    id: number;
    name: string;
    price: number;
    isFree: boolean;
  }) => {
    setFormData(prev => {
      // Debug-Ausgabe für Radio-Buttons
      if (isRadioSelection(extraGroup.selectionType)) {
        console.log('Radio-Button geklickt:', {
          extraGroup: extraGroup.name,
          extraItem: extraItem.name,
          itemIndex,
          currentSelected: prev.orderItems[itemIndex]?.selectedExtras || []
        });
      }

      // Vollständig immutable State-Update
      const newOrderItems = prev.orderItems.map((oi, i) => {
        if (i === itemIndex) {
          // selectedExtras IMMER klonen, sonst Mutationen am alten State!
          const selected = Array.isArray(oi.selectedExtras) ? [...oi.selectedExtras] : [];
          
          const existingIndex = selected.findIndex(e =>
            e.extraGroupId === extraGroup.id && e.extraItemId === extraItem.id
          );

          if (existingIndex > -1) {
            // Extra entfernen
            selected.splice(existingIndex, 1);
            console.log('Extra entfernt:', extraItem.name);
          } else {
            // Radio = nur eine Wahl pro Gruppe
            if (isRadioSelection(extraGroup.selectionType)) {
              // Alle anderen Extras aus der gleichen Gruppe entfernen
              const filtered = selected.filter(e => e.extraGroupId !== extraGroup.id);
              selected.length = 0; // Array leeren
              selected.push(...filtered); // Gefilterte Extras wieder hinzufügen
              console.log('Radio-Button: Andere Extras entfernt, neues hinzugefügt:', extraItem.name);
            }

            // maxSelections respektieren (falls gesetzt und nicht RADIO)
            if (!isRadioSelection(extraGroup.selectionType) && extraGroup.maxSelections && 
                selected.filter(e => e.extraGroupId === extraGroup.id).length >= extraGroup.maxSelections) {
              // Hier könntest du eine UI-Info anzeigen statt stumm abzubrechen
              return oi; // Keine Änderung
            }

            // Neues Extra hinzufügen
            selected.push({
              extraGroupId: extraGroup.id,
              extraItemId: extraItem.id,
              name: extraItem.name,
              price: extraItem.isFree ? 0 : extraItem.price
            });
          }

          // Gesamtpreis neu berechnen
          const extrasTotal = selected.reduce((sum, e) => sum + e.price, 0);
          const newTotalPrice = (oi.quantity * oi.unitPrice) + extrasTotal;

          const updatedItem = {
            ...oi,
            selectedExtras: selected,
            totalPrice: newTotalPrice
          };

          // Debug-Ausgabe für den finalen State
          if (isRadioSelection(extraGroup.selectionType)) {
            console.log('Finaler State für Radio-Button:', {
              selectedExtras: updatedItem.selectedExtras,
              totalPrice: updatedItem.totalPrice
            });
          }

          return updatedItem;
        }
        return oi;
      });

      return { ...prev, orderItems: newOrderItems };
    });
  };

  const isExtraSelected = (itemIndex: number, extraGroupId: number, extraItemId: number) => {
    const item = formData.orderItems[itemIndex];
    if (!item || !Array.isArray(item.selectedExtras)) return false;
    
    const isSelected = item.selectedExtras.some(e => 
      e.extraGroupId === extraGroupId && e.extraItemId === extraItemId
    );

    // Debug-Ausgabe für Radio-Buttons
    if (isSelected) {
      console.log('Extra ist ausgewählt:', {
        extraGroupId,
        extraItemId,
        selectedExtras: item.selectedExtras
      });
    }
    
    return isSelected;
  };

  const getSelectedExtrasForGroup = (itemIndex: number, extraGroupId: number) => {
    return formData.orderItems[itemIndex]?.selectedExtras.filter(e => 
      e.extraGroupId === extraGroupId
    ) || [];
  };

  // Hilfsfunktion für case-insensitive Selection-Type-Prüfung
  const isRadioSelection = (selectionType: string | undefined): boolean => {
    return (selectionType || '').toUpperCase() === 'RADIO';
  };

  // Hilfsfunktion für sichere Preisformatierung
  const safePriceFormat = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  };

  // Debug-Funktion für State-Überprüfung
  const debugState = () => {
    console.log('Aktueller Form-State:', {
      orderItems: formData.orderItems.map((item, index) => ({
        index,
        productId: item.productId,
        selectedExtras: item.selectedExtras,
        totalPrice: item.totalPrice
      }))
    });
  };

  const validateCoupon = async () => {
    if (!formData.couponCode.trim()) return;

    try {
      const orderTotal = formData.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formData.couponCode,
          customerId: formData.customerId,
          orderItems: formData.orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            extraIds: item.selectedExtras.map(e => e.extraItemId)
          })),
          orderTotal: orderTotal
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          appliedCoupon: {
            id: data.coupon.id,
            code: data.coupon.code,
            name: data.coupon.name,
            discountAmount: data.discountAmount,
            discountDescription: data.discountDescription
          }
        }));
      } else {
        const errorData = await response.json();
        alert(`Gutschein ungültig: ${errorData.error}`);
        setFormData(prev => ({
          ...prev,
          couponCode: '',
          appliedCoupon: undefined
        }));
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      alert('Fehler bei der Gutschein-Validierung');
    }
  };

  const removeCoupon = () => {
    setFormData(prev => ({
      ...prev,
      couponCode: '',
      appliedCoupon: undefined
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = formData.appliedCoupon?.discountAmount || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.customerId === 0) {
      alert('Bitte wähle einen Kunden aus.');
      return;
    }

    if (formData.orderItems.length === 0) {
      alert('Bitte füge mindestens ein Produkt hinzu.');
      return;
    }

    if (formData.orderItems.some(item => item.productId === 0)) {
      alert('Bitte wähle für alle Produkte einen Artikel aus.');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerId: formData.customerId,
        orderItems: formData.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          extraIds: item.selectedExtras.map(e => e.extraItemId)
        })),
        deliveryType: formData.deliveryType,
        deliveryTime: formData.deliveryType === 'PICKUP' ? undefined : 
          formData.deliveryType === 'DELIVERY_NOW' ? 
            new Date(Date.now() + (formData.deliveryMinutes || 30) * 60000).toISOString() :
            formData.deliveryTime,
        notes: formData.notes,
        couponCode: formData.couponCode || undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('Bestellung erfolgreich erstellt!');
        router.push('/dashboard/orders');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Fehler beim Erstellen der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Neue Bestellung</h1>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kunde auswählen */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kunde</h3>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Kunde auswählen...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        {/* Produktauswahl - 3-Spalten Layout */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produkte auswählen</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Links: Kategorien */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Kategorien</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedCategory === null 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Alle Kategorien
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === category.id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mitte: Produkte */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Produkte</h4>
              
              {/* Suchleiste */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Artikelnummer oder Name suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Produktliste */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Keine Produkte gefunden
                  </p>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addOrderItem(product)}
                      className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.articleNumber && (
                            <p className="text-sm text-gray-500">Art. {product.articleNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">€{product.price.toFixed(2)}</p>
                          <PlusIcon className="h-4 w-4 text-blue-500 ml-auto" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Rechts: Bestellübersicht */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Bestellübersicht</h4>
              
              {formData.orderItems.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  <p>Keine Produkte ausgewählt</p>
                  <p className="text-xs mt-1">Wähle Produkte aus der mittleren Spalte</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {formData.orderItems.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const productExtras = getProductExtras(item.productId);
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {/* Produkt-Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{product?.name}</h5>
                            <p className="text-xs text-gray-600">
                              {item.quantity}x €{safePriceFormat(item.unitPrice)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Menge ändern */}
                        <div className="mb-2">
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-600">Menge:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>

                        {/* Extras - kompakt */}
                        {productExtras.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 mb-1">Extras:</p>
                            <div className="space-y-1">
                              {productExtras.map(extraGroup => (
                                <div key={extraGroup.id} className="border-l-2 border-blue-200 pl-2">
                                  <p className="text-xs font-medium text-gray-700 mb-1">
                                    {extraGroup.name}
                                    {extraGroup.isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </p>
                                  
                                  <div className="grid grid-cols-1 gap-1">
                                    {extraGroup.extras.map(extraItem => {
                                      const isSelected = isExtraSelected(index, extraGroup.id, extraItem.id);
                                      return (
                                        <button
                                          key={extraItem.id}
                                          type="button"
                                          onClick={() => toggleExtra(index, extraGroup, extraItem)}
                                          className={`w-full text-left p-1.5 rounded text-xs transition-colors ${
                                            isSelected
                                              ? 'bg-blue-100 border border-blue-300 text-blue-700'
                                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span className={`inline-block w-3 h-3 rounded mr-1.5 ${
                                                isRadioSelection(extraGroup.selectionType) ? 'rounded-full' : 'rounded'
                                              } ${
                                                isSelected ? 'bg-blue-600' : 'bg-gray-300'
                                              }`}>
                                                {isSelected && (
                                                  <span className="text-white text-xs flex items-center justify-center">
                                                    {isRadioSelection(extraGroup.selectionType) ? '●' : '✓'}
                                                  </span>
                                                )}
                                              </span>
                                              <span className="font-medium text-xs">
                                                {extraItem.name}
                                              </span>
                                            </div>
                                            <span className="text-xs">
                                              {extraItem.isFree ? '(kostenlos)' : `(+€${safePriceFormat(extraItem.price)})`}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  {extraGroup.isRequired && getSelectedExtrasForGroup(index, extraGroup.id).length === 0 && (
                                    <p className="mt-1 text-xs text-red-600">
                                      Mindestens eine Auswahl erforderlich
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Gesamtpreis */}
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Gesamtpreis:</span>
                            <span className="font-medium text-sm text-blue-600">
                              €{safePriceFormat(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lieferung und Notizen */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lieferung und Notizen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieferart</label>
              <select
                value={formData.deliveryType}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    deliveryType: e.target.value,
                    deliveryTime: '',
                    deliveryMinutes: undefined
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PICKUP">Abholung</option>
                <option value="DELIVERY_NOW">Jetzt liefern</option>
                <option value="DELIVERY_LATER">Später liefern</option>
              </select>
            </div>

            {formData.deliveryType === 'DELIVERY_NOW' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieferzeit</label>
                <select
                  value={formData.deliveryMinutes || 30}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 Minuten</option>
                  <option value={45}>45 Minuten</option>
                  <option value={60}>60 Minuten</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 inline mr-1" />
                  Lieferung in {formData.deliveryMinutes || 30} Minuten
                </p>
              </div>
            )}

            {formData.deliveryType === 'DELIVERY_LATER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieferzeit</label>
                <input
                  type="datetime-local"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3 inline mr-1" />
                  Wähle gewünschte Lieferzeit
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optionale Notizen zur Bestellung..."
            />
          </div>
        </div>

        {/* Gutschein */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gutschein</h3>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value }))}
              placeholder="Gutscheincode eingeben..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={validateCoupon}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Einlösen
            </button>
          </div>

          {formData.appliedCoupon && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Gutschein angewendet: {formData.appliedCoupon.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Rabatt: -€{formData.appliedCoupon.discountAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zusammenfassung */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Zusammenfassung</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Zwischensumme:</span>
              <span>€{formData.orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
            </div>
            
            {formData.appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Rabatt ({formData.appliedCoupon.name}):</span>
                <span>-€{formData.appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 font-medium">
              <div className="flex justify-between">
                <span>Gesamtbetrag:</span>
                <span>€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug und Submit Buttons */}
        <div className="flex justify-between items-center">
          {/* Debug Button (nur in Entwicklung) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={debugState}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Debug State
            </button>
          )}
          
          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/orders')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird erstellt...' : 'Bestellung erstellen'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
