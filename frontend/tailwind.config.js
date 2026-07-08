/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        kraft: '#E4DCC8',
        'kraft-dark': '#C9BD9E',
        paper: '#FBF9F3',
        ink: '#1F2A24',
        stamp: '#B23A2E',
        twine: '#8B7355',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
