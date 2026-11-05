/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070a14',
          900: '#0a0f1d',
          850: '#0e1424',
          800: '#121a2e',
          700: '#1a253f',
          600: '#243150',
        },
        emerald: {
          neon: '#00e676',
          bright: '#00ff8a',
          deep: '#00b25c',
          dim: '#00904a',
        },
      },
      fontFamily: {
        sans: ['"Tajawal"', '"Cairo"', 'system-ui', 'sans-serif'],
        display: ['"Cairo"', '"Tajawal"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 12px rgba(0,230,118,0.35)',
        neon: '0 0 24px rgba(0,230,118,0.45)',
        'neon-lg': '0 0 40px rgba(0,230,118,0.55)',
        glass: '0 8px 32px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 12px rgba(0,230,118,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(0,230,118,0.65)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out both',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
