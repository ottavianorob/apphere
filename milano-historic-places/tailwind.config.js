/** @type {import('tailwindcss').Config} */
module.exports = {
  // indica a Tailwind dove cercare le classi da generare
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // qui puoi aggiungere colori, font, spacing personalizzati
    },
  },
  plugins: [],
};