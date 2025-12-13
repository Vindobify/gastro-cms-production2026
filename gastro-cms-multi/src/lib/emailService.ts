import nodemailer from 'nodemailer';
import { prisma } from '@/lib/database';
import {
  generateNewOrderEmailForRestaurant,
  generateRegistrationEmail,
  generateOrderConfirmationEmail,
  generateOrderStatusEmail,
  generateDeliveryAssignmentEmail,
  generateDriverCredentialsEmail
} from './emailTemplates';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// E-Mail-Konfiguration aus Umgebungsvariablen laden
function getEmailConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true für 465, false für andere Ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER || ''
  };
}

// Basis E-Mail-Versand-Funktion
export async function sendEmail(to: string, subject: string, html: string) {
  const config = getEmailConfig();
  
  console.log('📧 E-Mail wird gesendet an:', to);
  console.log('📋 Betreff:', subject);
  
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true für 465, false für andere Ports
    auth: config.auth,
    tls: {
      rejectUnauthorized: false, // Deaktiviere TLS-Zertifikat-Validierung für IP-Adressen
      ciphers: 'SSLv3' // Brevo-spezifische TLS-Konfiguration
    },
    // Brevo-spezifische Optimierungen
    pool: true, // Verbindungspool für bessere Performance
    maxConnections: 5, // Maximale Anzahl gleichzeitiger Verbindungen
    maxMessages: 100, // Maximale Anzahl Nachrichten pro Verbindung
    rateLimit: 14, // Rate-Limit für Brevo (14 E-Mails pro Sekunde)
    // Brevo unterstützt erweiterte SMTP-Features
    requireTLS: true, // Erzwinge TLS-Verschlüsselung
    connectionTimeout: 60000, // 60 Sekunden Timeout
    greetingTimeout: 30000, // 30 Sekunden Greeting Timeout
    socketTimeout: 60000 // 60 Sekunden Socket Timeout
  });

  // SMTP-Verbindung testen
  try {
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich');
  } catch (error) {
    console.error('❌ SMTP-Verbindung fehlgeschlagen:', error);
    throw new Error(`SMTP-Verbindung fehlgeschlagen: ${error}`);
  }

  // E-Mail senden mit Brevo-optimierten Einstellungen
  const info = await transporter.sendMail({
    from: `"Gastro CMS" <${config.from}>`, // Verwende den konfigurierten Absender mit Namen
    to,
    subject,
    html,
    // Brevo-spezifische Header für bessere Zustellbarkeit
    headers: {
      'X-Mailer': 'Gastro CMS System',
      'X-Priority': '3', // Normale Priorität
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal'
    },
    // Zusätzliche E-Mail-Optionen für Brevo
    encoding: 'utf8',
    date: new Date(),
    // Brevo unterstützt erweiterte E-Mail-Features
    envelope: {
      from: config.from,
      to: to
    }
  });

  console.log('✅ E-Mail erfolgreich gesendet:', info.messageId);
  return info;
}

// Restaurant-Einstellungen laden
async function getRestaurantSettings() {
  const settings = await prisma.restaurantSettings.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (!settings) {
    throw new Error('Restaurant-Einstellungen nicht gefunden');
  }
  
  return {
    restaurantName: settings.restaurantName || 'Restaurant',
    address: settings.address || '',
    city: settings.city || '',
    postalCode: settings.postalCode || '',
    phone: settings.phone || '',
    email: settings.email || ''
  };
}

// 1. Restaurant E-Mail: Neue Bestellung
export async function sendNewOrderNotificationToRestaurant(orderId: number) {
  try {
    // E-Mail an Restaurant wird gesendet
    
    const restaurantSettings = await getRestaurantSettings();
    
    // Bestellung mit allen Details laden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order || !order.customer) {
      throw new Error('Bestellung oder Kunde nicht gefunden');
    }
    
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      deliveryTime: order.deliveryTime ? (() => {
        try {
          const date = new Date(order.deliveryTime);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch (error) {
          console.warn('Invalid delivery time in email service:', order.deliveryTime, error);
          return undefined;
        }
      })() : undefined,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone || '',
        address: order.customer.address || ''
      },
      orderItems: order.orderItems.map(item => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: {
          name: item.product.name,
          description: item.product.description || ''
        }
      }))
    };
    
    const { subject, html } = generateNewOrderEmailForRestaurant(orderData, restaurantSettings);
    
    if (!restaurantSettings.email) {
      throw new Error('Restaurant E-Mail-Adresse nicht konfiguriert');
    }
    
    await sendEmail(restaurantSettings.email, subject, html);
    console.log('✅ Neue Bestellung E-Mail an Restaurant gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Restaurant-Benachrichtigung:', error);
    throw error;
  }
}

// 2. Kunden E-Mail: Registrierung
export async function sendRegistrationEmail(customerEmail: string, customerName: string, verificationToken: string) {
  try {
    console.log('📨 Sende Registrierungs-E-Mail an:', customerEmail);
    
    const restaurantSettings = await getRestaurantSettings();
    const { subject, html } = generateRegistrationEmail(customerName, verificationToken, restaurantSettings);
    
    await sendEmail(customerEmail, subject, html);
    console.log('✅ Registrierungs-E-Mail gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Registrierungs-E-Mail:', error);
    throw error;
  }
}

// 3. Kunden E-Mail: Bestellbestätigung
export async function sendOrderConfirmationToCustomer(orderId: number) {
  try {
    // Bestellbestätigung an Kunde wird gesendet
    
    const restaurantSettings = await getRestaurantSettings();
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order || !order.customer) {
      throw new Error('Bestellung oder Kunde nicht gefunden');
    }
    
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      deliveryTime: order.deliveryTime ? (() => {
        try {
          const date = new Date(order.deliveryTime);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch (error) {
          console.warn('Invalid delivery time in email service:', order.deliveryTime, error);
          return undefined;
        }
      })() : undefined,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone || '',
        address: order.customer.address || ''
      },
      orderItems: order.orderItems.map(item => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: {
          name: item.product.name,
          description: item.product.description || ''
        }
      }))
    };
    
    const { subject, html } = generateOrderConfirmationEmail(orderData, restaurantSettings);
    
    await sendEmail(order.customer.email, subject, html);
    console.log('✅ Bestellbestätigung an Kunde gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Bestellbestätigung:', error);
    throw error;
  }
}

// 4. Kunden E-Mail: Status-Update
export async function sendOrderStatusUpdateToCustomer(orderId: number, newStatus: string) {
  try {
    // Status-Update an Kunde wird gesendet
    
    const restaurantSettings = await getRestaurantSettings();
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order || !order.customer) {
      throw new Error('Bestellung oder Kunde nicht gefunden');
    }
    
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: newStatus,
      deliveryTime: order.deliveryTime ? (() => {
        try {
          const date = new Date(order.deliveryTime);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch (error) {
          console.warn('Invalid delivery time in email service:', order.deliveryTime, error);
          return undefined;
        }
      })() : undefined,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone || '',
        address: order.customer.address || ''
      },
      orderItems: order.orderItems.map(item => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: {
          name: item.product.name,
          description: item.product.description || ''
        }
      }))
    };
    
    const { subject, html } = generateOrderStatusEmail(orderData, newStatus, restaurantSettings);
    
    await sendEmail(order.customer.email, subject, html);
    console.log('✅ Status-Update an Kunde gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden des Status-Updates:', error);
    throw error;
  }
}

// 5. Lieferanten E-Mail: Bestellzuweisung
export async function sendDeliveryAssignmentToDriver(orderId: number, driverId: number) {
  try {
    // Bestellzuweisung an Lieferant wird gesendet
    
    const restaurantSettings = await getRestaurantSettings();
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    const driver = await prisma.deliveryDriver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true
      }
    });
    
    if (!order || !order.customer || !driver) {
      throw new Error('Bestellung, Kunde oder Lieferant nicht gefunden');
    }
    
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      deliveryTime: order.deliveryTime ? (() => {
        try {
          const date = new Date(order.deliveryTime);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch (error) {
          console.warn('Invalid delivery time in email service:', order.deliveryTime, error);
          return undefined;
        }
      })() : undefined,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone || '',
        address: order.customer.address || ''
      },
      orderItems: order.orderItems.map(item => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: {
          name: item.product.name,
          description: item.product.description || ''
        }
      }))
    };
    
    const driverData = {
      firstName: driver.user.profile?.firstName || 'Lieferant',
      lastName: driver.user.profile?.lastName || '',
      email: driver.user.email,
      phone: driver.profile?.phone || ''
    };
    
    const { subject, html } = generateDeliveryAssignmentEmail(orderData, driverData, restaurantSettings);
    
    await sendEmail(driver.user.email, subject, html);
    console.log('✅ Bestellzuweisung an Lieferant gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Bestellzuweisung:', error);
    throw error;
  }
}

// 6. Lieferanten E-Mail: Zugangsdaten
export async function sendDriverCredentials(driverId: number, loginCredentials: { email: string; password: string }) {
  try {
    console.log('📨 Sende Zugangsdaten an Lieferant:', driverId);
    
    const restaurantSettings = await getRestaurantSettings();
    
    const driver = await prisma.deliveryDriver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        profile: true
      }
    });
    
    if (!driver) {
      throw new Error('Lieferant nicht gefunden');
    }
    
    const driverData = {
      firstName: driver.user.profile?.firstName || 'Lieferant',
      lastName: driver.user.profile?.lastName || '',
      email: driver.user.email,
      phone: driver.profile?.phone || ''
    };
    
    const { subject, html } = generateDriverCredentialsEmail(driverData, loginCredentials, restaurantSettings);
    
    await sendEmail(driver.user.email, subject, html);
    console.log('✅ Zugangsdaten an Lieferant gesendet');
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Zugangsdaten:', error);
    throw error;
  }
}
