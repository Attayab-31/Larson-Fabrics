import type { Config } from "tailwindcss";

/**
 * Larson Fabrics — Tailwind theme extension.
 * Tailwind v4 reads brand tokens from @theme in globals.css;
 * this file documents the design system and supports tooling.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#082567",
          dark: "#0A1F5C",
          mid: "#1A3A8F",
        },
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#8B7536",
        },
        ivory: "#F5F3EE",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["DM Sans", "sans-serif"],
        numbers: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
