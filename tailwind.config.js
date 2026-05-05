/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0d',
        'bg-secondary': '#141414',
        'bg-card': '#1a1a1a',
        gold: '#c9a96e',
        'gold-light': '#e8d5a3',
        'text-primary': '#f5f0e8',
        'text-secondary': '#8a8070',
        'text-muted': '#4a4540',
        'border-subtle': 'rgba(201, 169, 110, 0.15)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
