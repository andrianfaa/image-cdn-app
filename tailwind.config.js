/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        ...colors,
        primary: "#BAFF00",
      }),
    },
  },
  plugins: [],
};
