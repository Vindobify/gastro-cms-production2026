import nodemailer from 'nodemailer';

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || process.env.BREVO_USER || '96fdd4001@smtp-brevo.com',
    pass: process.env.SMTP_PASS || process.env.BREVO_PASSWORD || 'zLCrHG9R6Qx4NjEq'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Empfänger-E-Mail
const RECIPIENT_EMAIL = 'office@gastro-cms.at';

// E-Mail-Transporter erstellen
let transporter: nodemailer.Transporter;

try {
  console.log('📧 E-Mail-Konfiguration:');
  console.log('Host:', EMAIL_CONFIG.host);
  console.log('Port:', EMAIL_CONFIG.port);
  console.log('User:', EMAIL_CONFIG.auth.user);
  console.log('Pass:', EMAIL_CONFIG.auth.pass ? '***' : 'nicht gesetzt');
  
  transporter = nodemailer.createTransport(EMAIL_CONFIG);
  console.log('✅ E-Mail-Transporter erfolgreich erstellt');
} catch (error) {
  console.error('❌ Error creating email transporter:', error);
  // Fallback für Entwicklung
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test'
    }
  });
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface OrderFormData {
  business_type?: string;
  restaurant_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  has_delivery_service: boolean;
  delivery_service_name?: string;
  monthly_revenue?: number;
  notes?: string;
}

export interface LeadFormData {
  restaurant_name: string;
  contactEmail: string;
  phone?: string;
  monthlyRevenue: number;
  currentCommission?: number;
  message?: string;
}

export interface TerminFormData {
  business_type?: string;
  restaurant_name: string;
  vorname: string;
  nachname: string;
  adresse?: string;
  postleitzahl?: string;
  ort?: string;
  telefon: string;
  email: string;
  terminart: 'online' | 'lokal';
  datum: string;
  uhrzeit: string;
  agb: boolean;
  datenschutz: boolean;
}

// Kontaktformular E-Mail senden
export async function sendContactEmail(data: ContactFormData): Promise<boolean> {
  try {
    // Für Entwicklung: E-Mail-Daten in Konsole ausgeben
    console.log('📧 NEUE KONTAKTANFRAGE:');
    console.log('========================');
    console.log(`Name: ${data.name}`);
    console.log(`E-Mail: ${data.email}`);
    console.log(`Telefon: ${data.phone || 'Nicht angegeben'}`);
    console.log(`Nachricht: ${data.message}`);
    console.log(`Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
    console.log('========================');
    console.log(`Diese E-Mail würde an ${RECIPIENT_EMAIL} gesendet werden.`);
    console.log('');

    // E-Mail senden (nur wenn Credentials konfiguriert sind)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"Gastro CMS Website" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
        to: RECIPIENT_EMAIL,
        subject: `Neue Kontaktanfrage von ${data.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📞 Neue Kontaktanfrage</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Kontaktdaten:</h3>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Nachricht:</h3>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>Diese E-Mail wurde über das Kontaktformular auf gastro-cms.at gesendet.</p>
              <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ E-Mail erfolgreich gesendet!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);

      // Bestätigungsmail an den Kunden senden
      await sendContactConfirmationEmail(data);
    } else {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. E-Mail wird nur in der Konsole angezeigt.');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'gesetzt' : 'nicht gesetzt');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'gesetzt' : 'nicht gesetzt');
    }

    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}

// Bestellformular E-Mail senden
export async function sendOrderEmail(data: OrderFormData): Promise<boolean> {
  try {
    // Für Entwicklung: E-Mail-Daten in Konsole ausgeben
    console.log('🍕 NEUE BESTELLANFRAGE:');
    console.log('========================');
    console.log(`Restaurant: ${data.restaurant_name}`);
    console.log(`Inhaber: ${data.owner_name}`);
    console.log(`E-Mail: ${data.email}`);
    console.log(`Telefon: ${data.phone || 'Nicht angegeben'}`);
    console.log(`Adresse: ${data.address || 'Nicht angegeben'}`);
    console.log(`PLZ/Ort: ${data.postal_code || ''} ${data.city || ''}`);
    console.log(`Hat Lieferservice: ${data.has_delivery_service ? 'Ja' : 'Nein'}`);
    if (data.delivery_service_name) console.log(`Lieferservice-Name: ${data.delivery_service_name}`);
    if (data.monthly_revenue) console.log(`Monatlicher Umsatz: €${data.monthly_revenue.toLocaleString('de-DE')}`);
    if (data.notes) console.log(`Notizen: ${data.notes}`);
    console.log(`Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
    console.log('========================');
    console.log(`Diese E-Mail würde an ${RECIPIENT_EMAIL} gesendet werden.`);
    console.log('');

    // E-Mail senden (nur wenn Credentials konfiguriert sind)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"Gastro CMS Website" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
        to: RECIPIENT_EMAIL,
        subject: `Neue Bestellanfrage von ${data.restaurant_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🍕 Neue Bestellanfrage</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Geschäftsinformationen:</h3>
              ${data.business_type ? `<p><strong>Geschäftstyp:</strong> ${data.business_type}</p>` : ''}
              <p><strong>Geschäftsname:</strong> ${data.restaurant_name}</p>
              <p><strong>Inhaber:</strong> ${data.owner_name}</p>
              <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Adresse:</h3>
              <p>${data.address || 'Nicht angegeben'}</p>
              <p>${data.postal_code || ''} ${data.city || ''}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Lieferservice-Informationen:</h3>
              <p><strong>Hat Lieferservice:</strong> ${data.has_delivery_service ? 'Ja' : 'Nein'}</p>
              ${data.delivery_service_name ? `<p><strong>Lieferservice-Name:</strong> ${data.delivery_service_name}</p>` : ''}
              ${data.monthly_revenue ? `<p><strong>Monatlicher Umsatz:</strong> €${data.monthly_revenue.toLocaleString('de-DE')}</p>` : ''}
            </div>
            
            ${data.notes ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Notizen:</h3>
              <p style="white-space: pre-wrap;">${data.notes}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>Diese E-Mail wurde über das Bestellformular auf gastro-cms.at gesendet.</p>
              <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ E-Mail erfolgreich gesendet!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);

      // Bestätigungsmail an den Kunden senden
      await sendOrderConfirmationEmail(data);
    } else {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. E-Mail wird nur in der Konsole angezeigt.');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'gesetzt' : 'nicht gesetzt');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'gesetzt' : 'nicht gesetzt');
    }

    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
}

// Lead-Formular E-Mail senden
export async function sendLeadEmail(data: LeadFormData): Promise<boolean> {
  try {
    // Berechnungen für E-Mail
    const currentCommission = data.currentCommission || 15;
    const gastroCommission = 8;
    const currentCost = data.monthlyRevenue * (currentCommission / 100);
    const gastroCost = data.monthlyRevenue * (gastroCommission / 100);
    const savings = currentCost - gastroCost;
    const savingsPercentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
    const yearlySavings = savings * 12;

    // Für Entwicklung: E-Mail-Daten in Konsole ausgeben
    console.log('💼 NEUER LEAD:');
    console.log('========================');
    console.log(`Restaurant: ${data.restaurant_name}`);
    console.log(`E-Mail: ${data.contactEmail}`);
    console.log(`Telefon: ${data.phone || 'Nicht angegeben'}`);
    console.log(`Monatlicher Umsatz: €${data.monthlyRevenue.toLocaleString('de-DE')}`);
    console.log(`Aktuelle Kommission: ${currentCommission}%`);
    console.log(`Aktuelle Kosten: €${currentCost.toLocaleString('de-DE')}`);
    console.log(`Gastro CMS Kosten: €${gastroCost.toLocaleString('de-DE')}`);
    console.log(`Ersparnis: €${savings.toLocaleString('de-DE')} (${savingsPercentage.toFixed(1)}%)`);
    console.log(`Jährliche Ersparnis: €${yearlySavings.toLocaleString('de-DE')}`);
    if (data.message) console.log(`Nachricht: ${data.message}`);
    console.log(`Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
    console.log('========================');
    console.log(`Diese E-Mail würde an ${RECIPIENT_EMAIL} gesendet werden.`);
    console.log('');

    // E-Mail senden (nur wenn Credentials konfiguriert sind)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"Gastro CMS Website" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
        to: RECIPIENT_EMAIL,
        subject: `Neuer Lead von ${data.restaurant_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">💼 Neuer Lead</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Restaurant-Informationen:</h3>
              <p><strong>Restaurant-Name:</strong> ${data.restaurant_name}</p>
              <p><strong>E-Mail:</strong> <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
              ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Umsatz-Informationen:</h3>
              <p><strong>Monatlicher Lieferservice-Umsatz:</strong> €${data.monthlyRevenue.toLocaleString('de-DE')}</p>
              <p><strong>Aktuelle Kommission:</strong> ${currentCommission}%</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Ersparnis-Berechnung:</h3>
              <p><strong>Aktuelle Kosten:</strong> €${currentCost.toLocaleString('de-DE')}</p>
              <p><strong>Gastro CMS Kosten:</strong> €${gastroCost.toLocaleString('de-DE')}</p>
              <p><strong>Monatliche Ersparnis:</strong> €${savings.toLocaleString('de-DE')} (${savingsPercentage.toFixed(1)}%)</p>
              <p><strong>Jährliche Ersparnis:</strong> €${yearlySavings.toLocaleString('de-DE')}</p>
            </div>
            
            ${data.message ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Nachricht:</h3>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>Diese E-Mail wurde über das Lead-Formular auf gastro-cms.at gesendet.</p>
              <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ E-Mail erfolgreich gesendet!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);

      // Bestätigungsmail mit Berechnung an den Kunden senden
      const calculation = {
        currentCost,
        gastroCost,
        savings,
        savingsPercentage,
        yearlySavings
      };
      await sendLeadConfirmationEmail(data, calculation);
    } else {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. E-Mail wird nur in der Konsole angezeigt.');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'gesetzt' : 'nicht gesetzt');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'gesetzt' : 'nicht gesetzt');
    }

    return true;
  } catch (error) {
    console.error('Error sending lead email:', error);
    return false;
  }
}

// Bestätigungsmail für Kontaktformular
export async function sendContactConfirmationEmail(data: ContactFormData): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. Bestätigungsmail wird nicht gesendet.');
      return false;
    }

    const mailOptions = {
      from: `"Gastro CMS 3.0" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
      to: data.email,
      subject: 'Vielen Dank für Ihre Nachricht - Gastro CMS 3.0',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🍽️ Gastro CMS 3.0</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ihr digitaler Lieferservice-Partner</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hallo ${data.name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              vielen Dank für Ihre Nachricht! Wir haben Ihre Anfrage erhalten und werden uns 
              <strong>innerhalb von 24 Stunden</strong> bei Ihnen melden.
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Ihre Nachricht:</h3>
              <p style="white-space: pre-wrap; margin: 0; color: #374151;">${data.message}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">🚀 Was Sie erwartet:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li><strong>Nur 10% Provision</strong> statt 30% bei anderen Anbietern</li>
                <li><strong>Eigene Domain und Apps</strong> für maximale Kontrolle</li>
                <li><strong>Österreichischer Support</strong> - wir sprechen Ihre Sprache</li>
                <li><strong>Keine Mindestvertragslaufzeit</strong> - flexibel und fair</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://gastro-cms.at" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🌐 Website besuchen
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p><strong>Kontakt:</strong></p>
              <p>📧 office@gastro-cms.at</p>
              <p>📱 +43 660 546 78 06</p>
              <p>📍 NextPuls Digital, Markt 141, 2572 Kaumberg, Österreich</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Bestätigungsmail an Kunden gesendet!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

// Bestätigungsmail für Lead-Formular mit Berechnung
export async function sendLeadConfirmationEmail(data: LeadFormData, calculation: any): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. Bestätigungsmail wird nicht gesendet.');
      return false;
    }

    const mailOptions = {
      from: `"Gastro CMS 3.0" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
      to: data.contactEmail,
      subject: `Ihre persönliche Ersparnis-Berechnung - ${data.restaurant_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">💰 Ihre Ersparnis-Berechnung</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Gastro CMS 3.0 für ${data.restaurant_name}</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hallo!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Hier ist Ihre persönliche Ersparnis-Berechnung für <strong>${data.restaurant_name}</strong>:
            </p>
            
            <!-- Aktuelle Kosten -->
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">💸 Ihre aktuellen Kosten</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Monatliche Provision (${data.currentCommission}%):</span>
                <strong style="color: #dc2626;">€${calculation.currentCost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 18px; font-weight: bold; color: #dc2626; border-top: 1px solid #fecaca; padding-top: 10px;">
                <span>Jährlich:</span>
                <span>€${(calculation.currentCost * 12).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <!-- Gastro CMS Kosten -->
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #16a34a;">✅ Mit Gastro CMS 3.0</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Monatliche Kosten (10%):</span>
                <strong style="color: #16a34a;">€${calculation.gastroCost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 18px; font-weight: bold; color: #16a34a; border-top: 1px solid #bbf7d0; padding-top: 10px;">
                <span>Jährlich:</span>
                <span>€${(calculation.gastroCost * 12).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <!-- Ersparnis -->
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin-top: 0; font-size: 24px;">🎉 Ihre Ersparnis</h3>
              <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
                €${calculation.savings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div style="font-size: 18px; margin-bottom: 15px;">pro Monat</div>
              <div style="font-size: 28px; font-weight: bold; margin: 15px 0;">
                €${calculation.yearlySavings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div style="font-size: 16px; margin-bottom: 20px;">pro Jahr</div>
              <div style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 20px; display: inline-block; font-size: 18px; font-weight: bold;">
                ${calculation.savingsPercentage.toFixed(1)}% weniger Kosten
              </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">🚀 Was Sie mit Gastro CMS 3.0 erhalten:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li><strong>Nur 10% Provision</strong> statt ${data.currentCommission}%</li>
                <li><strong>Eigene Domain und Apps</strong> - vollständige Kontrolle</li>
                <li><strong>Österreichischer Support</strong> - wir sprechen Ihre Sprache</li>
                <li><strong>Keine Mindestvertragslaufzeit</strong> - flexibel und fair</li>
                <li><strong>Professionelles Dashboard</strong> für alle Ihre Bestellungen</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://gastro-cms.at" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                📞 Termin vereinbaren
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p><strong>Kontakt:</strong></p>
              <p>📧 office@gastro-cms.at</p>
              <p>📱 +43 660 546 78 06</p>
              <p>📍 NextPuls Digital, Markt 141, 2572 Kaumberg, Österreich</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Bestätigungsmail mit Berechnung an Kunden gesendet!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending lead confirmation email:', error);
    return false;
  }
}

// Bestätigungsmail für Bestellformular
export async function sendOrderConfirmationEmail(data: OrderFormData): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  E-Mail-Credentials nicht konfiguriert. Bestätigungsmail wird nicht gesendet.');
      return false;
    }

    const mailOptions = {
      from: `"Gastro CMS 3.0" <${process.env.SMTP_FROM || 'office@gastro-cms.at'}>`,
      to: data.email,
      subject: `Bestellanfrage erhalten - ${data.restaurant_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🍕 Gastro CMS 3.0</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ihre Bestellanfrage wurde erhalten</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hallo ${data.owner_name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              vielen Dank für Ihr Interesse an <strong>Gastro CMS 3.0</strong> für Ihr Geschäft 
              <strong>${data.restaurant_name}</strong>! Wir haben Ihre Bestellanfrage erhalten und werden uns 
              <strong>innerhalb von 24 Stunden</strong> bei Ihnen melden.
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Ihre Bestellanfrage:</h3>
              ${data.business_type ? `<p><strong>Geschäftstyp:</strong> ${data.business_type}</p>` : ''}
              <p><strong>Geschäftsname:</strong> ${data.restaurant_name}</p>
              <p><strong>Inhaber:</strong> ${data.owner_name}</p>
              <p><strong>E-Mail:</strong> ${data.email}</p>
              ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
              ${data.address ? `<p><strong>Adresse:</strong> ${data.address}</p>` : ''}
              ${data.postal_code || data.city ? `<p><strong>PLZ/Ort:</strong> ${data.postal_code || ''} ${data.city || ''}</p>` : ''}
              <p><strong>Lieferservice vorhanden:</strong> ${data.has_delivery_service ? 'Ja' : 'Nein'}</p>
              ${data.delivery_service_name ? `<p><strong>Aktueller Lieferservice:</strong> ${data.delivery_service_name}</p>` : ''}
              ${data.monthly_revenue ? `<p><strong>Monatlicher Umsatz:</strong> €${data.monthly_revenue.toLocaleString('de-DE')}</p>` : ''}
              ${data.notes ? `<p><strong>Notizen:</strong> ${data.notes}</p>` : ''}
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">🚀 Was Sie mit Gastro CMS 3.0 erhalten:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li><strong>Nur 10% Provision</strong> statt 30% bei anderen Anbietern</li>
                <li><strong>Eigene Domain und Apps</strong> - vollständige Kontrolle über Ihr Business</li>
                <li><strong>Professionelles Dashboard</strong> für alle Ihre Bestellungen</li>
                <li><strong>Österreichischer Support</strong> - wir sprechen Ihre Sprache</li>
                <li><strong>Keine Mindestvertragslaufzeit</strong> - flexibel und fair</li>
              </ul>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #16a34a;">⏰ Nächste Schritte:</h3>
              <ol style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Wir analysieren Ihre Anforderungen</li>
                <li>Erstellen ein individuelles Angebot</li>
                <li>Melden uns innerhalb von 24 Stunden</li>
                <li>Vereinbaren einen Beratungstermin</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://gastro-cms.at" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                🌐 Website besuchen
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p><strong>Kontakt:</strong></p>
              <p>📧 office@gastro-cms.at</p>
              <p>📱 +43 660 546 78 06</p>
              <p>📍 NextPuls Digital, Markt 141, 2572 Kaumberg, Österreich</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Bestätigungsmail für Bestellanfrage an Kunden gesendet!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

// Terminanfrage E-Mail senden
export async function sendTerminEmail(data: TerminFormData): Promise<boolean> {
  try {
    console.log('📧 NEUE TERMINANFRAGE:');
    console.log('======================');
    console.log(`Restaurant: ${data.restaurant_name}`);
    console.log(`Name: ${data.vorname} ${data.nachname}`);
    console.log(`E-Mail: ${data.email}`);
    console.log(`Telefon: ${data.telefon}`);
    console.log(`Terminart: ${data.terminart}`);
    console.log(`Datum: ${data.datum}`);
    console.log(`Uhrzeit: ${data.uhrzeit}`);
    if (data.terminart === 'lokal') {
      console.log(`Adresse: ${data.adresse}, ${data.postleitzahl} ${data.ort}`);
    }
    console.log(`Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
    console.log('======================');

    const mailOptions = {
      from: process.env.SMTP_FROM || 'office@gastro-cms.at',
      to: RECIPIENT_EMAIL,
      subject: `Neue Terminanfrage von ${data.restaurant_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Neue Terminanfrage</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Geschäftsinformationen</h3>
            ${data.business_type ? `<p><strong>Geschäftstyp:</strong> ${data.business_type}</p>` : ''}
            <p><strong>Geschäftsname:</strong> ${data.restaurant_name}</p>
            <p><strong>Kontaktperson:</strong> ${data.vorname} ${data.nachname}</p>
            <p><strong>E-Mail:</strong> ${data.email}</p>
            <p><strong>Telefon:</strong> ${data.telefon}</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Termin-Details</h3>
            <p><strong>Terminart:</strong> ${data.terminart === 'online' ? 'Online (Video-Call)' : 'Persönlich im Lokal'}</p>
            <p><strong>Datum:</strong> ${new Date(data.datum).toLocaleDateString('de-DE')}</p>
            <p><strong>Uhrzeit:</strong> ${data.uhrzeit}</p>
            ${data.terminart === 'lokal' ? `
              <p><strong>Adresse:</strong> ${data.adresse}</p>
              <p><strong>PLZ/Ort:</strong> ${data.postleitzahl} ${data.ort}</p>
            ` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Wichtiger Hinweis:</strong> Der Termin muss von Ihnen erst geprüft werden. Bitte melden Sie sich telefonisch oder per E-Mail beim Kunden, um den Termin zu bestätigen.</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Diese Anfrage wurde am ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} über das Gastro CMS Kontaktformular gesendet.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Terminanfrage-E-Mail erfolgreich gesendet:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Fehler beim Senden der Terminanfrage-E-Mail:', error);
    return false;
  }
}

// Termin-Bestätigungsmail an Kunden senden
export async function sendTerminConfirmationEmail(data: TerminFormData): Promise<boolean> {
  try {
    console.log('📧 TERMIN-BESTÄTIGUNG an Kunden:');
    console.log(`An: ${data.email}`);
    console.log(`Restaurant: ${data.restaurant_name}`);
    console.log(`Termin: ${data.datum} um ${data.uhrzeit}`);

    const mailOptions = {
      from: process.env.SMTP_FROM || 'office@gastro-cms.at',
      to: data.email,
      subject: `Terminanfrage erhalten - Gastro CMS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Terminanfrage erhalten</h2>
          
          <p>Hallo ${data.vorname},</p>
          
          <p>vielen Dank für Ihre Terminanfrage! Wir haben Ihre Anfrage für eine <strong>${data.terminart === 'online' ? 'Online-Beratung' : 'persönliche Beratung'}</strong> erhalten.</p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Ihre Terminanfrage im Überblick</h3>
            <p><strong>Restaurant:</strong> ${data.restaurant_name}</p>
            <p><strong>Gewünschter Termin:</strong> ${new Date(data.datum).toLocaleDateString('de-DE')} um ${data.uhrzeit}</p>
            <p><strong>Terminart:</strong> ${data.terminart === 'online' ? 'Online (Video-Call)' : 'Persönlich im Lokal'}</p>
            ${data.terminart === 'lokal' ? `
              <p><strong>Adresse:</strong> ${data.adresse}, ${data.postleitzahl} ${data.ort}</p>
            ` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>📋 Nächste Schritte:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
              <li>Wir prüfen Ihre Terminanfrage</li>
              <li>Wir melden uns telefonisch oder per E-Mail bei Ihnen</li>
              <li>Wir bestätigen den finalen Termin</li>
            </ul>
          </div>

          <p>Bei Fragen können Sie uns jederzeit unter <strong>+43 660 546 78 06</strong> oder <strong>office@gastro-cms.at</strong> erreichen.</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Gastro CMS Team</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Termin-Bestätigungsmail erfolgreich gesendet:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Fehler beim Senden der Termin-Bestätigungsmail:', error);
    return false;
  }
}

// Datenauskunft E-Mail senden
export async function sendDataRequestEmail(data: any): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'office@gastro-cms.at',
      to: RECIPIENT_EMAIL,
      subject: `DSGVO-Anfrage: ${data.anfrageart} - ${data.vorname} ${data.nachname}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">DSGVO-Datenauskunft Anfrage</h2>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Anfrage-Details</h3>
            <p><strong>Art der Anfrage:</strong> ${data.anfrageart}</p>
            <p><strong>Name:</strong> ${data.vorname} ${data.nachname}</p>
            <p><strong>E-Mail:</strong> ${data.email}</p>
            ${data.telefon ? `<p><strong>Telefon:</strong> ${data.telefon}</p>` : ''}
            ${data.restaurant ? `<p><strong>Restaurant:</strong> ${data.restaurant}</p>` : ''}
            ${data.nachricht ? `<p><strong>Zusätzliche Informationen:</strong><br>${data.nachricht}</p>` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Wichtige Hinweise:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
              <li>Diese Anfrage muss innerhalb von 30 Tagen bearbeitet werden</li>
              <li>Zur Identifikation kann ein Ausweisdokument erforderlich sein</li>
              <li>Bei Datenlöschung: Prüfen Sie, ob Aufbewahrungspflichten bestehen</li>
            </ul>
          </div>

          <p><strong>Nächste Schritte:</strong></p>
          <ol>
            <li>Identität des Antragstellers prüfen</li>
            <li>Datenbank nach personenbezogenen Daten durchsuchen</li>
            <li>Antwort innerhalb von 30 Tagen versenden</li>
          </ol>

          <p>Diese Anfrage wurde am ${new Date().toLocaleString('de-DE')} über das Kontaktformular eingereicht.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ DSGVO-Anfrage E-Mail erfolgreich gesendet:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Fehler beim Senden der DSGVO-Anfrage E-Mail:', error);
    return false;
  }
}

// E-Mail-Konfiguration testen
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}
