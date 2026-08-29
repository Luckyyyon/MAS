/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep zinc black (matte)
        foreground: "#f4f4f5", // Zinc 100
        card: {
          DEFAULT: "#0f0f11",
          foreground: "#f4f4f5",
          hover: "#141418"
        },
        popover: {
          DEFAULT: "#0f0f11",
          foreground: "#f4f4f5",
        },
        primary: {
          DEFAULT: "#fafafa",
          foreground: "#09090b",
        },
        secondary: {
          DEFAULT: "#18181b",
          foreground: "#fafafa",
        },
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#27272a",
          foreground: "#fafafa",
        },
        destructive: {
          DEFAULT: "#7f1d1d",
          foreground: "#fca5a5",
        },
        border: "#27272a",
        input: "#18181b",
        ring: "#d4d4d8",
        agent: {
          supervisor: "#a855f7",
          security: "#ef4444",
          performance: "#3b82f6",
          syntax: "#10b981",
        }
      },
      borderRadius: {
        lg: "6px",
        md: "4px",
        sm: "2px",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
}
