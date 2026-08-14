/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};

/*
 * No colour extension is needed. The gold (#D4AF37) and silver (#C9CDD4)
 * accents are expressed as Tailwind arbitrary values inside the component,
 * which keeps GoldCorridorPlatform.jsx portable between projects.
 */
