/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#07070d',
          900: '#0d0d16',
          800: '#13131e',
          700: '#1a1a28',
          600: '#222235',
          500: '#2e2e45',
          400: '#3d3d5c',
          300: '#5a5a7a',
        },
        accent: {
          blue: '#4da6ff',
          'blue-dim': '#2d78cc',
          'blue-glow': 'rgba(77,166,255,0.15)',
          amber: '#ffaa33',
          'amber-dim': '#cc8822',
          'amber-glow': 'rgba(255,170,51,0.15)',
          green: '#3ddc84',
          red: '#ff4d6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'pulse-slow': 'pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
