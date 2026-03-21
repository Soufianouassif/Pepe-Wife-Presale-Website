/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pepe-green': '#4ade80',
        'pepe-pink': '#ec4899',
        'pepe-yellow': '#facc15',
        'pepe-black': '#0a0a0a',
        'pepe-dark-gray': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
