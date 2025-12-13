/**
 * Design System - Vorgefertigte Themes für Restaurant CMS
 * 10 verschiedene Design-Varianten mit individueller Anpassung
 */

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  body: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeFonts {
  heading: string
  body: string
  code: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

export interface ThemeComponents {
  borderRadius: string
  shadow: string
  buttonPadding: string
  cardPadding: string
}

export interface Theme {
  id: string
  name: string
  description: string
  category: string
  colors: ThemeColors
  fonts: ThemeFonts
  spacing: ThemeSpacing
  components: ThemeComponents
  darkMode?: ThemeColors
}

export const predefinedThemes: Theme[] = [
  {
    id: 'classic-elegant',
    name: 'Klassisch-Elegant',
    description: 'Dunkles Rot, Gold, Cremeweiß - perfekt für Fine Dining',
    category: 'Fine Dining',
    colors: {
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
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      buttonPadding: '12px 24px',
      cardPadding: '24px'
    },
    darkMode: {
      primary: '#FF6B6B',
      secondary: '#FFD93D',
      background: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#444444',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'modern-minimalist',
    name: 'Modern-Minimalistisch',
    description: 'Schwarz, Weiß, Grau - zeitlose Eleganz',
    category: 'Contemporary',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#666666',
      border: '#E5E5E5',
      success: '#00C851',
      warning: '#FF8800',
      error: '#FF4444',
      info: '#33B5E5'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto',
      code: 'Fira Code'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '4px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      buttonPadding: '10px 20px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      background: '#121212',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'warm-cozy',
    name: 'Warm-Gemütlich',
    description: 'Braun, Orange, Beige - einladende Bistro-Atmosphäre',
    category: 'Bistro/Café',
    colors: {
      primary: '#8B4513',
      secondary: '#FF8C00',
      background: '#F5F5DC',
      text: '#3E2723',
      textSecondary: '#5D4037',
      border: '#D7CCC8',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Lora',
      body: 'Nunito',
      code: 'Source Code Pro'
    },
    spacing: {
      xs: '6px',
      sm: '12px',
      md: '18px',
      lg: '24px',
      xl: '36px',
      xxl: '48px'
    },
    components: {
      borderRadius: '12px',
      shadow: '0 4px 8px rgba(139, 69, 19, 0.2)',
      buttonPadding: '14px 28px',
      cardPadding: '28px'
    },
    darkMode: {
      primary: '#D2691E',
      secondary: '#FFA500',
      background: '#2C1810',
      text: '#FFF8DC',
      textSecondary: '#D2B48C',
      border: '#8B4513',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'fresh-vital',
    name: 'Frisch-Vital',
    description: 'Grün, Weiß, Mint - für gesunde Küche',
    category: 'Gesundes Essen',
    colors: {
      primary: '#2E7D32',
      secondary: '#4CAF50',
      background: '#F1F8E9',
      text: '#1B5E20',
      textSecondary: '#388E3C',
      border: '#C8E6C9',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Quicksand',
      body: 'Nunito Sans',
      code: 'Monaco'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '16px',
      shadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '24px'
    },
    darkMode: {
      primary: '#66BB6A',
      secondary: '#81C784',
      background: '#1B5E20',
      text: '#E8F5E8',
      textSecondary: '#C8E6C9',
      border: '#4CAF50',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'mediterranean',
    name: 'Mediterran',
    description: 'Blau, Weiß, Terracotta - mediterrane Küche',
    category: 'Italienisch/Griechisch',
    colors: {
      primary: '#1976D2',
      secondary: '#FF5722',
      background: '#FFF3E0',
      text: '#1A237E',
      textSecondary: '#3F51B5',
      border: '#BBDEFB',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Crimson Text',
      body: 'Lato',
      code: 'Consolas'
    },
    spacing: {
      xs: '5px',
      sm: '10px',
      md: '20px',
      lg: '30px',
      xl: '40px',
      xxl: '50px'
    },
    components: {
      borderRadius: '10px',
      shadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
      buttonPadding: '13px 26px',
      cardPadding: '26px'
    },
    darkMode: {
      primary: '#42A5F5',
      secondary: '#FF7043',
      background: '#0D47A1',
      text: '#E3F2FD',
      textSecondary: '#BBDEFB',
      border: '#1976D2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'asian-elegant',
    name: 'Asiatisch-Elegant',
    description: 'Rot, Schwarz, Gold - für Sushi und Thai',
    category: 'Sushi/Thai',
    colors: {
      primary: '#D32F2F',
      secondary: '#FFD700',
      background: '#FAFAFA',
      text: '#212121',
      textSecondary: '#424242',
      border: '#E0E0E0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Noto Sans',
      body: 'Roboto',
      code: 'Roboto Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '6px',
      shadow: '0 3px 6px rgba(211, 47, 47, 0.2)',
      buttonPadding: '11px 22px',
      cardPadding: '22px'
    },
    darkMode: {
      primary: '#F44336',
      secondary: '#FFEB3B',
      background: '#121212',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'rustic-country',
    name: 'Rustikal-Ländlich',
    description: 'Braun, Grün, Gelb - Landgasthof-Atmosphäre',
    category: 'Landgasthof',
    colors: {
      primary: '#5D4037',
      secondary: '#689F38',
      background: '#FFFDE7',
      text: '#3E2723',
      textSecondary: '#5D4037',
      border: '#D7CCC8',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Lora',
      body: 'Nunito',
      code: 'Courier New'
    },
    spacing: {
      xs: '6px',
      sm: '12px',
      md: '18px',
      lg: '24px',
      xl: '36px',
      xxl: '48px'
    },
    components: {
      borderRadius: '14px',
      shadow: '0 4px 8px rgba(93, 64, 55, 0.2)',
      buttonPadding: '14px 28px',
      cardPadding: '28px'
    },
    darkMode: {
      primary: '#8D6E63',
      secondary: '#8BC34A',
      background: '#2C1810',
      text: '#FFF8DC',
      textSecondary: '#D2B48C',
      border: '#5D4037',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'urban-trendy',
    name: 'Urban-Trendy',
    description: 'Lila, Pink, Grau - moderne Hipster-Ästhetik',
    category: 'Hipster/Modern',
    colors: {
      primary: '#7B1FA2',
      secondary: '#E91E63',
      background: '#F3E5F5',
      text: '#4A148C',
      textSecondary: '#7B1FA2',
      border: '#E1BEE7',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Raleway',
      body: 'Work Sans',
      code: 'Inconsolata'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '20px',
      shadow: '0 4px 12px rgba(123, 31, 162, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '24px'
    },
    darkMode: {
      primary: '#BA68C8',
      secondary: '#F06292',
      background: '#1A0E1A',
      text: '#F3E5F5',
      textSecondary: '#E1BEE7',
      border: '#7B1FA2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'family-friendly',
    name: 'Familienfreundlich',
    description: 'Blau, Orange, Gelb - fröhliche Familienatmosphäre',
    category: 'Familienrestaurant',
    colors: {
      primary: '#1976D2',
      secondary: '#FF9800',
      background: '#FFF8E1',
      text: '#0D47A1',
      textSecondary: '#1976D2',
      border: '#BBDEFB',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Quicksand',
      body: 'Nunito Sans',
      code: 'Monaco'
    },
    spacing: {
      xs: '5px',
      sm: '10px',
      md: '20px',
      lg: '30px',
      xl: '40px',
      xxl: '50px'
    },
    components: {
      borderRadius: '18px',
      shadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
      buttonPadding: '13px 26px',
      cardPadding: '26px'
    },
    darkMode: {
      primary: '#42A5F5',
      secondary: '#FFB74D',
      background: '#0D47A1',
      text: '#E3F2FD',
      textSecondary: '#BBDEFB',
      border: '#1976D2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  {
    id: 'luxury-premium',
    name: 'Luxus-Premium',
    description: 'Schwarz, Gold, Silber - High-End Eleganz',
    category: 'High-End',
    colors: {
      primary: '#000000',
      secondary: '#FFD700',
      background: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#666666',
      border: '#E5E5E5',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Inter',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '2px',
      shadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      buttonPadding: '16px 32px',
      cardPadding: '32px'
    },
    darkMode: {
      primary: '#FFFFFF',
      secondary: '#FFD700',
      background: '#000000',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },

  // === NEUE RESTAURANT-TYPEN THEMES ===
  
  // Burger & American
  {
    id: 'burger-american',
    name: 'Burger & American',
    description: 'Bold, funky Design für Burger-Restaurants',
    category: 'Burger & American',
    colors: {
      primary: '#FF5722',
      secondary: '#FFC107',
      background: '#FFF3E0',
      body: '#FFFFFF',
      text: '#212121',
      textSecondary: '#757575',
      border: '#FFCCBC',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Bebas Neue',
      body: 'Oswald',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '12px',
      shadow: '0 6px 12px rgba(255, 87, 34, 0.3)',
      buttonPadding: '14px 28px',
      cardPadding: '24px'
    },
    darkMode: {
      primary: '#FF7043',
      secondary: '#FFD54F',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Asiatisch
  {
    id: 'asian-fusion',
    name: 'Asiatisch & Fusion',
    description: 'Eleganz und Tradition für asiatische Küche',
    category: 'Asiatisch',
    colors: {
      primary: '#E91E63',
      secondary: '#FF9800',
      background: '#FFF8E1',
      body: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#424242',
      border: '#FFE0B2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Noto Sans JP',
      body: 'Noto Sans SC',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '8px',
      shadow: '0 4px 8px rgba(233, 30, 99, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#F06292',
      secondary: '#FFB74D',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Griechisch
  {
    id: 'greek-mediterranean',
    name: 'Griechisch & Mediterran',
    description: 'Warme, mediterrane Farben und klassische Typografie',
    category: 'Griechisch',
    colors: {
      primary: '#3F51B5',
      secondary: '#FF5722',
      background: '#E8F5E8',
      body: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#424242',
      border: '#C8E6C9',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Libre Baskerville',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '6px',
      shadow: '0 4px 6px rgba(63, 81, 181, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#5C6BC0',
      secondary: '#FF7043',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Japanisch
  {
    id: 'japanese-minimalist',
    name: 'Japanisch & Minimalistisch',
    description: 'Minimalistisches Design mit japanischen Einflüssen',
    category: 'Japanisch',
    colors: {
      primary: '#000000',
      secondary: '#F44336',
      background: '#FAFAFA',
      body: '#FFFFFF',
      text: '#212121',
      textSecondary: '#757575',
      border: '#E0E0E0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Noto Sans JP',
      body: 'M PLUS Rounded 1c',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '4px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      buttonPadding: '10px 20px',
      cardPadding: '16px'
    },
    darkMode: {
      primary: '#FFFFFF',
      secondary: '#FF5722',
      background: '#121212',
      body: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Chinesisch
  {
    id: 'chinese-traditional',
    name: 'Chinesisch & Traditionell',
    description: 'Traditionelle chinesische Farben und moderne Typografie',
    category: 'Chinesisch',
    colors: {
      primary: '#D32F2F',
      secondary: '#FFD700',
      background: '#FFFDE7',
      body: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#424242',
      border: '#FFECB3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Noto Sans SC',
      body: 'Source Han Sans SC',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '8px',
      shadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#F44336',
      secondary: '#FFD54F',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Thailändisch
  {
    id: 'thai-spicy',
    name: 'Thailändisch & Scharf',
    description: 'Lebendige, scharfe Farben für thailändische Küche',
    category: 'Thailändisch',
    colors: {
      primary: '#FF5722',
      secondary: '#4CAF50',
      background: '#FFF3E0',
      body: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#424242',
      border: '#FFCCBC',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Noto Sans Thai',
      body: 'Kanit',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '10px',
      shadow: '0 4px 8px rgba(255, 87, 34, 0.3)',
      buttonPadding: '12px 24px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#FF7043',
      secondary: '#66BB6A',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  },

  // Vietnamesisch
  {
    id: 'vietnamese-fresh',
    name: 'Vietnamesisch & Frisch',
    description: 'Frische, helle Farben für vietnamesische Küche',
    category: 'Vietnamesisch',
    colors: {
      primary: '#2E7D32',
      secondary: '#FF5722',
      background: '#F1F8E9',
      body: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#424242',
      border: '#C8E6C9',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    fonts: {
      heading: 'Roboto',
      body: 'Open Sans',
      code: 'JetBrains Mono'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    components: {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(46, 125, 50, 0.2)',
      buttonPadding: '12px 24px',
      cardPadding: '20px'
    },
    darkMode: {
      primary: '#4CAF50',
      secondary: '#FF7043',
      background: '#1A1A1A',
      body: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#424242',
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5'
    }
  }
]

export const getThemeById = (id: string): Theme | undefined => {
  return predefinedThemes.find(theme => theme.id === id)
}

export const getThemesByCategory = (category: string): Theme[] => {
  return predefinedThemes.filter(theme => theme.category === category)
}

export const getAllCategories = (): string[] => {
  return [...new Set(predefinedThemes.map(theme => theme.category))]
}

export const availableFonts = [
  // Standard Fonts
  'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Palatino',
  'Impact', 'Lucida Sans Unicode', 'Courier New', 'Lucida Console', 'Monaco', 'Brush Script MT',
  'Playfair Display', 'Inter', 'Poppins', 'Roboto', 'Lora', 'Nunito', 'Quicksand', 'Crimson Text',
  'Lato', 'Noto Sans', 'Work Sans', 'Raleway', 'Cinzel', 'JetBrains Mono', 'Fira Code', 'Source Code Pro',
  'Nunito Sans', 'Roboto Mono', 'Inconsolata', 'Consolas',
  
  // Restaurant-spezifische Fonts
  // Burger & American
  'Bebas Neue', 'Oswald', 'Anton', 'Fredoka One', 'Righteous', 'Bangers', 'Creepster',
  
  // Asiatisch & Oriental
  'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans TC', 'Noto Sans Thai', 'Noto Sans Devanagari',
  'M PLUS Rounded 1c', 'Kosugi Maru', 'Zen Maru Gothic', 'Zen Kaku Gothic New',
  
  // Griechisch & Mediterran
  'Cinzel', 'Cinzel Decorative', 'Abril Fatface', 'Cormorant Garamond', 'Libre Baskerville',
  'Merriweather', 'PT Serif', 'Source Serif Pro',
  
  // Japanisch
  'Noto Sans JP', 'M PLUS 1p', 'M PLUS Rounded 1c', 'Zen Maru Gothic', 'Zen Kaku Gothic New',
  'Kosugi Maru', 'Sawarabi Mincho', 'Sawarabi Gothic',
  
  // Chinesisch
  'Noto Sans SC', 'Noto Sans TC', 'Noto Sans HK', 'Source Han Sans SC', 'Source Han Sans TC',
  'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
  
  // Thailändisch
  'Noto Sans Thai', 'Sarabun', 'Kanit', 'Prompt', 'Athiti', 'Chakra Petch',
  
  // Vietnamesisch
  'Noto Sans', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Nunito Sans'
]
