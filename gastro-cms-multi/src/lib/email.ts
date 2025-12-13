import nodemailer from 'nodemailer';

interface EmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: EmailData, recipientEmail: string) {
  console.log('🔧 E-Mail-Versand gestartet...');
  console.log('📧 SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? '***@' + process.env.SMTP_USER.split('@')[1] : 'NICHT_GESETZT',
    from: process.env.SMTP_FROM
  });
  console.log('📨 Empfänger:', recipientEmail);
  
  // Erstelle SMTP Transporter mit Brevo-Optimierungen
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true für 465, false für andere Ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    // Brevo-spezifische Optimierungen
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
    requireTLS: true,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  });

  // E-Mail Inhalt
  const mailOptions = {
    from: `"${data.name}" <${process.env.SMTP_FROM}>`,
    to: recipientEmail,
    replyTo: data.email,
    subject: `Kontaktanfrage: ${data.subject}`,
    html: `
      <h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>E-Mail:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
      <p><strong>Betreff:</strong> ${data.subject}</p>
      <p><strong>Nachricht:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Diese E-Mail wurde über das Kontaktformular Ihrer Website gesendet.
      </p>
    `,
    text: `
Neue Kontaktanfrage

Name: ${data.name}
E-Mail: ${data.email}
${data.phone ? `Telefon: ${data.phone}` : ''}
Betreff: ${data.subject}

Nachricht:
${data.message}

---
Diese E-Mail wurde über das Kontaktformular Ihrer Website gesendet.
    `
  };

  // Teste SMTP-Verbindung
  console.log('🔌 Teste SMTP-Verbindung...');
  try {
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich!');
  } catch (verifyError) {
    console.error('❌ SMTP-Verbindung fehlgeschlagen:', verifyError);
    throw new Error(`SMTP-Verbindung fehlgeschlagen: ${verifyError}`);
  }

  // E-Mail senden
  console.log('📤 Sende E-Mail...');
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ E-Mail erfolgreich gesendet:', info.messageId);
  return info;
}
