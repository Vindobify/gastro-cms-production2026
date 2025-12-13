import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get current maintenance settings
    const settings = await prisma.restaurantSettings.findFirst()
    
    return NextResponse.json({
      maintenanceMode: (settings as any)?.maintenanceMode || false,
      maintenanceTitle: (settings as any)?.maintenanceTitle || '',
      maintenanceMessage: (settings as any)?.maintenanceMessage || '',
    })

  } catch (error) {
    console.error('Error fetching maintenance settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Wartungseinstellungen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { maintenanceMode, maintenanceTitle, maintenanceMessage } = body

    // Validate input
    if (typeof maintenanceMode !== 'boolean') {
      return NextResponse.json(
        { error: 'Ungültiger Wartungsmodus-Status' },
        { status: 400 }
      )
    }

    // Update or create settings
    const settings = await prisma.restaurantSettings.upsert({
      where: { id: 1 },
      update: {
        maintenanceMode: maintenanceMode as any,
        maintenanceTitle: maintenanceTitle || null,
        maintenanceMessage: maintenanceMessage || null,
      } as any,
      create: {
        restaurantName: 'Restaurant',
        maintenanceMode: maintenanceMode as any,
        maintenanceTitle: maintenanceTitle || null,
        maintenanceMessage: maintenanceMessage || null,
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: maintenanceMode 
        ? 'Wartungsmodus aktiviert' 
        : 'Wartungsmodus deaktiviert',
      settings: {
        maintenanceMode: (settings as any).maintenanceMode,
        maintenanceTitle: (settings as any).maintenanceTitle,
        maintenanceMessage: (settings as any).maintenanceMessage,
      }
    })

  } catch (error) {
    console.error('Error updating maintenance settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Wartungseinstellungen' },
      { status: 500 }
    )
  }
}
