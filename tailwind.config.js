/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#F59E0B',
          brown: '#92400E',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
