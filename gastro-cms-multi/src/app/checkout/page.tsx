'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useCart } from '@/contexts/CartContext';
import { 
  ArrowLeftIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  CreditCardIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const { state: cartState, clearCart } = useCart();
  
  
  // State-Deklarationen
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryType, setDeliveryType] = useState<'now' | 'later'>('now');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [allowedPostalCodes, setAllowedPostalCodes] = useState<string[]>([]);
  const [orderDeadline, setOrderDeadline] = useState<string>('22:00');
  const [isOrderTimeValid, setIsOrderTimeValid] = useState<boolean>(true);
  
  // Trinkgeld-State
  const [tipEnabled, setTipEnabled] = useState(false);
  const [tipType, setTipType] = useState<'fixed' | 'percentage'>('fixed');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(10);
  
  // Lade Restaurant-Einstellungen beim Start
  useEffect(() => {
    const fetchRestaurantSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          
          // Lade Bestellschluss
          if (data.orderDeadline) {
            setOrderDeadline(data.orderDeadline);
          }
          
          // Lade erlaubte Postleitzahlen
          if (data.deliveryDistricts) {
            try {
              // Robuste JSON-Parsing mit Fallback
              let codes: string[] = [];
              
              try {
                codes = JSON.parse(data.deliveryDistricts);
              } catch (jsonError) {
                console.warn('JSON-Parsing fehlgeschlagen, versuche String-Parsing:', jsonError);
                
                // Fallback: Wenn es ein String ist, versuche es als Array zu parsen
                const cleaned = data.deliveryDistricts
                  .replace(/[\[\]"]/g, '') // Entferne Klammern und Anführungszeichen
                  .split(',')
                  .map((code: string) => code.trim())
                  .filter((code: string) => code.length > 0);
                
                if (cleaned.length > 0) {
                  codes = cleaned;
                } else {
                  // Letzter Fallback: Standard-Wiener Bezirke
                  codes = ['1120', '1130', '1140', '1150', '1160'];
                }
              }
              
              setAllowedPostalCodes(codes);
            } catch (error) {
              console.error('Fehler beim Parsen der Postleitzahlen:', error);
              // Fallback zu Standard-Wiener Bezirken
              setAllowedPostalCodes(['1120', '1130', '1140', '1150', '1160']);
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Restaurant-Einstellungen:', error);
        // Fallback zu Standard-Wiener Bezirken
        setAllowedPostalCodes(['1120', '1130', '1140', '1150', '1160']);
      }
    };
    
    fetchRestaurantSettings();
  }, []);

  // Prüfe Bestellschluss in Echtzeit
  useEffect(() => {
    const checkOrderTime = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      setIsOrderTimeValid(currentTime <= orderDeadline);
    };
    
    // Prüfe sofort
    checkOrderTime();
    
    // Prüfe alle 30 Sekunden
    const interval = setInterval(checkOrderTime, 30000);
    
    return () => clearInterval(interval);
  }, [orderDeadline]);

  // Berechne Liefergebühren und Trinkgeld
  const subtotal = cartState.appliedCoupon ? cartState.subtotalAfterDiscount : cartState.totalPrice;
  const deliveryFee = orderType === 'delivery' ? (subtotal >= 25 ? 0 : 2.50) : 0;
  
  // Berechne Trinkgeld
  const calculatedTipAmount = tipEnabled ? (
    tipType === 'fixed' ? tipAmount : (subtotal * tipPercentage / 100)
  ) : 0;
  
  const totalAmount = subtotal + deliveryFee + calculatedTipAmount;

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prüfe Bestellschluss
    if (!isOrderTimeValid) {
      alert(`Bestellungen sind nur bis ${orderDeadline} Uhr möglich.`);
      return;
    }
    
    // Prüfe ob AGB und Datenschutz akzeptiert wurden
    if (!agbAccepted || !privacyAccepted) {
      alert('Bitte akzeptiere die AGB und Datenschutzerklärung');
      return;
    }

    // Prüfe ob Warenkorb leer ist
    if (cartState.items.length === 0) {
      alert('Ihr Warenkorb ist leer');
      return;
    }

    // Prüfe ob Lieferadresse ausgefüllt ist bei Lieferung
    if (orderType === 'delivery') {
      if (!customerData.address || !customerData.city || !customerData.postalCode) {
        alert('Bitte füllen Sie alle Lieferadress-Felder aus');
        return;
      }
      
      // Postleitzahlen-Validierung
      if (allowedPostalCodes.length > 0 && !allowedPostalCodes.includes(customerData.postalCode)) {
        alert(`Lieferung in die Postleitzahl ${customerData.postalCode} nicht möglich. Wir liefern nur in folgende Bezirke: ${allowedPostalCodes.join(', ')}`);
        return;
      }
    }

    try {
      // Gesamtbetrag ist bereits berechnet

      const orderData = {
        customerData,
        orderItems: cartState.items,
        orderType,
        deliveryType,
        deliveryTime: deliveryType === 'later' ? deliveryTime : null,
        paymentMethod,
        appliedCoupon: cartState.appliedCoupon,
        totalAmount,
        deliveryFee,
        // Trinkgeld-Daten
        tipAmount: calculatedTipAmount,
        tipType: tipType.toUpperCase(),
        tipPercentage: tipType === 'percentage' ? tipPercentage : null
      };

      console.log('📤 Sende Bestellung an API...');
      const startTime = Date.now();
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        // Timeout nach 10 Sekunden
        signal: AbortSignal.timeout(10000)
      });
      
      const endTime = Date.now();
      console.log(`⏱️ API-Antwort nach ${endTime - startTime}ms`);

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Warenkorb leeren
          clearCart(); // Warenkorb nach erfolgreicher Bestellung leeren
          
          // Bestell-ID im localStorage speichern für Fallback
          localStorage.setItem('lastOrderId', result.orderId.toString());
          
          console.log('✅ Bestellung erfolgreich erstellt:', result);
          console.log('🔄 Weiterleitung zu:', result.redirectUrl);
          
          // Weiterleitung zur Bestellbestätigung
          window.location.href = result.redirectUrl;
        } else {
          console.error('❌ Bestellung fehlgeschlagen:', result);
          alert('Fehler beim Erstellen der Bestellung: ' + result.message);
        }
      } else {
        const error = await response.json();
        console.error('❌ HTTP-Fehler:', response.status, error);
        alert('Fehler beim Erstellen der Bestellung: ' + (error.message || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Fehler beim Absenden der Bestellung:', error);
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          alert('Die Bestellung dauert zu lange. Bitte versuchen Sie es erneut. Die Bestellung wurde möglicherweise trotzdem erstellt - prüfen Sie das Dashboard.');
        } else if (error.name === 'AbortError') {
          alert('Die Bestellung wurde abgebrochen. Bitte versuchen Sie es erneut.');
        } else {
          alert('Fehler beim Absenden der Bestellung. Bitte versuchen Sie es erneut.');
        }
      } else {
        alert('Fehler beim Absenden der Bestellung. Bitte versuchen Sie es erneut.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/warenkorb"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zurück zum Warenkorb
          </Link>
          <h1 className="text-3xl font-display font-semibold text-gray-900">
            Bestellabwicklung
          </h1>
        </div>

        {/* Bestellschluss-Warnung */}
        {!isOrderTimeValid && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Bestellschluss erreicht
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Bestellungen sind nur bis {orderDeadline} Uhr möglich.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8" role="form" aria-label="Bestellformular">
          {/* Main Form */}
          <div className="space-y-8">
            {/* Order Type and Delivery Options - 2 Spalten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Type Selection */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center">
                  <TruckIcon className="w-6 h-6 mr-3 text-brand-600" />
                  Bestellart
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      id="order-delivery"
                      name="orderType"
                      value="delivery"
                      checked={orderType === 'delivery'}
                      onChange={() => setOrderType('delivery')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <label htmlFor="order-delivery" className="flex items-center cursor-pointer">
                      <TruckIcon className="w-5 h-5 mr-2 text-brand-600" />
                      <span className="font-medium">Lieferung</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      id="order-pickup"
                      name="orderType"
                      value="pickup"
                      checked={orderType === 'pickup'}
                      onChange={() => setOrderType('pickup')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <label htmlFor="order-pickup" className="flex items-center cursor-pointer">
                      <MapPinIcon className="w-5 h-5 mr-2 text-brand-600" />
                      <span className="font-medium">Abholung</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Delivery Options - nur bei Lieferung */}
              {orderType === 'delivery' && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center">
                    <ClockIcon className="w-6 h-6 mr-3 text-brand-600" />
                    Lieferoptionen
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        id="delivery-now"
                        name="deliveryType"
                        value="now"
                        checked={deliveryType === 'now'}
                        onChange={() => setDeliveryType('now')}
                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      />
                      <label htmlFor="delivery-now" className="flex items-center cursor-pointer">
                        <ClockIcon className="w-5 h-5 mr-2 text-brand-600" />
                        <span className="font-medium">Jetzt liefern</span>
                        <span className="ml-2 text-sm text-gray-500">(30-60 Minuten)</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        id="delivery-later"
                        name="deliveryType"
                        value="later"
                        checked={deliveryType === 'later'}
                        onChange={() => setDeliveryType('later')}
                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      />
                      <label htmlFor="delivery-later" className="flex items-center cursor-pointer">
                        <ClockIcon className="w-5 h-5 mr-2 text-brand-600" />
                        <span className="font-medium">Später liefern</span>
                      </label>
                    </div>
                    
                    {deliveryType === 'later' && (
                      <div className="ml-8">
                        <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                          Gewünschte Lieferzeit
                        </label>
                        <input
                          type="datetime-local"
                          id="deliveryTime"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-brand-600" />
                Persönliche Daten
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={customerData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={customerData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address - nur bei Lieferung */}
            {orderType === 'delivery' && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-display font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPinIcon className="w-6 h-6 mr-3 text-brand-600" />
                  Lieferadresse
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Straße & Hausnummer *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={customerData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                        PLZ *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={customerData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        Stadt *
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={customerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                Bestellübersicht
              </h2>
              
              
              {/* Bestellte Artikel */}
              {cartState.items.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bestellte Artikel</h3>
                  <div className="space-y-3">
                    {cartState.items.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          
                          {/* Extras anzeigen */}
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Extras:</p>
                              <div className="space-y-1">
                                {item.extras.map((extra, extraIndex) => (
                                  <div key={extraIndex} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">+ {extra.name}</span>
                                    <span className="text-gray-500">
                                      {extra.price > 0 ? `+€${extra.price.toFixed(2)}` : 'kostenlos'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span>Menge: {item.quantity}</span>
                            <span className="mx-2">•</span>
                            <span>Einzelpreis: €{(item.price + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-medium text-gray-900">
                            €{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-center">
                    <strong>Keine Artikel im Warenkorb!</strong><br />
                    Bitte kehren Sie zum Warenkorb zurück und fügen Sie Artikel hinzu.
                  </p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Zwischensumme</span>
                  <span>€{cartState.totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {cartState.appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <TicketIcon className="w-4 h-4 mr-2" />
                      Gutschein "{cartState.appliedCoupon.code}"
                    </span>
                    <span>-€{cartState.discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Lieferung</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                    {deliveryFee === 0 ? "Kostenlos" : `€${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                
                {tipEnabled && calculatedTipAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Trinkgeld für Lieferant</span>
                    <span className="text-green-600 font-semibold">
                      €{calculatedTipAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Gesamtbetrag</span>
                    <span>€{totalAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2 text-brand-600" />
                  Zahlungsart
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="payment-cash"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <label htmlFor="payment-cash" className="cursor-pointer">
                      <span className="font-medium">Bar bei Lieferung</span>
                      <span className="ml-2 text-sm text-gray-500">(Empfohlen)</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="payment-card"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <label htmlFor="payment-card" className="cursor-pointer">
                      <span className="font-medium">Kartenzahlung</span>
                      <span className="ml-2 text-sm text-gray-500">(EC-Karte, Kreditkarte)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trinkgeld für Lieferant */}
              {orderType === 'delivery' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Trinkgeld für Lieferant
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="tip-enabled"
                        checked={tipEnabled}
                        onChange={(e) => setTipEnabled(e.target.checked)}
                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      />
                      <label htmlFor="tip-enabled" className="cursor-pointer">
                        <span className="font-medium">Trinkgeld geben</span>
                        <span className="ml-2 text-sm text-gray-500">(optional)</span>
                      </label>
                    </div>

                    {tipEnabled && (
                      <div className="ml-7 space-y-4">
                        {/* Trinkgeld-Typ */}
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="tip-fixed"
                              name="tipType"
                              value="fixed"
                              checked={tipType === 'fixed'}
                              onChange={() => setTipType('fixed')}
                              className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                            />
                            <label htmlFor="tip-fixed" className="cursor-pointer">
                              <span className="font-medium">Fester Betrag</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="tip-percentage"
                              name="tipType"
                              value="percentage"
                              checked={tipType === 'percentage'}
                              onChange={() => setTipType('percentage')}
                              className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                            />
                            <label htmlFor="tip-percentage" className="cursor-pointer">
                              <span className="font-medium">Prozent</span>
                            </label>
                          </div>
                        </div>

                        {/* Trinkgeld-Eingabe */}
                        <div className="flex items-center space-x-3">
                          {tipType === 'fixed' ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                step="0.50"
                                value={tipAmount}
                                onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                placeholder="0.00"
                              />
                              <span className="text-gray-500">€</span>
                            </>
                          ) : (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={tipPercentage}
                                onChange={(e) => setTipPercentage(parseFloat(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                placeholder="10"
                              />
                              <span className="text-gray-500">%</span>
                              <span className="text-sm text-gray-500">
                                (€{calculatedTipAmount.toFixed(2)})
                              </span>
                            </>
                          )}
                        </div>

                        {/* Vordefinierte Beträge */}
                        {tipType === 'fixed' && (
                          <div className="flex space-x-2">
                            {[1, 2, 5, 10].map(amount => (
                              <button
                                key={amount}
                                type="button"
                                onClick={() => setTipAmount(amount)}
                                className={`px-3 py-1 text-sm rounded-md border ${
                                  tipAmount === amount
                                    ? 'bg-brand-600 text-white border-brand-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                €{amount}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AGB und Datenschutz */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agb-accepted"
                    checked={agbAccepted}
                    onChange={(e) => setAgbAccepted(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 mt-1 flex-shrink-0"
                    required
                  />
                  <label htmlFor="agb-accepted" className="text-sm text-gray-700 cursor-pointer leading-tight whitespace-nowrap">
                    Ich akzeptiere die{' '}
                    <a href="/agb" target="_blank" className="text-brand-600 hover:text-brand-700 underline">
                      AGB
                    </a> *
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy-accepted"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 mt-1 flex-shrink-0"
                    required
                  />
                  <label htmlFor="privacy-accepted" className="text-sm text-gray-700 cursor-pointer leading-tight whitespace-nowrap">
                    Ich akzeptiere die{' '}
                    <a href="/datenschutz" target="_blank" className="text-brand-600 hover:text-brand-700 underline">
                      Datenschutzerklärung
                    </a> *
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!isOrderTimeValid}
                className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center ${
                  isOrderTimeValid 
                    ? 'bg-brand-600 text-white hover:bg-brand-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                {isOrderTimeValid ? 'Bestellung abschicken' : 'Bestellschluss erreicht'}
              </button>
              
              <div className="mt-4 text-center">
                <Link
                  href="/warenkorb"
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  Zurück zum Warenkorb
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
