/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Le variabili CSS sono ora mappate per essere usate come classi di Tailwind
      // Esempio: `bg-blue` userà `var(--color-blue)`
      colors: {
        // Palette Principale
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        green: "rgb(var(--color-green) / <alpha-value>)",
        yellow: "rgb(var(--color-yellow) / <alpha-value>)",
        "green-variant": "rgb(var(--color-green-variant) / <alpha-value>)",
        "cyan-variant": "rgb(var(--color-cyan-variant) / <alpha-value>)",

        // Sfondi
        background: "rgb(var(--color-background-light) / <alpha-value>)",
        "background-white": "rgb(var(--color-background-white) / <alpha-value>)",
        "background-navbar": "rgb(var(--color-background-navbar) / <alpha-value>)",

        // Testi
        foreground: "rgb(var(--color-text-primary) / <alpha-value>)",
        "foreground-dark-bg": "rgb(var(--color-text-primary-dark-bg) / <alpha-value>)",
        "foreground-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        placeholder: "rgb(var(--color-text-placeholder) / <alpha-value>)",

        // Bordi
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      borderRadius: {
        // Mappatura dei raggi dei bordi personalizzati
        // Esempio: `rounded-sm` userà `var(--radius-sm)`
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};
