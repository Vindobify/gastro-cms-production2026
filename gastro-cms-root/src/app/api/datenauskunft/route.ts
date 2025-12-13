import { NextRequest, NextResponse } from 'next/server'
import { sendDataRequestEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const data = {
      anfrageart: body.anfrageart,
      vorname: body.vorname,
      nachname: body.nachname,
      email: body.email,
      telefon: body.telefon || '',
      restaurant: body.restaurant || '',
      nachricht: body.nachricht || '',
      identifikation: body.agb || true,
      datenschutz: body.datenschutz || true,
    }

    // Validierung
    if (!data.anfrageart || !data.vorname || !data.nachname || !data.email) {
      return NextResponse.json(
        { error: 'Bitte füllen Sie alle Pflichtfelder aus.' },
        { status: 400 }
      )
    }

    // An CRM-Dashboard senden (falls konfiguriert)
    const crmUrl = process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL;
    if (crmUrl) {
      try {
        const crmResponse = await fetch(`${crmUrl}/api/forms/datenauskunft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!crmResponse.ok) {
          console.error('Fehler beim Senden an CRM-Dashboard');
        }
      } catch (crmError) {
        console.error('CRM-Dashboard nicht erreichbar:', crmError);
        // Weiter fortfahren, auch wenn CRM nicht erreichbar ist
      }
    }

    // E-Mail senden
    await sendDataRequestEmail(data)

    return NextResponse.json(
      { message: 'Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 30 Tagen bei Ihnen.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Fehler bei Datenauskunft:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}
