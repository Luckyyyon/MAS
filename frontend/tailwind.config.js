/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#fbfbfd",
        surface: {
          DEFAULT: "#f5f5f7",
          elevated: "#ffffff",
          subtle: "#f2f2f4",
          card: "#ffffff",
        },
        ink: {
          primary: "#1d1d1f",
          secondary: "#86868b",
          tertiary: "#6e6e73",
          quaternary: "#a1a1a6",
          inverse: "#ffffff",
        },
        accent: {
          DEFAULT: "#0071e3",
          hover: "#0077ed",
          subtle: "#e8f2fc",
          foreground: "#ffffff",
        },
        border: {
          DEFAULT: "#d2d2d7",
          subtle: "#e5e5ea",
          strong: "#a1a1a6",
        },
        agent: {
          supervisor: "#48484a",
          security: "#c93b2b",
          performance: "#0071e3",
          syntax: "#2e7d32",
        },
        status: {
          success: "#2e7d32",
          warning: "#b25e02",
          error: "#c93b2b",
          info: "#0071e3",
        }
      },
      borderRadius: {
        xl: "14px",
        lg: "10px",
        md: "8px",
        sm: "6px",
        xs: "4px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          '"Consolas"',
          '"Liberation Mono"',
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        card: "0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        elevated: "0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
      }
    },
  },
  plugins: [],
}
