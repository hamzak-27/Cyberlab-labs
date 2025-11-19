/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // we'll toggle .dark on <html> or root
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff0000', // main red
        },
        cyber: {
          // light/dark mode surfaces
          lightBg: '#ffffff',
          lightText: '#000000',
          lightSurface: '#f8fafc',
          darkBg: '#004526',
          darkSurface: '#006633',
          darkHighlight: '#00ff88',
        },
        midnight: '#0f172a', // icons in light mode
      },
      boxShadow: {
        glow: '0 8px 24px rgba(255,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],

}
