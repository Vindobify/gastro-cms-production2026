import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['impressum', 'agb', 'datenschutz'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Typ. Erlaubt: impressum, agb, datenschutz' },
        { status: 400 }
      );
    }

    const settings = await prisma.restaurantSettings.findFirst({
      select: {
        impressumContent: true,
        agbContent: true,
        datenschutzContent: true,
        impressumLastUpdated: true,
        agbLastUpdated: true,
        datenschutzLastUpdated: true,
        restaurantName: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        email: true,
        atuNumber: true,
        fnNumber: true,
      }
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'Rechtliche Inhalte nicht gefunden' },
        { status: 404 }
      );
    }

    let content = '';
    let lastUpdated = null;

    switch (type) {
      case 'impressum':
        content = settings.impressumContent || '';
        lastUpdated = settings.impressumLastUpdated;
        break;
      case 'agb':
        content = settings.agbContent || '';
        lastUpdated = settings.agbLastUpdated;
        break;
      case 'datenschutz':
        content = settings.datenschutzContent || '';
        lastUpdated = settings.datenschutzLastUpdated;
        break;
    }

    // Fallback-Inhalte falls keine benutzerdefinierten Inhalte vorhanden
    if (!content) {
      content = getDefaultContent(type, settings);
    }

    return NextResponse.json({
      content,
      lastUpdated,
      restaurantName: settings.restaurantName,
      address: settings.address,
      city: settings.city,
      postalCode: settings.postalCode,
      phone: settings.phone,
      email: settings.email,
      atuNumber: settings.atuNumber,
      fnNumber: settings.fnNumber,
    });

  } catch (error) {
    console.error('Error fetching legal content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der rechtlichen Inhalte' },
      { status: 500 }
    );
  }
}

function getDefaultContent(type: string, settings: any): string {
  const restaurantName = settings.restaurantName || 'Restaurant';
  const address = settings.address || '';
  const city = settings.city || '';
  const postalCode = settings.postalCode || '';
  const phone = settings.phone || '';
  const email = settings.email || '';
  const atuNumber = settings.atuNumber || '';
  const fnNumber = settings.fnNumber || '';

  switch (type) {
    case 'impressum':
      return `
        <h1>Impressum</h1>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p><strong>${restaurantName}</strong></p>
        ${address ? `<p>${address}</p>` : ''}
        ${postalCode && city ? `<p>${postalCode} ${city}</p>` : ''}
        ${phone ? `<p>Telefon: ${phone}</p>` : ''}
        ${email ? `<p>E-Mail: ${email}</p>` : ''}
        ${atuNumber ? `<p>ATU-Nummer: ${atuNumber}</p>` : ''}
        ${fnNumber ? `<p>FN-Nummer: ${fnNumber}</p>` : ''}
        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>${restaurantName}</p>
        ${address ? `<p>${address}</p>` : ''}
        ${postalCode && city ? `<p>${postalCode} ${city}</p>` : ''}
      `;
    
    case 'agb':
      return `
        <h1>Allgemeine Geschäftsbedingungen</h1>
        <h2>§ 1 Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen bei ${restaurantName}.</p>
        <h2>§ 2 Bestellungen</h2>
        <p>Bestellungen können online über unsere Website oder telefonisch aufgegeben werden.</p>
        <h2>§ 3 Preise und Zahlung</h2>
        <p>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.</p>
        <h2>§ 4 Lieferung</h2>
        <p>Die Lieferzeiten sind unverbindlich und können je nach Bestellaufkommen variieren.</p>
        <h2>§ 5 Widerrufsrecht</h2>
        <p>Bei Lebensmitteln besteht kein Widerrufsrecht nach § 312g Abs. 2 BGB.</p>
      `;
    
    case 'datenschutz':
      return `
        <h1>Datenschutzerklärung</h1>
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
        <h2>2. Datenerfassung auf dieser Website</h2>
        <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
        <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
        <h3>Wie erfassen wir Ihre Daten?</h3>
        <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen.</p>
        <h2>3. Hosting</h2>
        <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter: ${restaurantName}</p>
      `;
    
    default:
      return '<p>Inhalt wird geladen...</p>';
  }
}
