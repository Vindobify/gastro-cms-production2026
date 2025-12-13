import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenant } from '@/lib/tenant';

// Fallback SEO settings
const defaultSeoSettings = {
  metaTitle: 'Gastro CMS - Restaurant Management System',
  metaDescription: 'Professional restaurant management system with online ordering, delivery tracking, and comprehensive dashboard.',
  ogImage: '/favicon.ico',
  favicon: '/favicon.ico',
  robotsTxt: 'User-agent: *\nAllow: /',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  structuredDataEnabled: true,
  sitemapEnabled: true
};

export async function GET(request: NextRequest) {
  try {
    // Versuche SEO-Einstellungen aus der Datenbank zu laden
    // Versuche SEO-Einstellungen aus der Datenbank zu laden
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json(defaultSeoSettings);

    const settings = tenant.settings;

    if (settings) {
      return NextResponse.json({
        metaTitle: settings.metaTitle || defaultSeoSettings.metaTitle,
        metaDescription: settings.metaDescription || defaultSeoSettings.metaDescription,
        ogImage: settings.ogImage || defaultSeoSettings.ogImage,
        favicon: settings.favicon || defaultSeoSettings.favicon,
        robotsTxt: settings.robotsTxt || defaultSeoSettings.robotsTxt,
        googleAnalyticsId: settings.googleAnalyticsId || defaultSeoSettings.googleAnalyticsId,
        googleTagManagerId: settings.googleTagManagerId || defaultSeoSettings.googleTagManagerId,
        facebookPixelId: settings.facebookPixelId || defaultSeoSettings.facebookPixelId,
        structuredDataEnabled: settings.structuredDataEnabled ?? defaultSeoSettings.structuredDataEnabled,
        sitemapEnabled: settings.sitemapEnabled ?? defaultSeoSettings.sitemapEnabled
      });
    }

    // Fallback zu Standard-Einstellungen
    return NextResponse.json(defaultSeoSettings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    // Bei Fehler Fallback zu Standard-Einstellungen
    return NextResponse.json(defaultSeoSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Versuche SEO-Einstellungen in der Datenbank zu speichern
    // Versuche SEO-Einstellungen in der Datenbank zu speichern
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const settings = await prisma.restaurantSettings.findUnique({
      where: { tenantId: tenant.id }
    });

    if (settings) {
      // Aktualisiere bestehende Einstellungen
      await prisma.restaurantSettings.update({
        where: { tenantId: tenant.id },
        data: {
          metaTitle: body.metaTitle || '',
          metaDescription: body.metaDescription || '',
          ogImage: body.ogImage || '',
          favicon: body.favicon || '',
          robotsTxt: body.robotsTxt || '',
          googleAnalyticsId: body.googleAnalyticsId || '',
          googleTagManagerId: body.googleTagManagerId || '',
          facebookPixelId: body.facebookPixelId || '',
          structuredDataEnabled: body.structuredDataEnabled ?? true,
          sitemapEnabled: body.sitemapEnabled ?? true
        }
      });
    } else {
      // Erstelle neue Einstellungen
      await prisma.restaurantSettings.create({
        data: {
          tenantId: tenant.id,
          restaurantName: 'Restaurant', // Minimal erforderlich
          metaTitle: body.metaTitle || '',
          metaDescription: body.metaDescription || '',
          ogImage: body.ogImage || '',
          favicon: body.favicon || '',
          robotsTxt: body.robotsTxt || '',
          googleAnalyticsId: body.googleAnalyticsId || '',
          googleTagManagerId: body.googleTagManagerId || '',
          facebookPixelId: body.facebookPixelId || '',
          structuredDataEnabled: body.structuredDataEnabled ?? true,
          sitemapEnabled: body.sitemapEnabled ?? true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SEO settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
}
