/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#FFCD00',
          black: '#111111',
          slate: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}
