import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '1400px',
      },
      colors: {
        primary: '#D60000',
        'primary-dark': '#b50000',
        secondary: '#06880c',
        'secondary-dark': '#056a09',
        red: {
          50: '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff9090',
          400: '#ff5050',
          500: '#e81010',
          600: '#D60000',
          700: '#b50000',
          800: '#930000',
          900: '#7a0000',
          950: '#430000',
        },
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-33.333%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        // Sehr ruhiges Scrollen (Gerichte-Carousel)
        'scroll-left': 'scroll-left 500s linear infinite',
        'scroll-right': 'scroll-right 500s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
