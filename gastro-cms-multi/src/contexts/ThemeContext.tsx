'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeColors, ThemeFonts, ThemeSpacing, ThemeComponents } from '@/lib/themes'

interface ThemeContextType {
  // Current theme data
  selectedTheme: string
  themeData: Theme | null
  customColors: ThemeColors | null
  customFonts: ThemeFonts | null
  customSpacing: ThemeSpacing | null
  customComponents: ThemeComponents | null
  darkModeEnabled: boolean
  darkModeColors: ThemeColors | null
  
  // Available themes
  availableThemes: Theme[]
  
  // Actions
  updateTheme: (themeId: string) => Promise<void>
  updateCustomColors: (colors: ThemeColors) => Promise<void>
  updateCustomFonts: (fonts: ThemeFonts) => Promise<void>
  updateCustomSpacing: (spacing: ThemeSpacing) => Promise<void>
  updateCustomComponents: (components: ThemeComponents) => Promise<void>
  toggleDarkMode: (enabled: boolean) => Promise<void>
  updateDarkModeColors: (colors: ThemeColors) => Promise<void>
  resetToTheme: (themeId: string) => Promise<void>
  
  // Computed values
  currentColors: ThemeColors
  currentFonts: ThemeFonts
  currentSpacing: ThemeSpacing
  currentComponents: ThemeComponents
  
  // Loading state
  loading: boolean
  error: string | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('classic-elegant')
  const [themeData, setThemeData] = useState<Theme | null>(null)
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null)
  const [customFonts, setCustomFonts] = useState<ThemeFonts | null>(null)
  const [customSpacing, setCustomSpacing] = useState<ThemeSpacing | null>(null)
  const [customComponents, setCustomComponents] = useState<ThemeComponents | null>(null)
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false)
  const [darkModeColors, setDarkModeColors] = useState<ThemeColors | null>(null)
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

  // Computed values with fallbacks
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

  // Debug: Log current values (removed for production)

  // Load theme settings on mount
  useEffect(() => {
    loadThemeSettings()
  }, [])

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    applyThemeToCSS()
  }, [currentColors, currentFonts, currentSpacing, currentComponents, darkModeEnabled])

  const loadThemeSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings/theme')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      setSelectedTheme(data.selectedTheme)
      setThemeData(data.themeData)
      setCustomColors(data.customColors)
      setCustomFonts(data.customFonts)
      setCustomSpacing(data.customSpacing)
      setCustomComponents(data.customComponents)
      setDarkModeEnabled(data.darkModeEnabled)
      setDarkModeColors(data.darkModeColors)
      setAvailableThemes(data.availableThemes)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to load theme settings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Font mapping function - Maps font names to actual font families
  const mapFontToCSSVariable = (fontName: string): string => {
    const fontMap: { [key: string]: string } = {
      // Standard Fonts
      'Inter': 'var(--font-inter), Inter, sans-serif',
      'Playfair Display': 'var(--font-playfair-display), "Playfair Display", serif',
      'JetBrains Mono': 'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
      'Poppins': 'var(--font-poppins), Poppins, sans-serif',
      'Roboto': 'var(--font-roboto), Roboto, sans-serif',
      'Lora': 'var(--font-lora), Lora, serif',
      'Nunito': 'var(--font-nunito), Nunito, sans-serif',
      'Quicksand': 'var(--font-quicksand), Quicksand, sans-serif',
      'Crimson Text': 'var(--font-crimson-text), "Crimson Text", serif',
      'Lato': 'var(--font-lato), Lato, sans-serif',
      'Noto Sans': 'var(--font-noto-sans), "Noto Sans", sans-serif',
      'Work Sans': 'var(--font-work-sans), "Work Sans", sans-serif',
      'Raleway': 'var(--font-raleway), Raleway, sans-serif',
      'Cinzel': 'var(--font-cinzel), Cinzel, serif',
      'Fira Code': 'var(--font-fira-code), "Fira Code", monospace',
      'Source Code Pro': 'var(--font-source-code-pro), "Source Code Pro", monospace',
      'Nunito Sans': 'var(--font-nunito-sans), "Nunito Sans", sans-serif',
      'Roboto Mono': 'var(--font-roboto-mono), "Roboto Mono", monospace',
      'Inconsolata': 'var(--font-inconsolata), Inconsolata, monospace',
      
      // Restaurant-spezifische Fonts
      // Burger & American
      'Bebas Neue': 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
      'Oswald': 'var(--font-oswald), Oswald, sans-serif',
      'Anton': 'var(--font-anton), Anton, sans-serif',
      'Fredoka One': 'var(--font-fredoka-one), "Fredoka One", cursive',
      'Righteous': 'var(--font-righteous), Righteous, cursive',
      'Bangers': 'var(--font-bangers), Bangers, cursive',
      'Creepster': 'var(--font-creepster), Creepster, cursive',
      
      // Asiatisch & Oriental
      'Noto Sans JP': 'var(--font-noto-sans-jp), "Noto Sans JP", sans-serif',
      'Noto Sans KR': 'var(--font-noto-sans-kr), "Noto Sans KR", sans-serif',
      'Noto Sans SC': 'var(--font-noto-sans-sc), "Noto Sans SC", sans-serif',
      'Noto Sans TC': 'var(--font-noto-sans-tc), "Noto Sans TC", sans-serif',
      'Noto Sans Thai': 'var(--font-noto-sans-thai), "Noto Sans Thai", sans-serif',
      'Noto Sans Devanagari': 'var(--font-noto-sans-devanagari), "Noto Sans Devanagari", sans-serif',
      'M PLUS Rounded 1c': 'var(--font-m-plus-rounded-1c), "M PLUS Rounded 1c", sans-serif',
      'Kosugi Maru': 'var(--font-kosugi-maru), "Kosugi Maru", sans-serif',
      'Zen Maru Gothic': 'var(--font-zen-maru-gothic), "Zen Maru Gothic", sans-serif',
      'Zen Kaku Gothic New': 'var(--font-zen-kaku-gothic-new), "Zen Kaku Gothic New", sans-serif',
      
      // Griechisch & Mediterran
      'Cinzel Decorative': 'var(--font-cinzel-decorative), "Cinzel Decorative", serif',
      'Abril Fatface': 'var(--font-abril-fatface), "Abril Fatface", serif',
      'Cormorant Garamond': 'var(--font-cormorant-garamond), "Cormorant Garamond", serif',
      'Libre Baskerville': 'var(--font-libre-baskerville), "Libre Baskerville", serif',
      'Merriweather': 'var(--font-merriweather), Merriweather, serif',
      'PT Serif': 'var(--font-pt-serif), "PT Serif", serif',
      'Source Serif Pro': 'var(--font-source-serif-pro), "Source Serif Pro", serif',
      
      // Japanisch
      'M PLUS 1p': 'var(--font-m-plus-1p), "M PLUS 1p", sans-serif',
      'Sawarabi Mincho': 'var(--font-sawarabi-mincho), "Sawarabi Mincho", serif',
      'Sawarabi Gothic': 'var(--font-sawarabi-gothic), "Sawarabi Gothic", sans-serif',
      
      // Chinesisch
      'Source Han Sans SC': 'var(--font-source-han-sans-sc), "Source Han Sans SC", sans-serif',
      'Source Han Sans TC': 'var(--font-source-han-sans-tc), "Source Han Sans TC", sans-serif',
      'PingFang SC': 'PingFang SC, "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      'Hiragino Sans GB': 'Hiragino Sans GB, "PingFang SC", "Microsoft YaHei", sans-serif',
      'Microsoft YaHei': 'Microsoft YaHei, "PingFang SC", "Hiragino Sans GB", sans-serif',
      
      // Thailändisch
      'Sarabun': 'var(--font-sarabun), Sarabun, sans-serif',
      'Kanit': 'var(--font-kanit), Kanit, sans-serif',
      'Prompt': 'var(--font-prompt), Prompt, sans-serif',
      'Athiti': 'var(--font-athiti), Athiti, sans-serif',
      'Chakra Petch': 'var(--font-chakra-petch), "Chakra Petch", sans-serif',
      
      // Vietnamesisch
      'Open Sans': 'var(--font-open-sans), "Open Sans", sans-serif',
      'Source Sans Pro': 'var(--font-source-sans-pro), "Source Sans Pro", sans-serif',
      
      // Fallback Fonts
      'Arial': 'Arial, sans-serif',
      'Verdana': 'Verdana, sans-serif',
      'Helvetica': 'Helvetica, sans-serif',
      'Tahoma': 'Tahoma, sans-serif',
      'Trebuchet MS': '"Trebuchet MS", sans-serif',
      'Georgia': 'Georgia, serif',
      'Times New Roman': '"Times New Roman", serif',
      'Palatino': 'Palatino, serif',
      'Impact': 'Impact, sans-serif',
      'Lucida Sans Unicode': '"Lucida Sans Unicode", sans-serif',
      'Courier New': '"Courier New", monospace',
      'Lucida Console': '"Lucida Console", monospace',
      'Monaco': 'Monaco, monospace',
      'Brush Script MT': '"Brush Script MT", cursive',
      'Consolas': 'Consolas, monospace'
    }
    
    return fontMap[fontName] || `${fontName}, sans-serif`
  }

  const applyThemeToCSS = () => {
    const root = document.documentElement
    
    // Apply colors
    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Apply fonts with proper mapping
    Object.entries(currentFonts).forEach(([key, value]) => {
      const mappedFont = mapFontToCSSVariable(value as string)
      root.style.setProperty(`--font-${key}`, mappedFont)
    })
    
    // Apply spacing
    Object.entries(currentSpacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })
    
    // Apply components
    Object.entries(currentComponents).forEach(([key, value]) => {
      root.style.setProperty(`--component-${key}`, value)
    })
    
    // Apply dark mode class
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Debug: Log applied CSS variables (removed for production)
  }

  const updateTheme = async (themeId: string) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme: themeId,
          customColors,
          customFonts,
          customSpacing,
          customComponents,
          darkModeEnabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSelectedTheme(themeId)
      
      // Update theme data
      const newThemeData = availableThemes.find(theme => theme.id === themeId)
      setThemeData(newThemeData || null)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update theme:', err)
    }
  }

  const updateCustomColors = async (colors: ThemeColors) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors: colors,
          customFonts,
          customSpacing,
          customComponents,
          darkModeEnabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCustomColors(colors)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update custom colors:', err)
    }
  }

  const updateCustomFonts = async (fonts: ThemeFonts) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors,
          customFonts: fonts,
          customSpacing,
          customComponents,
          darkModeEnabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCustomFonts(fonts)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update custom fonts:', err)
    }
  }

  const updateCustomSpacing = async (spacing: ThemeSpacing) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors,
          customFonts,
          customSpacing: spacing,
          customComponents,
          darkModeEnabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCustomSpacing(spacing)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update custom spacing:', err)
    }
  }

  const updateCustomComponents = async (components: ThemeComponents) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors,
          customFonts,
          customSpacing,
          customComponents: components,
          darkModeEnabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCustomComponents(components)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update custom components:', err)
    }
  }

  const toggleDarkMode = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors,
          customFonts,
          customSpacing,
          customComponents,
          darkModeEnabled: enabled,
          darkModeColors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setDarkModeEnabled(enabled)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to toggle dark mode:', err)
    }
  }

  const updateDarkModeColors = async (colors: ThemeColors) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme,
          customColors,
          customFonts,
          customSpacing,
          customComponents,
          darkModeEnabled,
          darkModeColors: colors
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setDarkModeColors(colors)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to update dark mode colors:', err)
    }
  }

  const resetToTheme = async (themeId: string) => {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTheme: themeId,
          customColors: null,
          customFonts: null,
          customSpacing: null,
          customComponents: null,
          darkModeEnabled: false,
          darkModeColors: null
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setSelectedTheme(themeId)
      setCustomColors(null)
      setCustomFonts(null)
      setCustomSpacing(null)
      setCustomComponents(null)
      setDarkModeEnabled(false)
      setDarkModeColors(null)
      
      // Update theme data
      const newThemeData = availableThemes.find(theme => theme.id === themeId)
      setThemeData(newThemeData || null)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to reset theme:', err)
    }
  }

  const value: ThemeContextType = {
    selectedTheme,
    themeData,
    customColors,
    customFonts,
    customSpacing,
    customComponents,
    darkModeEnabled,
    darkModeColors,
    availableThemes,
    updateTheme,
    updateCustomColors,
    updateCustomFonts,
    updateCustomSpacing,
    updateCustomComponents,
    toggleDarkMode,
    updateDarkModeColors,
    resetToTheme,
    currentColors,
    currentFonts,
    currentSpacing,
    currentComponents,
    loading,
    error
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
