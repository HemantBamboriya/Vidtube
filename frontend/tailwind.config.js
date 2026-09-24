/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    colors: { bg: "var(--bg)", surface: "var(--surface)", surface2: "var(--surface-2)", border: "var(--border)", text: "var(--text)", muted: "var(--muted)", brand: "#8B5CF6", danger: "#EF4444", success: "#22C55E", warning: "#F59E0B" },
    borderRadius: { card: "16px", control: "12px" },
    boxShadow: { soft: "0 12px 36px rgba(0,0,0,.18)" },
    transitionDuration: { 180: "180ms" },
    zIndex: { navbar: "40", sidebar: "30", dropdown: "50", modal: "60", toast: "70" }
  } },
  plugins: []
};
