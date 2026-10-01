import type { Config } from "tailwindcss";

// The slate greys read their colour from CSS variables (see globals.css),
// so the whole UI switches between light and dark just by toggling the "dark" class on <html>.
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const slate = Object.fromEntries(shades.map((s) => [s, `rgb(var(--slate-${s}) / <alpha-value>)`]));

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { slate },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
