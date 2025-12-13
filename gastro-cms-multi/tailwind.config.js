/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand (Emerald)
        brand: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Primär
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        accent: {
          amber:  "#f59e0b", // Callouts (Deal/Neu)
          rose:   "#f43f5e", // Warnung/Fehler
          sky:    "#0ea5e9", // Info/Hinweis
        },
        surface: {
          DEFAULT: "#ffffff",
          muted:   "#f6f7f8",
          dark:    "#0b1220", // Dark BG
          card:    "#ffffff",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 6px 24px rgba(2, 6, 23, 0.08)",
        "card-strong": "0 12px 28px rgba(2, 6, 23, 0.14)",
        focus: "0 0 0 4px rgba(16,185,129,0.25)",
      },
      spacing: {
        "1.5": "0.375rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        screen: "1140px",
        prose: "72ch",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
}

