/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0A0F1E',
        'brand-gold': '#C9A84C',
      },
    },
  },
  plugins: [],
}
