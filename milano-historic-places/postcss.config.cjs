module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({
      config: './tailwind.config.cjs', // percorso del file Tailwind
    }),
    require('autoprefixer'),
  ],
};