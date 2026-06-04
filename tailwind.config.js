/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#2E2E2E',
          850: '#222222',
          900: '#1A1A1A',
          950: '#121212',
        },
        synaptica: {
          dark: '#1A1A1A', // Plomo metálico puro
          darker: '#121212', // Plomo carbón oscuro puro
          card: 'rgba(26, 26, 26, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10B981', // green emerald
          primary: '#6366F1', // indigo
          secondary: '#8B5CF6', // purple
          text: '#F3F4F6',
          muted: '#A3A3A3',
          green: '#AAF6AB', // Pastel green from logo
          blue: '#7ED4FD', // Pastel blue from logo
          purple: '#A98EFA', // Pastel purple from logo
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
