interface RestaurantSettings {
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  deliveryTime?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  orderItems: Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      name: string;
      description: string;
    };
  }>;
}

interface DeliveryDriver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Restaurant E-Mail: Neue Bestellung
export function generateNewOrderEmailForRestaurant(order: Order, restaurantSettings: RestaurantSettings) {
  const subject = `Neue Bestellung #${order.orderNumber} - ${restaurantSettings.restaurantName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍕 Neue Bestellung eingegangen!</h1>
        </div>
        <div class="content">
          <h2>Bestellung #${order.orderNumber}</h2>
          <p><strong>Kunde:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
          <p><strong>E-Mail:</strong> ${order.customer.email}</p>
          <p><strong>Telefon:</strong> ${order.customer.phone}</p>
          <p><strong>Adresse:</strong> ${order.customer.address}</p>
          
          <div class="order-items">
            <h3>Bestellte Artikel:</h3>
            ${order.orderItems.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <strong>${item.product.name}</strong><br>
                ${item.product.description}<br>
                Menge: ${item.quantity} × €${item.unitPrice.toFixed(2)} = <strong>€${item.totalPrice.toFixed(2)}</strong>
              </div>
            `).join('')}
          </div>
          
          <p class="total">Gesamtbetrag: €${order.totalAmount.toFixed(2)}</p>
          ${order.deliveryTime ? `<p><strong>Gewünschte Lieferzeit:</strong> ${order.deliveryTime}</p>` : ''}
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Kunden E-Mail: Registrierung / Double Opt-in
export function generateRegistrationEmail(customerName: string, verificationToken: string, restaurantSettings: RestaurantSettings, baseUrl?: string) {
  const subject = `Willkommen bei ${restaurantSettings.restaurantName} - E-Mail bestätigen`;
  const verificationUrl = `${baseUrl || process.env.APP_URL || 'https://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Willkommen bei ${restaurantSettings.restaurantName}!</h1>
        </div>
        <div class="content">
          <p>Hallo ${customerName},</p>
          <p>vielen Dank für Ihre Registrierung bei ${restaurantSettings.restaurantName}!</p>
          <p>Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">E-Mail bestätigen</a>
          </p>
          <p>Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>Nach der Bestätigung können Sie sofort bestellen!</p>
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Kunden E-Mail: Bestellbestätigung mit Rechnung
export function generateOrderConfirmationEmail(order: Order, restaurantSettings: RestaurantSettings) {
  const subject = `Bestellbestätigung #${order.orderNumber} - ${restaurantSettings.restaurantName}`;
  const taxRate = 0.20; // 20% MwSt
  const netAmount = order.totalAmount / (1 + taxRate);
  const taxAmount = order.totalAmount - netAmount;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .invoice { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; }
        .order-items { margin: 15px 0; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
        .totals { border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 15px; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .final-total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Bestellung bestätigt!</h1>
        </div>
        <div class="content">
          <p>Liebe/r ${order.customer.firstName} ${order.customer.lastName},</p>
          <p>vielen Dank für Ihre Bestellung! Hier ist Ihre Rechnung:</p>
          
          <div class="invoice">
            <h3>Rechnung #${order.orderNumber}</h3>
            <p><strong>Rechnungsadresse:</strong><br>
            ${order.customer.firstName} ${order.customer.lastName}<br>
            ${order.customer.address}</p>
            
            <div class="order-items">
              <h4>Bestellte Artikel:</h4>
              ${order.orderItems.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.product.name}</strong><br>
                    <small>${item.product.description}</small><br>
                    ${item.quantity} × €${item.unitPrice.toFixed(2)}
                  </div>
                  <div><strong>€${item.totalPrice.toFixed(2)}</strong></div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Nettobetrag:</span>
                <span>€${netAmount.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>MwSt. (20%):</span>
                <span>€${taxAmount.toFixed(2)}</span>
              </div>
              <div class="total-row final-total">
                <span>Gesamtbetrag:</span>
                <span>€${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          ${order.deliveryTime ? `<p><strong>Voraussichtliche Lieferzeit:</strong> ${order.deliveryTime}</p>` : ''}
          <p>Sie erhalten weitere Updates zum Status Ihrer Bestellung.</p>
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone} | E-Mail: ${restaurantSettings.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Kunden E-Mail: Status-Updates
export function generateOrderStatusEmail(order: Order, newStatus: string, restaurantSettings: RestaurantSettings) {
  const statusMessages = {
    'PENDING': { title: '🕰️ Bestellung eingegangen', message: 'Ihre Bestellung wurde erfolgreich aufgegeben und wird bearbeitet.' },
    'CONFIRMED': { title: '✅ Bestellung bestätigt', message: 'Ihre Bestellung wurde bestätigt und wird nun zubereitet.' },
    'PREPARING': { title: '🍳 Zubereitung läuft', message: 'Ihr Essen wird gerade frisch zubereitet.' },
    'READY': { title: '🍽️ Bereit zur Abholung', message: 'Ihr Essen ist fertig und bereit für die Lieferung.' },
    'OUT_FOR_DELIVERY': { title: '🚚 Unterwegs zu Ihnen', message: 'Ihr Essen ist unterwegs! Der Lieferant ist auf dem Weg zu Ihnen.' },
    'DELIVERED': { title: '🎉 Erfolgreich geliefert', message: 'Ihre Bestellung wurde erfolgreich geliefert. Guten Appetit!' },
    'CANCELLED': { title: '❌ Bestellung storniert', message: 'Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie uns gerne.' }
  };
  
  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.PENDING;
  const subject = `${statusInfo.title} - Bestellung #${order.orderNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 5px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.title}</h1>
        </div>
        <div class="content">
          <p>Liebe/r ${order.customer.firstName} ${order.customer.lastName},</p>
          
          <div class="status-box">
            <h3>Status-Update für Bestellung #${order.orderNumber}</h3>
            <p><strong>${statusInfo.message}</strong></p>
            ${order.deliveryTime ? `<p><strong>Voraussichtliche Lieferzeit:</strong> ${order.deliveryTime}</p>` : ''}
          </div>
          
          <p>Gesamtbetrag: <strong>€${order.totalAmount.toFixed(2)}</strong></p>
          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone} | E-Mail: ${restaurantSettings.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Lieferanten E-Mail: Bestellzuweisung
export function generateDeliveryAssignmentEmail(order: Order, driver: DeliveryDriver, restaurantSettings: RestaurantSettings) {
  const subject = `Neue Lieferung zugewiesen - Bestellung #${order.orderNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .delivery-info { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; }
        .customer-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .order-items { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Neue Lieferung zugewiesen!</h1>
        </div>
        <div class="content">
          <p>Hallo ${driver.firstName},</p>
          <p>Ihnen wurde eine neue Lieferung zugewiesen:</p>
          
          <div class="delivery-info">
            <h3>Bestellung #${order.orderNumber}</h3>
            <p><strong>Gesamtbetrag:</strong> €${order.totalAmount.toFixed(2)}</p>
            ${order.deliveryTime ? `<p><strong>Gewünschte Lieferzeit:</strong> ${order.deliveryTime}</p>` : ''}
          </div>
          
          <div class="customer-info">
            <h4>📍 Lieferadresse:</h4>
            <p><strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>
            ${order.customer.address}<br>
            Tel: ${order.customer.phone}</p>
          </div>
          
          <div class="order-items">
            <h4>🍽️ Bestellte Artikel:</h4>
            ${order.orderItems.map(item => `
              <p>• ${item.quantity}x ${item.product.name}</p>
            `).join('')}
          </div>
          
          <p><strong>Bitte melden Sie sich im Restaurant zur Abholung!</strong></p>
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Lieferanten E-Mail: Zugangsdaten
export function generateDriverCredentialsEmail(driver: DeliveryDriver, loginCredentials: { email: string; password: string }, restaurantSettings: RestaurantSettings, baseUrl?: string) {
  const subject = `Ihre Zugangsdaten für ${restaurantSettings.restaurantName}`;
  const loginUrl = `${baseUrl || process.env.APP_URL || 'https://localhost:3000'}/login`;
  const dashboardUrl = `${baseUrl || process.env.APP_URL || 'https://localhost:3000'}/delivery-driver`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border: 2px solid #059669; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Willkommen im Team!</h1>
        </div>
        <div class="content">
          <p>Hallo ${driver.firstName} ${driver.lastName},</p>
          <p>willkommen als Lieferant bei ${restaurantSettings.restaurantName}!</p>
          <p>Hier sind Ihre Zugangsdaten für das Lieferanten-Dashboard:</p>
          
          <div class="credentials">
            <h3>💱 Ihre Zugangsdaten:</h3>
            <p><strong>E-Mail:</strong> ${loginCredentials.email}</p>
            <p><strong>Passwort:</strong> ${loginCredentials.password}</p>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Wichtig:</strong> Ändern Sie Ihr Passwort nach dem ersten Login!</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Jetzt anmelden</a>
            <a href="${dashboardUrl}" class="button">Zum Dashboard</a>
          </p>
          
          <h4>📱 Wichtige Links:</h4>
          <p>• <strong>Login:</strong> ${loginUrl}</p>
          <p>• <strong>Dashboard:</strong> ${dashboardUrl}</p>
          
          <h4>📝 Was Sie im Dashboard können:</h4>
          <p>• Zugewiesene Lieferungen einsehen</p>
          <p>• Status von Bestellungen aktualisieren</p>
          <p>• Ihr Profil verwalten</p>
          <p>• Arbeitszeiten einstellen</p>
          
          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
        </div>
        <div class="footer">
          <p>${restaurantSettings.restaurantName}<br>
          ${restaurantSettings.address}, ${restaurantSettings.postalCode} ${restaurantSettings.city}<br>
          Tel: ${restaurantSettings.phone} | E-Mail: ${restaurantSettings.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
