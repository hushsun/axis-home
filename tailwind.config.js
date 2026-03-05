/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 检查这一行是否包含 jsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}