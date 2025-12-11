/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 0px rgba(255, 87, 34, 0.5)' },
          '50%': { boxShadow: '0 0 12px rgba(255, 87, 34, 0.9)' },
          '100%': { boxShadow: '0 0 0px rgba(255, 87, 34, 0.5)' },
        },
        micPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        fingerTap: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        micScale: 'micPulse 0.8s ease-in-out infinite',
        fingerTap: 'fingerTap 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
