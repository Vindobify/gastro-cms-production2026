import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { predefinedThemes, getThemeById } from '@/lib/themes'

export async function GET(request: NextRequest) {
  try {
    // Get current theme settings
    const settings = await prisma.restaurantSettings.findFirst()
    
    const currentTheme = settings?.selectedTheme || 'classic-elegant'
    const themeData = getThemeById(currentTheme)
    
    // Compute current values with fallbacks
    const customColors = (settings as any)?.customColors || null
    const customFonts = (settings as any)?.customFonts || null
    const customSpacing = (settings as any)?.customSpacing || null
    const customComponents = (settings as any)?.customComponents || null
    const darkModeEnabled = (settings as any)?.darkModeEnabled || false
    const darkModeColors = (settings as any)?.darkModeColors || null
    
    // Default fallback values
    const defaultColors = {
      primary: '#8B0000',
      secondary: '#DAA520',
      background: '#FFF8DC',
      body: '#FFFFFF',
      text: '#2C1810',
      textSecondary: '#6B4423',
      border: '#D2B48C',
      success: '#228B22',
      warning: '#FF8C00',
      error: '#DC143C',
      info: '#4169E1'
    }

    const defaultFonts = {
      heading: 'Playfair Display',
      body: 'Inter',
      code: 'JetBrains Mono'
    }

    const defaultSpacing = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    }

    const defaultComponents = {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      buttonPadding: '12px 24px',
      cardPadding: '24px'
    }
    
    // Compute current values
    const currentColors = darkModeEnabled && darkModeColors 
      ? { 
          ...defaultColors,
          ...(themeData?.colors || {}), 
          ...(darkModeColors || {})
        }
      : { 
          ...defaultColors,
          ...(themeData?.colors || {}), 
          ...(customColors || {})
        }

    const currentFonts = { 
      ...defaultFonts,
      ...(themeData?.fonts || {}), 
      ...(customFonts || {})
    }

    const currentSpacing = { 
      ...defaultSpacing,
      ...(themeData?.spacing || {}), 
      ...(customSpacing || {})
    }

    const currentComponents = { 
      ...defaultComponents,
      ...(themeData?.components || {}), 
      ...(customComponents || {})
    }
    
    return NextResponse.json({
      selectedTheme: currentTheme,
      themeData: themeData,
      customColors: customColors,
      customFonts: customFonts,
      customSpacing: customSpacing,
      customComponents: customComponents,
      darkModeEnabled: darkModeEnabled,
      darkModeColors: darkModeColors,
      currentColors: currentColors,
      currentFonts: currentFonts,
      currentSpacing: currentSpacing,
      currentComponents: currentComponents,
      availableThemes: predefinedThemes
    })

  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Theme-Einstellungen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      selectedTheme, 
      customColors, 
      customFonts, 
      customSpacing, 
      customComponents,
      darkModeEnabled,
      darkModeColors 
    } = body

    // Validate theme exists
    if (selectedTheme && !getThemeById(selectedTheme)) {
      return NextResponse.json(
        { error: 'Ungültiges Theme ausgewählt' },
        { status: 400 }
      )
    }

    // Update or create settings
    const settings = await prisma.restaurantSettings.upsert({
      where: { id: 1 },
      update: {
        selectedTheme: selectedTheme || 'classic-elegant',
        customColors: customColors || null,
        customFonts: customFonts || null,
        customSpacing: customSpacing || null,
        customComponents: customComponents || null,
        darkModeEnabled: darkModeEnabled || false,
        darkModeColors: darkModeColors || null,
      } as any,
      create: {
        restaurantName: 'Restaurant', // Default value for new settings
        selectedTheme: selectedTheme || 'classic-elegant',
        customColors: customColors || null,
        customFonts: customFonts || null,
        customSpacing: customSpacing || null,
        customComponents: customComponents || null,
        darkModeEnabled: darkModeEnabled || false,
        darkModeColors: darkModeColors || null,
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: 'Theme-Einstellungen erfolgreich gespeichert',
      settings: {
        selectedTheme: (settings as any).selectedTheme,
        customColors: (settings as any).customColors,
        customFonts: (settings as any).customFonts,
        customSpacing: (settings as any).customSpacing,
        customComponents: (settings as any).customComponents,
        darkModeEnabled: (settings as any).darkModeEnabled,
        darkModeColors: (settings as any).darkModeColors,
      }
    })

  } catch (error) {
    console.error('Error updating theme settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Theme-Einstellungen' },
      { status: 500 }
    )
  }
}
