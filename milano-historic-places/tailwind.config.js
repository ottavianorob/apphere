/** @type {import('tailwindcss').Config} */
module.exports = {
  // indica a Tailwind dove cercare le classi da generare
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class', // Abilita dark mode via classe
  theme: {
    extend: {
      colors: {
        'newspaper-bg': '#f9f6f1', // avorio caldo
        'text-primary': '#231f20', // quasi nero
        'text-secondary': '#6e6259', // grigio caldo
        'accent-bordeaux': '#7c2f35',
        'accent-gold': '#bfa76f',
        'accent-brown': '#8d6748',
        'neutral-light': '#ede6dd',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Merriweather', 'serif'],
        body: ['Lora', 'Source Sans Pro', 'serif'],
      },
    },
  },
  plugins: [],
};