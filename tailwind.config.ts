import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        charcoal: "var(--charcoal)",
        "charcoal-soft": "var(--charcoal-soft)",
        "navy-deep": "var(--navy-deep)",
        cream: "var(--cream)",
        "cream-dark": "var(--cream-dark)",
        surface: "var(--surface)",
        line: "var(--line)",
        "line-dark": "var(--line-dark)",
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["Gopadel", ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        refined: "-0.01em",
      },
      borderRadius: {
        DEFAULT: "var(--radius-sm)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-lg)",
        "3xl": "var(--radius-lg)",
      },
      boxShadow: {
        tight: "var(--shadow-tight)",
        card: "var(--shadow-card)",
        "card-md": "0 2px 6px rgba(21, 42, 71, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
