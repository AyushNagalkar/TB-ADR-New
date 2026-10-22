import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        alert: 'var(--alert)',
        critical: 'var(--critical)',
        line: 'var(--line)',
      },
      fontFamily: {
        heading: ['"Source Serif 4"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
