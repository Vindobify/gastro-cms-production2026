import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { ApiKey, ApiPermission } from './apiKeyManagement';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  description?: string;
}

export function generateApiDocsPDF(rawApiKey: any, rawApiUser: any, domain: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation with data:', { apiKey: rawApiKey?.name || rawApiKey, apiUser: rawApiUser?.name || rawApiUser, domain });
      
      // Defensive handling: coerce strings to objects
      const apiKey = typeof rawApiKey === 'string' ? { key: rawApiKey, name: rawApiKey } : (rawApiKey ?? {});
      const apiUser = typeof rawApiUser === 'string' ? { name: rawApiUser } : (rawApiUser ?? {});

      const toDateString = (value: any) => {
        if (!value) return '—';
        const d = value instanceof Date ? value : new Date(value);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('de-DE');
      };
      
      const doc = new jsPDF();
      let currentY = 20;
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(37, 99, 235); // #2563eb
      doc.text('NextPuls Digital', 20, currentY);
      
      currentY += 10;
      doc.setFontSize(16);
      doc.setTextColor(100, 116, 139); // #64748b
      doc.text('Gastro CMS 3.0 - API Dokumentation', 20, currentY);
      
      currentY += 20;
      
      // API Zugangsdaten Sektion
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59); // #1e293b
      doc.text('API Zugangsdaten', 20, currentY);
      
      currentY += 15;
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81); // #374151
      
      // Benutzerinformationen
      doc.text(`Benutzer: ${String(apiUser.name ?? '—')}`, 20, currentY);
      currentY += 7;
      if (apiUser.email) {
        doc.text(`E-Mail: ${String(apiUser.email)}`, 20, currentY);
        currentY += 7;
      }
      
      if (apiUser.company) {
        doc.text(`Unternehmen: ${String(apiUser.company)}`, 20, currentY);
        currentY += 7;
      }
      
      currentY += 10;
      
      // API Key Informationen
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('API Schlüssel:', 20, currentY);
      
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38); // #dc2626
      doc.text(String(apiKey.key ?? '—'), 20, currentY);
      
      currentY += 10;
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text(`Schlüssel Name: ${String(apiKey.name ?? '—')}`, 20, currentY);
      
      currentY += 7;
      doc.text(`Erstellt am: ${toDateString(apiKey.createdAt)}`, 20, currentY);
      
      if (apiKey.expiresAt) {
        currentY += 7;
        doc.text(`Gültig bis: ${toDateString(apiKey.expiresAt)}`, 20, currentY);
      }

      currentY += 7;
      const rateLimit = apiKey.rateLimit || { requestsPerHour: '—', requestsPerDay: '—' };
      doc.text(`Rate Limits: ${rateLimit.requestsPerHour} Requests/Stunde, ${rateLimit.requestsPerDay} Requests/Tag`, 20, currentY);

      // Neue Seite für API Dokumentation
      doc.addPage();
      currentY = 20;

      // API Dokumentation Sektion
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('API Dokumentation', 20, currentY);
      
      currentY += 20;
      
      // Base URL
      doc.setFontSize(14);
      doc.text('Base URL:', 20, currentY);
      currentY += 7;
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105); // #059669
      doc.text(domain + '/api', 20, currentY);
      
      currentY += 20;
      
      // Authentifizierung
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Authentifizierung:', 20, currentY);
      currentY += 7;
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text('Fügen Sie Ihren API-Schlüssel in einem der folgenden Header hinzu:', 20, currentY);
      
      currentY += 10;
      doc.setTextColor(5, 150, 105);
      doc.text('X-API-Key: ' + String(apiKey.key ?? '—'), 25, currentY);
      currentY += 7;
      doc.text('Authorization: Bearer ' + String(apiKey.key ?? '—'), 25, currentY);
      
      currentY += 20;
      
      // Berechtigungen
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Ihre Berechtigungen:', 20, currentY);
      currentY += 10;
      
      const userPermissions = apiKey.permissions || [];
      if (userPermissions.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(55, 65, 81);
        doc.text('• Keine Berechtigungen definiert', 25, currentY);
        currentY += 7;
      } else {
        userPermissions.forEach((permission: any) => {
          doc.setFontSize(12);
          doc.setTextColor(55, 65, 81);
          const resource = permission.resource || '—';
          const actions = Array.isArray(permission.actions) ? permission.actions.join(', ') : '—';
          doc.text(`• ${resource}: ${actions}`, 25, currentY);
          currentY += 7;
        });
      }
      
      currentY += 10;
      
      // Verfügbare Endpunkte
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Verfügbare API Endpunkte:', 20, currentY);
      currentY += 10;
      
      const endpoints = [
        { method: 'GET', path: '/api/products', description: 'Alle Produkte abrufen', permission: 'products:read' },
        { method: 'POST', path: '/api/products', description: 'Neues Produkt erstellen', permission: 'products:write' },
        { method: 'GET', path: '/api/orders', description: 'Bestellungen abrufen', permission: 'orders:read' },
        { method: 'POST', path: '/api/orders', description: 'Neue Bestellung erstellen', permission: 'orders:write' },
        { method: 'GET', path: '/api/customers', description: 'Kunden abrufen', permission: 'customers:read' },
        { method: 'GET', path: '/api/analytics', description: 'Analytics Daten abrufen', permission: 'analytics:read' }
      ];
      
      endpoints.forEach((endpoint) => {
        const hasPermission = userPermissions.some((p: any) => 
          p.resource === endpoint.permission.split(':')[0] && 
          Array.isArray(p.actions) && p.actions.includes(endpoint.permission.split(':')[1])
        );
        
        if (hasPermission) {
          doc.setFontSize(12);
          doc.setTextColor(5, 150, 105);
          doc.text(endpoint.method, 20, currentY);
          doc.setTextColor(55, 65, 81);
          doc.text(endpoint.path, 40, currentY);
          doc.text(endpoint.description, 80, currentY);
          currentY += 7;
        }
      });
      
      // Neue Seite für Beispiele
      doc.addPage();
      currentY = 20;
      
      // Beispiel Requests
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('Beispiel API Calls', 20, currentY);
      currentY += 20;
      
      // cURL Beispiel
      doc.setFontSize(14);
      doc.text('cURL Beispiel:', 20, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const curlLines = [
        `curl -X GET "${domain}/api/products" \\`,
        `  -H "X-API-Key: ${String(apiKey.key ?? '—')}" \\`,
        `  -H "Content-Type: application/json"`
      ];
      
      curlLines.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      
      currentY += 15;
      
      // JavaScript Beispiel
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('JavaScript Beispiel:', 20, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const jsLines = [
        `fetch('${domain}/api/products', {`,
        `  method: 'GET',`,
        `  headers: {`,
        `    'X-API-Key': '${String(apiKey.key ?? '—')}',`,
        `    'Content-Type': 'application/json'`,
        `  }`,
        `})`,
        `.then(response => response.json())`,
        `.then(data => console.log(data));`
      ];
      
      jsLines.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      
      // Footer mit Impressum
      doc.addPage();
      currentY = 20;
      
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('Impressum', 20, currentY);
      
      currentY += 20;
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      
      const impressumLines = [
        'NextPuls Digital',
        'Gastro CMS 3.0',
        '',
        'Geschäftsführer:',
        'Mario Gaupmann',
        'Markt 141, 2572 Kaumberg',
        '',
        'Telefon: +43 660 546 78 06',
        'E-Mail: office@nextpuls.com'
      ];
      
      impressumLines.forEach(line => {
        if (line) {
          doc.text(line, 20, currentY);
        }
        currentY += 7;
      });
      
      currentY += 10;
      
      // Support Information
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Support & Kontakt:', 20, currentY);
      currentY += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text('Bei Fragen zur API-Nutzung wenden Sie sich bitte an:', 20, currentY);
      currentY += 7;
      doc.text('E-Mail: office@nextpuls.com', 20, currentY);
      currentY += 7;
      doc.text('Telefon: +43 660 546 78 06', 20, currentY);
      
      // Datum der Erstellung
      currentY = 280;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dokumentation erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, currentY);
      
      console.log('PDF generation completed successfully');
      
      // Convert to Buffer
      const pdfOutput = doc.output('arraybuffer');
      const buffer = Buffer.from(pdfOutput);
      resolve(buffer);
      
    } catch (error) {
      console.error('Error in PDF generation:', error);
      reject(error);
    }
  });
}

export async function saveApiDocumentationPDF(
  apiKey: ApiKey,
  apiUser: ApiUser,
  domain?: string
): Promise<string> {
  const pdfBuffer = await generateApiDocsPDF(apiKey, apiUser, domain || 'https://gastro-cms.at');
  
  // PDF im uploads Verzeichnis speichern
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const fileName = `api-docs-${apiUser.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  
  fs.writeFileSync(filePath, pdfBuffer);
  
  return `/uploads/${fileName}`;
}
