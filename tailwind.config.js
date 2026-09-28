/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lilly-inspired palette
        lilly: {
          red: "#D52B1E",
          redDark: "#A62018",
          redLight: "#FDECEA",
          navy: "#1B2A4E",
          navyDark: "#0F1A33",
          navyLight: "#2A3B66",
          grey: "#4A4A4A",
          ink: "#1A1A1A",
          mist: "#F5F7FA",
          line: "#E5E8EE",
          accent: "#0073AB",
          green: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 26, 51, 0.06), 0 4px 16px rgba(15, 26, 51, 0.04)",
        cardHover: "0 4px 12px rgba(15, 26, 51, 0.10), 0 8px 24px rgba(15, 26, 51, 0.06)",
      },
    },
  },
  plugins: [],
};
