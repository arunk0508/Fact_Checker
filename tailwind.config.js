/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:      '#0D1B3E',
        teal:      '#00B4D8',
        'teal-dark': '#02779A',
        gold:      '#F5A623',
        verdant:   '#22C55E',
        danger:    '#EF4444',
        amber:     '#F59E0B',
        surface:   '#F0F4F8',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
