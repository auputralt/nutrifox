import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#f5f3ee",
          subtle: "#ebe8e0",
        },
        surface: "#ffffff",
        accent: {
          DEFAULT: "#2d5a3d",
          soft: "#dceee3",
          glow: "#4a8c62",
        },
        txt: {
          DEFAULT: "#1c1c1c",
          secondary: "#5a5a5a",
          muted: "#8a8a82",
        },
        protein: "#e07a5f",
        carbs: "#e6a23c",
        fat: "#5b8fb9",
        fiber: "#6b9e78",
        danger: "#b83b3b",
        "danger-soft": "#fde8e8",
        warning: "#b87b3b",
        "warning-soft": "#fef3e2",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        pulse: "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
