/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        water: {
          50: "#eef7fb",
          100: "#d7edf5",
          200: "#b3dcec",
          300: "#84c5df",
          400: "#4fa6cc",
          500: "#2f8ab4",
          600: "#246e96",
          700: "#1f597a",
          800: "#1e4a65",
          900: "#1c3f56",
        },
        blush: {
          50: "#fdf3f4",
          100: "#fbe4e7",
          200: "#f6cbd1",
          300: "#eea3ad",
          400: "#e2798a",
        },
      },
    },
  },
  plugins: [],
};
