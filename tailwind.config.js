/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        wave: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(59,130,246,0.5)' },
          '50%': { boxShadow: '0 0 12px rgba(59,130,246,0.9)' },
        },
      },
      animation: {
        wiggle: 'wiggle 2.8s ease-in-out infinite',
        wave: 'wave 1s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
