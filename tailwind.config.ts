import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bce7ff",
          300: "#8cd9ff",
          400: "#55c6ff",
          500: "#25acf5",
          600: "#0a8cd6",
          700: "#066fa9",
          800: "#0b5b88",
          900: "#0f4b70",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0,0,0,0.06), 0 1px 3px 1px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
