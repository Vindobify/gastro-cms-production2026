import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
// import { sendContactEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('📥 Kontakt-API aufgerufen');
  try {
    const body = await request.json();
    console.log('📋 Empfangene Daten:', { name: body.name, email: body.email, subject: body.subject });
    const { name, email, phone, subject, message } = body;

    // Validiere erforderliche Felder
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, E-Mail, Betreff und Nachricht sind erforderlich' },
        { status: 400 }
      );
    }

    // Validiere E-Mail Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Lade Restaurant-Einstellungen für E-Mail-Adresse
    console.log('🏪 Lade Restaurant-Einstellungen...');
    const restaurantSettings = await prisma.restaurantSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    console.log('🏪 Restaurant-Einstellungen geladen:', restaurantSettings ? 'Gefunden' : 'Nicht gefunden');

    if (!restaurantSettings?.email) {
      return NextResponse.json(
        { error: 'Restaurant E-Mail-Adresse nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Temporär: Nur Logging ohne E-Mail-Versand
    console.log('📧 Kontaktanfrage empfangen:', {
      name,
      email,
      phone,
      subject,
      message,
      restaurantEmail: restaurantSettings.email,
      timestamp: new Date().toISOString()
    });
    
    // TODO: E-Mail-Versand später aktivieren
    // const emailInfo = await sendContactEmail(
    //   { name, email, phone, subject, message },
    //   restaurantSettings.email
    // );

    return NextResponse.json({
      success: true,
      message: 'Ihre Nachricht wurde erfolgreich gesendet!',
      recipientEmail: restaurantSettings.email
    });

  } catch (error) {
    console.error('❌ Fehler beim Verarbeiten der Kontaktanfrage:', error);
    console.error('❌ Error Stack:', error instanceof Error ? error.stack : 'Kein Stack verfügbar');
    return NextResponse.json(
      { error: `Fehler beim Senden der Nachricht: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    );
  }
}
