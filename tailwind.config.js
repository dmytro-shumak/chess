/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "surface-elevated": "0 8px 30px rgba(15, 23, 42, 0.08)",
        "glow-amber": "0 10px 40px -10px rgba(217, 119, 6, 0.55)",
      },
      colors: {
        chess: {
          light: "#f0d9b5",
          dark: "#b58863",
          highlight: "#15803d",
          selected: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
