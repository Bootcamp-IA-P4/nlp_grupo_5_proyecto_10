/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        fintech: {
          primary: "#1f2937",
          secondary: "#374151",
          accent: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
