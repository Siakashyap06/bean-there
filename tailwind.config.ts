import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF6F1",
          50: "#FDFBF8",
          100: "#FAF6F1",
          200: "#F2EAE0",
          300: "#E8DDD0",
        },
        stone: {
          DEFAULT: "#E8E0D5",
          50: "#F5F1EC",
          100: "#E8E0D5",
          200: "#D4C9BB",
          300: "#BFB0A0",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          50: "#F5F5F5",
          100: "#EBEBEB",
          200: "#CCCCCC",
          300: "#999999",
          400: "#666666",
          500: "#333333",
          600: "#1A1A1A",
          700: "#0D0D0D",
        },
        espresso: {
          DEFAULT: "#2C1810",
          light: "#4A2C1E",
          dark: "#1A0E09",
        },
        olive: {
          DEFAULT: "#8B8B6B",
          light: "#A8A887",
          dark: "#6E6E54",
        },
        copper: {
          DEFAULT: "#C4845C",
          light: "#D4A07A",
          dark: "#A86840",
        },
        clay: {
          DEFAULT: "#B8906A",
          light: "#CDAC8A",
          dark: "#9A7450",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 4s ease-in-out infinite",
        "float-fast": "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "constellation-draw": "constellation-draw 2s ease-out forwards",
        "stamp-reveal": "stamp-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "constellation-draw": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "stamp-reveal": {
          from: { opacity: "0", transform: "scale(0) rotate(-10deg)" },
          to: { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
      },
      boxShadow: {
        "premium": "0 2px 40px rgba(44, 24, 16, 0.08)",
        "premium-lg": "0 8px 60px rgba(44, 24, 16, 0.12)",
        "card": "0 1px 8px rgba(26, 26, 26, 0.06), 0 4px 24px rgba(26, 26, 26, 0.04)",
        "card-hover": "0 4px 20px rgba(26, 26, 26, 0.1), 0 16px 48px rgba(26, 26, 26, 0.08)",
        "stamp": "0 4px 24px rgba(44, 24, 16, 0.2)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
