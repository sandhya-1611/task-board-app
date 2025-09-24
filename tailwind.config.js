/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  extend: {
    colors: {
      brand: {
        primary: '#4F46E5',
        secondary: '#6366F1',
        accent: '#EEF2FF',
      },
    },
  },
}
,
  plugins: [],
}