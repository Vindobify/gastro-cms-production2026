import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, ContactFormData } from '@/lib/emailService';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Für jetzt geben wir eine leere Liste zurück
    // In Zukunft könnte hier eine Datenbankabfrage stehen
    return NextResponse.json({
      success: true,
      data: [],
      note: 'Kontaktanfragen werden derzeit nicht in der Datenbank gespeichert'
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Kontaktanfragen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { success: false, error: 'Name, E-Mail und Nachricht sind erforderlich' },
        { status: 400 }
      );
    }

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Direkt in die Datenbank speichern (wenn DATABASE_URL konfiguriert ist)
    let savedToDatabase = false;
    if (process.env.DATABASE_URL) {
      try {
        const contactRequest = await prisma.contactRequest.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            message: data.message,
            status: 'NEW',
          },
        });
        console.log('[Contact API] Kontaktanfrage erfolgreich in Datenbank gespeichert:', contactRequest.id);
        savedToDatabase = true;
      } catch (dbError) {
        console.error('[Contact API] Fehler beim Speichern in Datenbank:', dbError);
        // Fallback: Versuche über HTTP an CRM zu senden
        if (dbError instanceof Error) {
          console.error('[Contact API] Datenbank-Fehler-Details:', dbError.message);
        }
      }
    }

    // Fallback: An CRM-Dashboard senden über HTTP (falls Datenbank nicht verfügbar)
    if (!savedToDatabase) {
      const crmUrl = process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL;
      
      if (crmUrl) {
        try {
          console.log(`[Contact API] Fallback: Versuche Kontaktanfrage über HTTP an CRM zu senden: ${crmUrl}/api/contact-requests`);
          
        const crmResponse = await fetch(`${crmUrl}/api/contact-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            message: data.message,
          }),
        });
        
          if (crmResponse.ok) {
            const result = await crmResponse.json();
            console.log('[Contact API] Kontaktanfrage erfolgreich über HTTP an CRM gesendet:', result);
          } else {
            const errorText = await crmResponse.text();
            console.error(`[Contact API] Fehler beim Senden an CRM-Dashboard (Status ${crmResponse.status}):`, errorText);
        }
      } catch (crmError) {
          console.error('[Contact API] CRM-Dashboard nicht erreichbar:', crmError);
          if (crmError instanceof Error) {
            console.error('[Contact API] Fehler-Details:', crmError.message, crmError.stack);
          }
        }
      } else {
        console.warn('[Contact API] Weder DATABASE_URL noch CRM_API_URL konfiguriert - Kontaktanfrage wird nur per E-Mail gesendet');
      }
    }

    // E-Mail senden
    const emailSent = await sendContactEmail(data);
    
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Fehler beim Senden der E-Mail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nachricht erfolgreich gesendet! Wir melden uns schnellstmöglich bei dir.'
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
