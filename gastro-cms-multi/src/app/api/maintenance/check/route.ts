import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.restaurantSettings.findFirst()
    
    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceTitle: settings?.maintenanceTitle || 'Wartungsarbeiten',
      maintenanceMessage: settings?.maintenanceMessage || 'Wir führen derzeit Wartungsarbeiten durch. Bitte besuchen Sie uns später wieder.',
    })

  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    return NextResponse.json(
      { 
        maintenanceMode: false,
        maintenanceTitle: 'Wartungsarbeiten',
        maintenanceMessage: 'Wir führen derzeit Wartungsarbeiten durch. Bitte besuchen Sie uns später wieder.',
      },
      { status: 200 }
    )
  }
}
