import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "6px",
        sm: "6px",
        md: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "12px",
        "3xl": "12px",
      },
      boxShadow: {
        tight: "0 1px 2px rgba(12, 12, 12, 0.06)",
        card: "0 1px 2px rgba(12, 12, 12, 0.06)",
        "card-md": "0 2px 6px rgba(12, 12, 12, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
