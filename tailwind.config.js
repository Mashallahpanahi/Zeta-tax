/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Define your custom color here
        "blue-firstRate": "rgb(20 60 107 / <alpha-value>)",
        "green-firstRate": "rgb(174 193 57 / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
