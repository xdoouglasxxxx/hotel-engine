import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#eef7f8', 100: '#d5ecef', 200: '#aed9e0', 300: '#79bec9',
          400: '#3f9aab', 500: '#257d90', 600: '#1f6577', 700: '#1e5262',
          800: '#1f4552', 900: '#0f2e38', 950: '#081e26',
        },
        sand: {
          50: '#fbf8f1', 100: '#f5eede', 200: '#eaddc0', 300: '#dcc59a',
          400: '#cda872', 500: '#c29255', 600: '#b47e49', 700: '#96653e',
          800: '#7a5338', 900: '#634430',
        },
        coral: {
          400: '#f2825f', 500: '#e96a44', 600: '#d9512c', 700: '#b53f22',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up .6s ease-out both',
        'spin-slow': 'spin-slow 90s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
