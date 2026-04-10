/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Manrope"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        primary: '#0f172a',
        secondary: '#e0f2fe',
        accent: '#0284c7',
        neon: '#38bdf8',
        carbon: '#0b1021',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'plane-fly': 'planeFly 3s ease-in-out',
        'ticker-slow': 'ticker 35s linear infinite',
        'float-soft': 'floatSoft 14s ease-in-out infinite',
        'glimmer': 'glimmer 9s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(2, 132, 199, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(2, 132, 199, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(2, 132, 199, 0)' },
        },
        planeFly: {
          '0%': { transform: 'translateX(-100%) translateY(100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(-100%)', opacity: '0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        ...require('tailwindcss/defaultTheme').animation,
        'ticker-slow': 'ticker 240s linear infinite',
      },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
