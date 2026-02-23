/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override indigo with the new brand color #2a42a6
        indigo: {
          50: '#eff1fa',
          100: '#e0e4f5',
          200: '#c2c9eb',
          300: '#a3ade0',
          400: '#8592d6',
          500: '#4b61bf', // Lighter than brand
          600: '#2a42a6', // The requested primary color (Brand)
          700: '#233584', // Darker shade for hover
          800: '#1e2b69', // Even darker
          900: '#1a2352', // Darkest
          950: '#0f1330',
        },
      },
    },
  },
  plugins: [],
}
