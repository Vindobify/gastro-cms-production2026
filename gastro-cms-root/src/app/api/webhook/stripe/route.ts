import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || '96fdd4001@smtp-brevo.com',
    pass: process.env.SMTP_PASS || 'zLCrHG9R6Qx4NjEq'
  },
  tls: {
    rejectUnauthorized: false
  }
}

const transporter = nodemailer.createTransport(EMAIL_CONFIG)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('✅ Zahlung erfolgreich:', session.id)

      // Sende Bestellung ans CRM
      try {
        const metadata = session.metadata || {}
        
        const crmUrl = process.env.CRM_API_URL || 'https://dashboard.gastro-cms.at'
        const response = await fetch(`${crmUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_type: metadata.business_type || '',
            restaurant_name: metadata.restaurant_name,
            owner_name: metadata.owner_name,
            email: metadata.email,
            phone: metadata.phone,
            address: metadata.address,
            postal_code: metadata.postal_code,
            city: metadata.city,
            has_delivery_service: metadata.has_delivery_service === 'true',
            monthly_revenue: metadata.monthly_revenue,
            has_domain: metadata.has_domain === 'true',
            existing_domain: metadata.has_domain === 'true' ? metadata.domain_name : '',
            desired_domain: metadata.has_domain !== 'true' ? metadata.domain_name : '',
            notes: metadata.message,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
          }),
        })

        if (response.ok) {
          console.log('✅ Bestellung erfolgreich ans CRM gesendet')
        } else {
          console.error('❌ Fehler beim Senden ans CRM:', await response.text())
        }
      } catch (error) {
        console.error('❌ Fehler beim Senden ans CRM:', error)
      }

      // Sende Bestätigungs-E-Mail an Kunden
      try {
        const metadata = session.metadata || {}
        const customerEmail = metadata.email || session.customer_email
        
        if (customerEmail) {
          await transporter.sendMail({
            from: '"Gastro CMS 3.0" <office@gastro-cms.at>',
            to: customerEmail,
            subject: '✅ Bestellung bestätigt - Gastro CMS 3.0',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎉 Vielen Dank für deine Bestellung!</h1>
                  </div>
                  <div class="content">
                    <p>Hallo ${metadata.owner_name || 'lieber Gastronom'},</p>
                    
                    <p>Wir haben deine Zahlung erfolgreich erhalten und freuen uns, dich bei Gastro CMS 3.0 begrüßen zu dürfen! 🚀</p>
                    
                    <div class="highlight">
                      <h3>📋 Deine Bestelldetails:</h3>
                      ${metadata.business_type ? `<p><strong>Geschäftstyp:</strong> ${metadata.business_type}</p>` : ''}
                      <p><strong>Geschäftsname:</strong> ${metadata.restaurant_name}</p>
                      <p><strong>E-Mail:</strong> ${customerEmail}</p>
                      ${metadata.phone ? `<p><strong>Telefon:</strong> ${metadata.phone}</p>` : ''}
                      <p><strong>Betrag:</strong> € 180,00 / Jahr</p>
                      <p><strong>Zahlungsstatus:</strong> ✅ Bezahlt</p>
                    </div>
                    
                    <h3>🎯 Was passiert als nächstes?</h3>
                    <ul>
                      <li>✅ Unser Team meldet sich innerhalb von 24 Stunden bei dir</li>
                      <li>✅ Wir richten dein Gastro CMS 3.0 System ein</li>
                      <li>✅ Du erhältst Zugang zu deinem persönlichen Dashboard</li>
                      <li>✅ Wir schulen dich im Umgang mit dem System</li>
                    </ul>
                    
                    <p style="text-align: center;">
                      <a href="https://gastro-cms.at/bestellung/erfolg?session_id=${session.id}" class="button">
                        📄 Bestellstatus ansehen
                      </a>
                    </p>
                    
                    <div class="highlight">
                      <h3>💡 Wichtige Informationen:</h3>
                      <p>Deine Lizenz ist ab heute für <strong>1 Jahr gültig</strong>.</p>
                      <p>Du sparst im Vergleich zu herkömmlichen Lieferdiensten bis zu <strong>20% Provision</strong>!</p>
                    </div>
                    
                    <h3>📧 Fragen?</h3>
                    <p>Bei Fragen erreichst du uns jederzeit:</p>
                    <ul>
                      <li>📧 E-Mail: <a href="mailto:office@gastro-cms.at">office@gastro-cms.at</a></li>
                      <li>📱 Telefon: <a href="tel:+4366054678066">+43 660 546 78 06</a></li>
                    </ul>
                    
                    <div class="footer">
                      <p>Mit freundlichen Grüßen<br>
                      <strong>Dein Gastro CMS 3.0 Team</strong></p>
                      <p style="font-size: 12px; color: #999; margin-top: 20px;">
                        NextPuls Digital - Mario Gaupmann<br>
                        Markt 141, 2572 Kaumberg, Österreich<br>
                        <a href="https://gastro-cms.at">gastro-cms.at</a>
                      </p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          })
          
          console.log('✅ Bestätigungs-E-Mail an Kunden gesendet:', customerEmail)
        }
      } catch (error) {
        console.error('❌ Fehler beim Senden der E-Mail:', error)
      }

      // Sende Benachrichtigung an Admin
      try {
        const metadata = session.metadata || {}
        
        await transporter.sendMail({
          from: '"Gastro CMS 3.0" <office@gastro-cms.at>',
          to: 'office@nextpuls.com',
          subject: '🎉 Neue Bestellung eingegangen!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #10b981; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💰 Neue Bestellung eingegangen!</h1>
                </div>
                <div class="content">
                  <p>Eine neue Bestellung wurde erfolgreich bezahlt:</p>
                  
                  <div class="info-box">
                    <h3>🏪 Geschäftsinformationen:</h3>
                    ${metadata.business_type ? `<p><strong>Geschäftstyp:</strong> ${metadata.business_type}</p>` : ''}
                    <p><strong>Geschäftsname:</strong> ${metadata.restaurant_name}</p>
                    ${metadata.owner_name ? `<p><strong>Inhaber:</strong> ${metadata.owner_name}</p>` : ''}
                    <p><strong>E-Mail:</strong> ${metadata.email}</p>
                    ${metadata.phone ? `<p><strong>Telefon:</strong> ${metadata.phone}</p>` : ''}
                    ${metadata.address ? `<p><strong>Adresse:</strong> ${metadata.address}, ${metadata.postal_code} ${metadata.city}</p>` : ''}
                  </div>
                  
                  <div class="info-box">
                    <h3>💳 Zahlungsinformationen:</h3>
                    <p><strong>Betrag:</strong> € 180,00</p>
                    <p><strong>Status:</strong> ✅ Bezahlt</p>
                    <p><strong>Session ID:</strong> ${session.id}</p>
                    <p><strong>Payment Intent:</strong> ${session.payment_intent}</p>
                  </div>
                  
                  ${metadata.domain_name ? `
                  <div class="info-box">
                    <h3>🌐 Domain:</h3>
                    <p>${metadata.domain_name} ${metadata.has_domain === 'true' ? '(vorhanden)' : '(neu registrieren)'}</p>
                  </div>
                  ` : ''}
                  
                  ${metadata.message ? `
                  <div class="info-box">
                    <h3>💬 Nachricht:</h3>
                    <p>${metadata.message}</p>
                  </div>
                  ` : ''}
                  
                  <p style="text-align: center;">
                    <a href="https://dashboard.gastro-cms.at/bestellungen" class="button">
                      📊 Bestellung im CRM ansehen
                    </a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
        
        console.log('✅ Admin-Benachrichtigung gesendet')
      } catch (error) {
        console.error('❌ Fehler beim Senden der Admin-E-Mail:', error)
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('❌ Checkout Session abgelaufen:', session.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('❌ Zahlung fehlgeschlagen:', paymentIntent.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

