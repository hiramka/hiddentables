/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF5A3C",
        primaryDark: "#E64A2E",
        accent: "#FFC857",
        surface: "#FFFFFF",
        background: "#F9FAFB",
        muted: "#6B7280"
      },
      borderRadius: {
        card: "12px",
        button: "8px"
      }
    }
  },
  plugins: []
};