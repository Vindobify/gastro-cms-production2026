'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  QrCodeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  LinkIcon,
  TagIcon,
  GiftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface Coupon {
  id: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  categoryId?: number;
  productId?: number;
}

type QRType = 'voucher' | 'category' | 'custom';

export default function QRGeneratorPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [qrType, setQrType] = useState<QRType>('category');
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QR Code styling options
  const [qrSize, setQrSize] = useState<number>(300);
  const [qrMargin, setQrMargin] = useState<number>(2);
  const [qrDarkColor, setQrDarkColor] = useState<string>('#000000');
  const [qrLightColor, setQrLightColor] = useState<string>('#FFFFFF');
  const [qrErrorCorrectionLevel, setQrErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Load data
  useEffect(() => {
    loadCategories();
    loadCoupons();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.filter((c: Coupon) => c.isActive));
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    }
  };

  const generateQRCode = async () => {
    setLoading(true);
    
    try {
      let targetUrl = '';
      
      // Determine target URL based on type
      switch (qrType) {
        case 'voucher':
          if (!selectedCoupon) {
            error('Bitte wählen Sie einen Gutschein aus');
            setLoading(false);
            return;
          }
          // Auto-activate voucher and create direct link
          const couponResponse = await fetch(`/api/coupons/${selectedCoupon}`);
          if (couponResponse.ok) {
            const couponData = await couponResponse.json();
            
            if (couponData.categoryId) {
              // Get category slug for URL
              const categoryResponse = await fetch(`/api/categories/${couponData.categoryId}`);
              if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                targetUrl = `${window.location.origin}/frontend/speisekarte/${categoryData.slug}?coupon=${selectedCoupon}`;
              } else {
                // Fallback to general menu with coupon
                targetUrl = `${window.location.origin}/frontend/speisekarte?coupon=${selectedCoupon}`;
              }
            } else if (couponData.productId) {
              // For product-specific coupons, go to general menu with coupon
              // Could be enhanced to go directly to product page
              targetUrl = `${window.location.origin}/frontend/speisekarte?coupon=${selectedCoupon}`;
            } else {
              // General coupon
              targetUrl = `${window.location.origin}/frontend/speisekarte?coupon=${selectedCoupon}`;
            }
          } else {
            // Fallback if coupon details can't be loaded
            targetUrl = `${window.location.origin}/frontend/speisekarte?coupon=${selectedCoupon}`;
          }
          break;
          
        case 'category':
          if (!selectedCategory) {
            error('Bitte wählen Sie eine Kategorie aus');
            setLoading(false);
            return;
          }
          const category = categories.find(c => c.id.toString() === selectedCategory);
          if (category) {
            targetUrl = `${window.location.origin}/frontend/speisekarte/${category.slug}`;
          } else {
            error('Kategorie nicht gefunden');
            setLoading(false);
            return;
          }
          break;
          
        case 'custom':
          if (!customUrl) {
            error('Bitte geben Sie eine URL ein');
            setLoading(false);
            return;
          }
          targetUrl = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
          break;
      }

      // Validate targetUrl
      if (!targetUrl) {
        error('Keine gültige URL generiert');
        setLoading(false);
        return;
      }

      // Generate QR Code
      const canvas = canvasRef.current;
      if (!canvas) {
        error('Canvas-Element nicht gefunden');
        setLoading(false);
        return;
      }

      await QRCode.toCanvas(canvas, targetUrl, {
        width: qrSize,
        margin: qrMargin,
        color: {
          dark: qrDarkColor,
          light: qrLightColor
        },
        errorCorrectionLevel: qrErrorCorrectionLevel
      });
      
      setQrCodeUrl(targetUrl);
      success('QR Code erfolgreich generiert!');
      
    } catch (err) {
      console.error('Error generating QR code:', err);
      error(`Fehler beim Generieren des QR Codes: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${qrType}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const printQRCode = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>QR Code</title></head>
            <body style="text-align: center; padding: 20px;">
              <h2>QR Code</h2>
              <img src="${canvas.toDataURL()}" style="max-width: 100%;" />
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                ${qrCodeUrl}
              </p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!user || !['ADMIN', 'RESTAURANT_MANAGER'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Zugriff verweigert</h1>
          <p className="mt-2 text-gray-600">Sie haben keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="QR Code Generator" subtitle="Erstellen Sie QR Codes für Marketing-Zwecke">
      <div className="space-y-8">
        
        {/* QR Type Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Typ auswählen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voucher Option */}
            <button
              onClick={() => setQrType('voucher')}
              className={`p-4 rounded-lg border-2 transition-all ${
                qrType === 'voucher'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <GiftIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Gutschein</h4>
              <p className="text-sm text-gray-500 mt-1">
                QR Code für Gutschein-Aktivierung
              </p>
            </button>

            {/* Category Option */}
            <button
              onClick={() => setQrType('category')}
              className={`p-4 rounded-lg border-2 transition-all ${
                qrType === 'category'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <TagIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Kategorie</h4>
              <p className="text-sm text-gray-500 mt-1">
                Direkter Link zu Kategorie-Seite
              </p>
            </button>

            {/* Custom Option */}
            <button
              onClick={() => setQrType('custom')}
              className={`p-4 rounded-lg border-2 transition-all ${
                qrType === 'custom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LinkIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Eigener Link</h4>
              <p className="text-sm text-gray-500 mt-1">
                QR Code für beliebige URL
              </p>
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Konfiguration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - QR Type Configuration */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">QR Code Inhalt</h4>
              
              {qrType === 'voucher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gutschein auswählen
                  </label>
                  <select
                    value={selectedCoupon}
                    onChange={(e) => setSelectedCoupon(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bitte wählen...</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.id} value={coupon.code}>
                        {coupon.name} ({coupon.code}) - {coupon.discountValue}
                        {coupon.discountType === 'PERCENTAGE' ? '%' : '€'}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Der Gutschein wird automatisch beim Scannen aktiviert
                  </p>
                </div>
              )}

              {qrType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie auswählen
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bitte wählen...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Kunden landen direkt in der gewählten Kategorie
                  </p>
                </div>
              )}

              {qrType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL eingeben
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com oder example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Beliebige URL für den QR Code
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - QR Code Styling */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">QR Code Design</h4>
              
              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farbvorlagen
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setQrDarkColor('#000000');
                      setQrLightColor('#FFFFFF');
                    }}
                    className="p-2 border rounded-md text-xs hover:bg-gray-50"
                  >
                    Klassisch
                  </button>
                  <button
                    onClick={() => {
                      setQrDarkColor('#059669');
                      setQrLightColor('#FFFFFF');
                    }}
                    className="p-2 border rounded-md text-xs hover:bg-gray-50"
                  >
                    Restaurant
                  </button>
                  <button
                    onClick={() => {
                      setQrDarkColor('#1F2937');
                      setQrLightColor('#F9FAFB');
                    }}
                    className="p-2 border rounded-md text-xs hover:bg-gray-50"
                  >
                    Modern
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dunkle Farbe
                  </label>
                  <input
                    type="color"
                    value={qrDarkColor}
                    onChange={(e) => setQrDarkColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Helle Farbe
                  </label>
                  <input
                    type="color"
                    value={qrLightColor}
                    onChange={(e) => setQrLightColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Größe: {qrSize}px
                </label>
                <input
                  type="range"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  min={200}
                  max={600}
                  step={50}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rand: {qrMargin}px
                </label>
                <input
                  type="range"
                  value={qrMargin}
                  onChange={(e) => setQrMargin(parseInt(e.target.value))}
                  min={0}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fehlerkorrektur
                </label>
                <select
                  value={qrErrorCorrectionLevel}
                  onChange={(e) => setQrErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Niedrig (L) - Kleinere Dateigröße</option>
                  <option value="M">Mittel (M) - Empfohlen</option>
                  <option value="Q">Hoch (Q) - Bessere Lesbarkeit</option>
                  <option value="H">Sehr hoch (H) - Maximale Sicherheit</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={generateQRCode}
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            {loading ? 'Generiere...' : 'QR Code generieren'}
          </button>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Vorschau</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <canvas
                ref={canvasRef}
                className="border border-gray-200 rounded-lg"
                width={qrSize}
                height={qrSize}
              />
            </div>
            
            {qrCodeUrl && (
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ziel-URL:
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-900 break-all">
                    {qrCodeUrl}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download PNG
                  </button>
                  
                  <button
                    onClick={printQRCode}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Drucken
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Verwendungstipps</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Gutschein-QRs:</strong> Platzieren Sie diese auf Flyern oder Social Media</li>
            <li>• <strong>Kategorie-QRs:</strong> Ideal für Tischaufsteller (z.B. "Pizza-QR" am Tisch)</li>
            <li>• <strong>Custom-QRs:</strong> Für spezielle Aktionen oder externe Links</li>
            <li>• <strong>Druckqualität:</strong> Mindestens 3x3 cm für gute Lesbarkeit</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
