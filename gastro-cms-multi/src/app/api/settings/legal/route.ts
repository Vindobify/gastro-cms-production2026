import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const settings = await prisma.restaurantSettings.findFirst({
      select: {
        impressumContent: true,
        agbContent: true,
        datenschutzContent: true,
        impressumLastUpdated: true,
        agbLastUpdated: true,
        datenschutzLastUpdated: true,
      }
    });

    if (!settings) {
      return NextResponse.json({
        impressumContent: '',
        agbContent: '',
        datenschutzContent: '',
        impressumLastUpdated: null,
        agbLastUpdated: null,
        datenschutzLastUpdated: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching legal content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der rechtlichen Inhalte' },
      { status: 500 }
    );
  }
}

async function handlePUT(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { 
      impressumContent, 
      agbContent, 
      datenschutzContent,
      type 
    } = body;

    if (!type || !['impressum', 'agb', 'datenschutz'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Typ. Erlaubt: impressum, agb, datenschutz' },
        { status: 400 }
      );
    }

    // Prüfe ob Settings existieren
    let settings = await prisma.restaurantSettings.findFirst();
    
    if (!settings) {
      // Erstelle neue Settings mit Standardwerten
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantName: 'Restaurant',
          address: '',
          city: '',
          postalCode: '',
          phone: '',
          email: '',
        }
      });
    }

    // Aktualisiere den entsprechenden Inhalt
    const updateData: any = {};
    const now = new Date();

    switch (type) {
      case 'impressum':
        updateData.impressumContent = impressumContent;
        updateData.impressumLastUpdated = now;
        break;
      case 'agb':
        updateData.agbContent = agbContent;
        updateData.agbLastUpdated = now;
        break;
      case 'datenschutz':
        updateData.datenschutzContent = datenschutzContent;
        updateData.datenschutzLastUpdated = now;
        break;
    }

    const updatedSettings = await prisma.restaurantSettings.update({
      where: { id: settings.id },
      data: updateData,
      select: {
        impressumContent: true,
        agbContent: true,
        datenschutzContent: true,
        impressumLastUpdated: true,
        agbLastUpdated: true,
        datenschutzLastUpdated: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} erfolgreich aktualisiert`,
      data: updatedSettings
    });

  } catch (error) {
    console.error('Error updating legal content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der rechtlichen Inhalte' },
      { status: 500 }
    );
  }
}

// Öffentlicher Lesezugriff für Frontend, Auth für Änderungen
export const GET = createProtectedHandler(AUTH_CONFIGS.PUBLIC_READ, handleGET);
export const PUT = createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, handlePUT);
