/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1DB954',
          dark: '#1aa34a',
          light: '#1ed760',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          lighter: '#121212',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
        gray: {
          400: '#b3b3b3',
          500: '#888888',
          600: '#666666',
        }
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}