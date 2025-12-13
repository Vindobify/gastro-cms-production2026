import { NextRequest, NextResponse } from 'next/server'
import { sendTerminEmail, sendTerminConfirmationEmail } from '@/lib/emailService'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Validierung der Pflichtfelder
    const requiredFields = ['business_type', 'restaurant_name', 'vorname', 'nachname', 'telefon', 'email', 'terminart', 'datum', 'uhrzeit', 'agb', 'datenschutz']
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Feld ${field} ist erforderlich` },
          { status: 400 }
        )
      }
    }

    // Zusätzliche Validierung für persönliche Termine
    if (formData.terminart === 'lokal') {
      const adresseFields = ['adresse', 'postleitzahl', 'ort']
      for (const field of adresseFields) {
        if (!formData[field]) {
          return NextResponse.json(
            { error: `Feld ${field} ist bei persönlichen Terminen erforderlich` },
            { status: 400 }
          )
        }
      }
    }

        // Parse date and time
        const dateTime = new Date(`${formData.datum}T${formData.uhrzeit}`);
        
    const appointmentData = {
            businessType: formData.business_type,
            restaurantName: formData.restaurant_name,
            firstName: formData.vorname,
            lastName: formData.nachname,
            email: formData.email,
            phone: formData.telefon,
            appointmentType: formData.terminart,
      date: dateTime,
            time: formData.uhrzeit,
            address: formData.adresse || null,
            postalCode: formData.postleitzahl || null,
            city: formData.ort || null,
            message: formData.message || null,
      status: 'PENDING',
    };
        
    // Direkt in die Datenbank speichern (wenn DATABASE_URL konfiguriert ist)
    let savedToDatabase = false;
    if (process.env.DATABASE_URL) {
      try {
        const appointment = await prisma.appointment.create({
          data: appointmentData,
        });
        console.log('[Termin API] Terminanfrage erfolgreich in Datenbank gespeichert:', appointment.id);
        savedToDatabase = true;
      } catch (dbError) {
        console.error('[Termin API] Fehler beim Speichern in Datenbank:', dbError);
        if (dbError instanceof Error) {
          console.error('[Termin API] Datenbank-Fehler-Details:', dbError.message);
        }
      }
    }

    // Fallback: An CRM-Dashboard senden über HTTP (falls Datenbank nicht verfügbar)
    if (!savedToDatabase) {
      const crmUrl = process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL || 'http://crm.gastro-cms.local';
      if (crmUrl) {
        try {
          console.log(`[Termin API] Fallback: Versuche Terminanfrage über HTTP an CRM zu senden: ${crmUrl}/api/appointments`);
          
          const crmResponse = await fetch(`${crmUrl}/api/appointments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...appointmentData,
              date: dateTime.toISOString(),
            }),
          });
          
          if (crmResponse.ok) {
            const result = await crmResponse.json();
            console.log('[Termin API] Terminanfrage erfolgreich über HTTP an CRM gesendet:', result);
          } else {
            const errorText = await crmResponse.text();
            console.error(`[Termin API] Fehler beim Senden an CRM-Dashboard (Status ${crmResponse.status}):`, errorText);
        }
      } catch (crmError) {
          console.error('[Termin API] CRM-Dashboard nicht erreichbar:', crmError);
          if (crmError instanceof Error) {
            console.error('[Termin API] Fehler-Details:', crmError.message, crmError.stack);
          }
        }
      } else {
        console.warn('[Termin API] Weder DATABASE_URL noch CRM_API_URL konfiguriert - Terminanfrage wird nur per E-Mail gesendet');
      }
    }

    // E-Mail an office@gastro-cms.at senden
    await sendTerminEmail(formData)
    
    // Bestätigungsmail an Kunden senden
    await sendTerminConfirmationEmail(formData)

    return NextResponse.json({ 
      success: true, 
      message: 'Terminanfrage erfolgreich gesendet' 
    })

  } catch (error) {
    console.error('Fehler beim Senden der Terminanfrage:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Terminanfrage' },
      { status: 500 }
    )
  }
}
