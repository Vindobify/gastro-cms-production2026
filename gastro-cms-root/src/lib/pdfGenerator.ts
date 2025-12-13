import puppeteer from 'puppeteer';

export interface Order {
  id: number;
  restaurant_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  has_delivery_service: boolean;
  delivery_service_name?: string;
  monthly_revenue?: number;
  status: string;
  notes?: string;
  created_at: string;
}

export async function generateInvoicePDF(invoice: any, customer: any): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rechnung ${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RECHNUNG</h1>
        <h2>${invoice.invoice_number}</h2>
      </div>
      
      <div class="company-info">
        <h3>Gastro CMS 3.0</h3>
        <p>Musterstraße 123<br>12345 Musterstadt<br>Deutschland</p>
        <p>E-Mail: info@gastro-cms.com<br>Telefon: +49 123 456789</p>
      </div>
      
      <div class="invoice-details">
        <h3>Rechnungsempfänger:</h3>
        <p><strong>${customer.restaurant_name}</strong></p>
        ${customer.owner_name ? `<p>${customer.owner_name}</p>` : ''}
        <p>${customer.email}</p>
        ${customer.address ? `<p>${customer.address}<br>${customer.postal_code} ${customer.city}</p>` : ''}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Beschreibung</th>
            <th>Betrag</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.title}</td>
            <td>€${invoice.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>MwSt. (${invoice.tax_rate}%)</td>
            <td>€${(invoice.amount * invoice.tax_rate / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="total">Gesamtbetrag:</td>
            <td class="total">€${(invoice.amount * (1 + invoice.tax_rate / 100)).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      
      <div class="footer">
        <p>Vielen Dank für Ihr Vertrauen!</p>
        <p>Erstellt am: ${new Date(invoice.created_at).toLocaleDateString('de-DE')}</p>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html);
  
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
  return pdfBuffer;
}

export async function generateOrderBookPDF(orders: Order[]) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    const html = generateOrderBookHTML(orders);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

function generateOrderBookHTML(orders: Order[]): string {
  const currentDate = new Date().toLocaleDateString('de-DE');
  
  // Berechne Statistiken
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = totalOrders - completedOrders;
  
  let totalRevenue = 0;
  orders.forEach(order => {
    const monthlyRevenue = order.monthly_revenue || 0;
    const monthlyCommission = monthlyRevenue * 0.1;
    const yearlyCommission = monthlyCommission * 12;
    const yearlyFee = 180;
    totalRevenue += yearlyCommission + yearlyFee;
  });

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Auftragsbuch - Gastro CMS 3.0</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background: #f8f9fa;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #22c55e;
            }
            .header h1 {
                color: #22c55e;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 30px;
                padding: 20px;
                background: #f0fdf4;
                border-radius: 8px;
            }
            .stat-item {
                text-align: center;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #22c55e;
            }
            .stat-label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .table th,
            .table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #22c55e;
                color: white;
                font-weight: bold;
            }
            .table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-new { background-color: #dbeafe; color: #1e40af; }
            .status-contacted { background-color: #fef3c7; color: #d97706; }
            .status-processing { background-color: #fed7aa; color: #ea580c; }
            .status-completed { background-color: #dcfce7; color: #16a34a; }
            .status-cancelled { background-color: #fecaca; color: #dc2626; }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍕 Gastro CMS 3.0</h1>
                <p>Auftragsbuch - ${currentDate}</p>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${totalOrders}</div>
                    <div class="stat-label">Gesamt Aufträge</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">€${totalRevenue.toLocaleString('de-DE')}</div>
                    <div class="stat-label">Gesamtumsatz</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${completedOrders}</div>
                    <div class="stat-label">Abgeschlossen</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${pendingOrders}</div>
                    <div class="stat-label">Ausstehend</div>
                </div>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Restaurant</th>
                        <th>Inhaber</th>
                        <th>Status</th>
                        <th>Datum</th>
                        <th>Jahresumsatz</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                      const monthlyRevenue = order.monthly_revenue || 0;
                      const monthlyCommission = monthlyRevenue * 0.1;
                      const yearlyCommission = monthlyCommission * 12;
                      const yearlyFee = 180;
                      const totalYearly = yearlyCommission + yearlyFee;
                      
                      return `
                        <tr>
                            <td>${order.restaurant_name}</td>
                            <td>${order.owner_name || 'Nicht angegeben'}</td>
                            <td><span class="status status-${order.status}">${getStatusText(order.status)}</span></td>
                            <td>${new Date(order.created_at).toLocaleDateString('de-DE')}</td>
                            <td>€${totalYearly.toLocaleString('de-DE')}</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Erstellt am ${currentDate} | Gastro CMS 3.0 - Lieferservice NeuGedacht</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'new': 'Neu',
    'contacted': 'Kontaktiert',
    'processing': 'In Bearbeitung',
    'completed': 'Abgeschlossen',
    'cancelled': 'Storniert'
  };
  return statusMap[status] || status;
}
