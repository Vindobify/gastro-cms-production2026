import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const CRM_API_URL = process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL || 'http://crm.gastro-cms.local'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validierung
    if (!data.business_type || !data.restaurant_name || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Geschäftstyp, Geschäftsname und E-Mail sind erforderlich' },
        { status: 400 }
      )
    }

    // Payment Amount: Kostenlos wenn Domain vorhanden, sonst €30,00
    const paymentAmount = data.has_domain ? 0 : 30.00

    // Erstelle OrderRequest direkt in der Datenbank
    let orderRequestId: number | null = null
    let stripeSessionId: string | null = null

    const orderRequestData = {
      businessType: data.business_type,
      restaurantName: data.restaurant_name,
      ownerName: data.owner_name || '',
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      postalCode: data.postal_code || '',
      city: data.city || '',
      hasDeliveryService: data.has_delivery_service || false,
      deliveryServiceName: data.delivery_service_name || null,
      monthlyRevenue: data.monthly_revenue ? parseFloat(data.monthly_revenue) : null,
      deliveryPercentage: data.delivery_percentage ? parseFloat(data.delivery_percentage) : null,
      calculatedSavings: data.calculatedSavings ? parseFloat(data.calculatedSavings) : null,
      hasDomain: data.has_domain || false,
      existingDomain: data.existing_domain || null,
      desiredDomain: data.desired_domain || null,
      acceptedTerms: data.acceptTerms || false,
      acceptedPrivacy: data.acceptPrivacy || false,
      acceptedAV: data.acceptAV || false,
      status: paymentAmount === 0 ? 'PAID' : 'PENDING', // Direkt PAID wenn kostenlos
      paymentAmount: paymentAmount,
    }

    // Direkt in die Datenbank speichern (wenn DATABASE_URL konfiguriert ist)
    let savedToDatabase = false;
    if (process.env.DATABASE_URL) {
      try {
        const orderRequest = await prisma.orderRequest.create({
          data: orderRequestData,
        });
        console.log('[Order API] Bestellung erfolgreich in Datenbank gespeichert:', orderRequest.id);
        orderRequestId = orderRequest.id;
        savedToDatabase = true;
      } catch (dbError) {
        console.error('[Order API] Fehler beim Speichern in Datenbank:', dbError);
        if (dbError instanceof Error) {
          console.error('[Order API] Datenbank-Fehler-Details:', dbError.message);
        }
      }
    }

    // Fallback: An CRM-Dashboard senden über HTTP (falls Datenbank nicht verfügbar)
    if (!savedToDatabase) {
      try {
        console.log(`[Order API] Fallback: Versuche Bestellung über HTTP an CRM zu senden: ${CRM_API_URL}/api/order-requests`);
        
        const crmResponse = await fetch(`${CRM_API_URL}/api/order-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderRequestData),
        });

        if (crmResponse.ok) {
          const orderRequest = await crmResponse.json();
          orderRequestId = orderRequest.id;
          console.log('[Order API] Bestellung erfolgreich über HTTP an CRM gesendet:', orderRequestId);
        } else {
          const errorText = await crmResponse.text();
          console.error(`[Order API] Fehler beim Senden an CRM-Dashboard (Status ${crmResponse.status}):`, errorText);
        }
      } catch (crmError) {
        console.error('[Order API] CRM-Dashboard nicht erreichbar:', crmError);
        if (crmError instanceof Error) {
          console.error('[Order API] Fehler-Details:', crmError.message, crmError.stack);
        }
      }
    }

    // Wenn kostenlos (Domain vorhanden): Direkt abschließen
    if (paymentAmount === 0) {
      return NextResponse.json({
        success: true,
        message: 'Bestellung erfolgreich erstellt (kostenlos)',
        orderRequestId,
        paymentAmount: 0,
      })
    }

    // Wenn keine Domain: Stripe Checkout €30,00
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna', 'eps'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Gastro CMS 3.0 - Domain-Kosten',
              description: `Domain-Kosten für ${data.restaurant_name}`,
              images: ['https://gastro-cms.at/logo.png'],
            },
            unit_amount: 3000, // € 30,00 in Cent
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://gastro-cms.local'}/bestellung/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://gastro-cms.local'}/bestellung?cancelled=true`,
      customer_email: data.email,
      metadata: {
        orderRequestId: orderRequestId?.toString() || '',
        business_type: data.business_type || '',
        restaurant_name: data.restaurant_name,
        owner_name: data.owner_name || '',
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        postal_code: data.postal_code || '',
        city: data.city || '',
        has_delivery_service: data.has_delivery_service ? 'true' : 'false',
        monthly_revenue: data.monthly_revenue || '',
        has_domain: 'false',
        domain_name: data.desired_domain || '',
        message: data.notes || '',
      },
      billing_address_collection: 'required',
      locale: 'de',
    })

    stripeSessionId = session.id

    // Update OrderRequest mit Stripe Session ID
    if (orderRequestId && stripeSessionId) {
      if (process.env.DATABASE_URL && savedToDatabase) {
        try {
          await prisma.orderRequest.update({
            where: { id: orderRequestId },
            data: { stripeSessionId: stripeSessionId },
          });
          console.log('[Order API] Stripe Session ID erfolgreich in Datenbank gespeichert');
        } catch (dbError) {
          console.error('[Order API] Fehler beim Aktualisieren der Stripe Session ID:', dbError);
        }
      } else {
        // Fallback über HTTP
        try {
          await fetch(`${CRM_API_URL}/api/order-requests/${orderRequestId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              stripeSessionId: stripeSessionId,
            }),
          })
        } catch (error) {
          console.error('[Order API] Error updating order request with Stripe session:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderRequestId,
      paymentAmount: 30.00,
    })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen der Bestellung' },
      { status: 500 }
    )
  }
}

