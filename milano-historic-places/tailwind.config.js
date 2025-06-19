/** @type {import('tailwindcss').Config} */
module.exports = {
  // indica a Tailwind dove cercare le classi da generare
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#faf3e0',
        'text-primary': '#333333',
        'text-secondary': '#555555',
        'accent-brown': '#a67c52',
        'accent-blue': '#1a2634',
        'neutral-light': '#e0dcd5',
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
};