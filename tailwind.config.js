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
        dashboard: {
          bg: '#F6FBF6',
          surface: '#FFFFFF',
          primary: '#5FAE6E',
          'primary-dark': '#2F6B3E',
          'primary-soft': '#DDEEDD',
          border: '#D7E8D7',
          'border-soft': '#DCECDC',
          'text-primary': '#1F2A1F',
          'text-secondary': '#667368',
          muted: '#8A968B',
          success: '#3FAE5A',
          danger: '#D96C6C',
          highlight: '#EDF7ED',
          'icon-soft': '#EEF8EE'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        luckiest: ['Inter', 'sans-serif'],
        brand: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'dashboard-sm': '12px',
        'dashboard-md': '14px',
        'dashboard-lg': '16px',
        'dashboard-xl': '20px',
        'dashboard-pill': '999px'
      },
      boxShadow: {
        'dashboard-soft': '0 8px 24px rgba(31,42,31,0.05)',
        'dashboard-card': '0 10px 30px rgba(31,42,31,0.05)'
      }
    },
  },
  plugins: [],
}
