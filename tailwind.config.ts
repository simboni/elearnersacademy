import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // eLearners Academy brand palette
        navy: {
          50: "#eef1f7",
          100: "#dbe0e9",
          200: "#b7c1d3",
          300: "#8393ad",
          400: "#4d5e6f",
          500: "#273044",
          600: "#1c2438",
          700: "#12233b",
          800: "#0a1a30",
          900: "#001931",
          950: "#00101f",
        },
        gold: {
          50: "#fdf9ec",
          100: "#f9efcb",
          200: "#f3dd92",
          300: "#edc85b",
          400: "#eab830",
          500: "#d4af37",
          600: "#b8901f",
          700: "#936c1b",
          800: "#7a561d",
          900: "#69481d",
        },
        sky: {
          DEFAULT: "#48a7d4",
          light: "#6fbde0",
          dark: "#2f89b5",
        },
        brand: {
          bg: "#001931",
          surface: "#0a1f3a",
          gold: "#eab830",
          blue: "#48a7d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,25,49,0.08), 0 8px 24px -8px rgba(0,25,49,0.12)",
        "card-hover": "0 4px 12px rgba(0,25,49,0.12), 0 16px 40px -12px rgba(0,25,49,0.2)",
        gold: "0 8px 24px -6px rgba(234,184,48,0.45)",
        glow: "0 0 0 1px rgba(72,167,212,0.2), 0 8px 30px -8px rgba(72,167,212,0.3)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 20% 20%, rgba(72,167,212,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(234,184,48,0.10), transparent 45%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.5s infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
