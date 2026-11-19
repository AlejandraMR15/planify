/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0E0E0E', 800: '#151515', 700: '#1C1C1C', 600: '#262626' },
        cream: { DEFAULT: '#F9F6EE', 200: '#F4EFEA', 300: '#ECE5D8', 400: '#DDD2BF' },
        gold: { DEFAULT: '#8C6633', light: '#96723B', soft: '#C9A46A' },
        coal: '#1A1A1A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-up': 'slideUp .25s ease-out',
      },
    },
  },
  plugins: [],
};
