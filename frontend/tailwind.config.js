/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(16,185,129,0)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'fade-in':       'fadeIn 0.35s ease forwards',
        'slide-up':      'slideUp 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) forwards',
        'slide-right':   'slideRight 0.35s ease forwards',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.34, 1.3, 0.64, 1) forwards',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up':      'floatUp 3s ease-in-out infinite',
        'pulse-ring':    'pulseRing 2s ease infinite',
        shimmer:         'shimmer 2s linear infinite',
        'gradient-shift':'gradientShift 4s ease infinite',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px -6px rgba(0,0,0,0.12)',
        'glow-sm': '0 0 12px rgba(16,185,129,0.2)',
        'glow-md': '0 0 24px rgba(16,185,129,0.3)',
        'glow-violet': '0 0 24px rgba(139,92,246,0.3)',
      },
    },
  },
  plugins: [],
}
