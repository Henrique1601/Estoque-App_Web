/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        kraft: 'rgb(var(--kraft-rgb) / <alpha-value>)',
        'kraft-dark': 'rgb(var(--kraft-dark-rgb) / <alpha-value>)',
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        stamp: 'rgb(var(--stamp-rgb) / <alpha-value>)',
        twine: 'rgb(var(--twine-rgb) / <alpha-value>)',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
