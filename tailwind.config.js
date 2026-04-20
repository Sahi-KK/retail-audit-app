/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#0A0F1E",
        gold: "#C9A84C",
        offwhite: "#F4F4F6",
      }
    },
  },
  plugins: [],
}
