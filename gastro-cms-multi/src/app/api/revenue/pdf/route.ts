import { NextRequest, NextResponse } from 'next/server';

// Fallback für den Fall, dass Puppeteer nicht verfügbar ist
let puppeteer: any = null;

try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.warn('Puppeteer nicht verfügbar, verwende HTML-Fallback');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, days, data } = body;

    // Überprüfe ob Daten vorhanden sind
    if (!data) {
      return NextResponse.json(
        { error: 'Keine Umsatzdaten verfügbar' },
        { status: 400 }
      );
    }

    const periodLabels: { [key: string]: string } = {
      'today': 'Heute',
      'week': 'Letzte 7 Tage',
      'month': 'Letzte 30 Tage',
      'quarter': 'Letzte 90 Tage',
      'year': 'Dieses Jahr'
    };

    const periodLabel = periodLabels[period] || 'Unbekannter Zeitraum';
    const currentDate = new Date().toLocaleDateString('de-DE');

    // Erstelle HTML-Inhalt für die PDF-Generierung
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Umsatz-Report - ${periodLabel}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #6b7280;
          }
          .summary { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .card { 
            border: 1px solid #d1d5db; 
            padding: 15px; 
            border-radius: 8px; 
            background: #f9fafb; 
          }
          .card h3 { 
            margin: 0 0 10px 0; 
            color: #374151; 
            font-size: 14px;
          }
          .card .value { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2563eb; 
          }
          .section { 
            margin-bottom: 30px; 
          }
          .section h2 { 
            border-bottom: 1px solid #d1d5db; 
            padding-bottom: 10px; 
            color: #1f2937; 
            font-size: 18px;
            margin-bottom: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background: #f3f4f6; 
            font-weight: bold; 
            color: #374151;
          }
          .tax-breakdown { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 15px; 
            margin: 20px 0; 
          }
          .tax-item { 
            text-align: center; 
            padding: 15px; 
            border-radius: 8px; 
            border: 1px solid #d1d5db;
          }
          .tax-20 { 
            background: #dcfce7; 
            border-color: #22c55e; 
          }
          .tax-10 { 
            background: #dbeafe; 
            border-color: #3b82f6; 
          }
          .tax-0 { 
            background: #f3f4f6; 
            border-color: #6b7280; 
          }
          .footer {
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 10px;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
          }
          .print-instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="print-instructions">
          <strong>📄 PDF-Export:</strong> Drücke Strg+P (oder Cmd+P) und wähle "Als PDF speichern" aus
        </div>

        <div class="header">
          <h1>Umsatz-Report</h1>
          <p><strong>Zeitraum:</strong> ${periodLabel}</p>
          <p><strong>Erstellt am:</strong> ${currentDate}</p>
        </div>

        <div class="summary">
          <div class="card">
            <h3>Bruttoumsatz (inkl. MwSt.)</h3>
            <div class="value">€${(data.totalRevenue || 0).toFixed(2)}</div>
          </div>
          <div class="card">
            <h3>Netto-Umsatz (exkl. MwSt.)</h3>
            <div class="value">€${(data.totalRevenueNet || 0).toFixed(2)}</div>
          </div>
          <div class="card">
            <h3>Gesamte MwSt.</h3>
            <div class="value">€${(data.totalTax || 0).toFixed(2)}</div>
          </div>
          <div class="card">
            <h3>Bestellungen</h3>
            <div class="value">${data.totalOrders || 0}</div>
          </div>
        </div>

        <div class="section">
          <h2>MwSt. Aufschlüsselung</h2>
          <div class="tax-breakdown">
            <div class="tax-item tax-20">
              <h3>20% MwSt.</h3>
              <div class="value">€${(data.taxBreakdown?.tax20 || 0).toFixed(2)}</div>
            </div>
            <div class="tax-item tax-10">
              <h3>10% MwSt.</h3>
              <div class="value">€${(data.taxBreakdown?.tax10 || 0).toFixed(2)}</div>
            </div>
            <div class="tax-item tax-0">
              <h3>0% MwSt.</h3>
              <div class="value">€${(data.taxBreakdown?.tax0 || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        ${data.dailyBreakdown && data.dailyBreakdown.length > 0 ? `
        <div class="section">
          <h2>Tägliche Aufschlüsselung</h2>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Bestellungen</th>
                <th>Umsatz</th>
              </tr>
            </thead>
            <tbody>
              ${data.dailyBreakdown.map((day: any) => `
                <tr>
                  <td>${new Date(day.date).toLocaleDateString('de-DE')}</td>
                  <td>${day.orders || 0}</td>
                  <td>€${(day.revenue || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.topProducts && data.topProducts.length > 0 ? `
        <div class="section">
          <h2>Top-Produkte nach Umsatz</h2>
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Verkäufe</th>
                <th>Bruttoumsatz</th>
                <th>Netto-Umsatz</th>
                <th>MwSt.</th>
              </tr>
            </thead>
            <tbody>
              ${data.topProducts.map((product: any) => `
                <tr>
                  <td>${product.name || 'Unbekannt'}</td>
                  <td>${product.sales || 0}</td>
                  <td>€${(product.revenue || 0).toFixed(2)}</td>
                  <td>€${(product.revenueNet || 0).toFixed(2)}</td>
                  <td>€${(product.tax || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="section">
          <h2>Steuerabgabe Zusammenfassung</h2>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Für Steuerabgabe relevant:</h3>
            <ul style="color: #1e40af; margin: 10px 0;">
              <li>Netto-Umsatz: €${(data.totalRevenueNet || 0).toFixed(2)}</li>
              <li>20% MwSt.: €${(data.taxBreakdown?.tax20 || 0).toFixed(2)}</li>
              <li>10% MwSt.: €${(data.taxBreakdown?.tax10 || 0).toFixed(2)}</li>
              <li>0% MwSt.: €${(data.taxBreakdown?.tax0 || 0).toFixed(2)}</li>
            </ul>
            <h3 style="color: #1e40af; font-size: 16px;">Gesamtbeträge:</h3>
            <ul style="color: #1e40af; margin: 10px 0;">
              <li>Bruttoumsatz: €${(data.totalRevenue || 0).toFixed(2)}</li>
              <li>Gesamte MwSt.: €${(data.totalTax || 0).toFixed(2)}</li>
              <li>Bestellungen: ${data.totalOrders || 0}</li>
              <li>Ø Bestellwert: €${(data.averageOrderValue || 0).toFixed(2)}</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>Dieser Report wurde automatisch generiert am ${currentDate}</p>
          <p>Zeitraum: ${periodLabel} (${days || 30} Tage)</p>
        </div>
      </body>
      </html>
    `;

    // Versuche PDF mit Puppeteer zu generieren, falls verfügbar
    if (puppeteer) {
      try {
        const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // PDF generieren
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        });

        await browser.close();

        // PDF als Response zurückgeben
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="umsatz-report-${period}-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        });
      } catch (puppeteerError) {
        console.warn('Puppeteer PDF-Generierung fehlgeschlagen, verwende HTML-Fallback:', puppeteerError);
        // Fallback zu HTML
      }
    }

    // Fallback: HTML zurückgeben für manuellen PDF-Export
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="umsatz-report-${period}-${new Date().toISOString().split('T')[0]}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren der PDF: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
