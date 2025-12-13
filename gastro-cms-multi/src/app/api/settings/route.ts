import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';
import { normalizeMediaUrl } from '@/lib/url';
import { normalizeDecimalFields, DECIMAL_FIELDS } from '@/lib/decimalUtils';
import { getTenant } from '@/lib/tenant';

async function handleGET() {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const settings = tenant.settings; // Include im getTenant erledigt das

    // Normalisiere Decimal-Werte oder erstelle Standardwerte
    const normalizedSettings = settings ?
      normalizeDecimalFields(settings, DECIMAL_FIELDS.RESTAURANT_SETTINGS) :
      {
        restaurantName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        atuNumber: '',
        fnNumber: '',
        orderDeadline: '22:00',
        deliveryDistricts: '[]',
        minOrderAmount: 0,
        deliveryFee: 0,
        freeDeliveryThreshold: 0,
        defaultTaxRate: 0.20,
        currency: 'EUR',
        timezone: 'Europe/Vienna',
        openingHoursData: {
          montag: { start: '11:00', end: '23:00' },
          dienstag: { start: '11:00', end: '23:00' },
          mittwoch: { start: '11:00', end: '23:00' },
          donnerstag: { start: '11:00', end: '23:00' },
          freitag: { start: '11:00', end: '23:00' },
          samstag: { start: '11:00', end: '23:00' },
          sonntag: { start: '11:00', end: '23:00' }
        }
      };

    return NextResponse.json(normalizedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);

    // Bei Fehler Standardwerte zurückgeben
    const defaultSettings = {
      restaurantName: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      atuNumber: '',
      fnNumber: '',
      orderDeadline: '22:00',
      deliveryDistricts: '[]',
      minOrderAmount: 0,
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      defaultTaxRate: 0.20,
      currency: 'EUR',
      timezone: 'Europe/Vienna',
      openingHoursData: {
        montag: { start: '11:00', end: '23:00' },
        dienstag: { start: '11:00', end: '23:00' },
        mittwoch: { start: '11:00', end: '23:00' },
        donnerstag: { start: '11:00', end: '23:00' },
        freitag: { start: '11:00', end: '23:00' },
        samstag: { start: '11:00', end: '23:00' },
        sonntag: { start: '11:00', end: '23:00' }
      }
    };

    return NextResponse.json(defaultSettings);
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantName,
      address,
      city,
      postalCode,
      phone,
      email,
      atuNumber,
      fnNumber,
      logo,
      favicon,
      openingHoursData,
      orderDeadline,
      deliveryDistricts,
      minOrderAmount,
      deliveryFee,
      freeDeliveryThreshold,
      defaultTaxRate,
      currency,
      timezone
    } = body;

    // URL-Normalisierung für Logo und Favicon mit zentraler Funktion
    const normalizedLogo = normalizeMediaUrl(logo || '');
    const normalizedFavicon = normalizeMediaUrl(favicon || '');

    // Validiere erforderliche Felder
    if (!restaurantName || !address || !city || !postalCode || !phone || !email) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Prüfe ob bereits Einstellungen existieren für DIESEN Tenant
    const existingSettings = tenant.settings; // via Include geladen, oder DB abfrage erneut zur Sicherheit
    // Besser DB Abfrage um sicherzugehen dass wir die ID haben
    const settingsInDb = await prisma.restaurantSettings.findUnique({
      where: { tenantId: tenant.id }
    });

    let settings;
    if (settingsInDb) {
      // Update bestehende Einstellungen
      settings = await prisma.restaurantSettings.update({
        where: { tenantId: tenant.id }, // Nutze tenantId als Unique Identifier oder ID
        data: {
          restaurantName,
          address,
          city,
          postalCode,
          phone,
          email,
          atuNumber: atuNumber || '',
          fnNumber: fnNumber || '',
          logo: normalizedLogo,
          favicon: normalizedFavicon,
          openingHoursData: openingHoursData || null,
          orderDeadline: orderDeadline || '22:00',
          deliveryDistricts: deliveryDistricts || '["1120", "1130", "1140", "1150", "1160"]',
          minOrderAmount: minOrderAmount || 10,
          deliveryFee: deliveryFee || 2.50,
          freeDeliveryThreshold: freeDeliveryThreshold || 25,
          defaultTaxRate: defaultTaxRate || 0.20,
          currency: currency || 'EUR',
          timezone: timezone || 'Europe/Vienna'
        }
      });
    } else {
      // Erstelle neue Einstellungen
      settings = await prisma.restaurantSettings.create({
        data: {
          tenantId: tenant.id, // WICHTIG: Tenant zuweisen
          restaurantName,
          address,
          city,
          postalCode,
          phone,
          email,
          atuNumber: atuNumber || '',
          fnNumber: fnNumber || '',
          logo: normalizedLogo,
          favicon: normalizedFavicon,
          openingHoursData: openingHoursData || null,
          orderDeadline: orderDeadline || '22:00',
          deliveryDistricts: deliveryDistricts || '["1120", "1130", "1140", "1150", "1160"]',
          minOrderAmount: minOrderAmount || 10,
          deliveryFee: deliveryFee || 2.50,
          freeDeliveryThreshold: freeDeliveryThreshold || 25,
          defaultTaxRate: defaultTaxRate || 0.20,
          currency: currency || 'EUR',
          timezone: timezone || 'Europe/Vienna'
        }
      });
    }

    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    );
  }
}

// Export handlers - Public read access for restaurant info, Admin write access
export const GET = createProtectedHandler({
  requireAuth: false,
  allowPublicRead: true
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handlePOST);
