/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        easyButtonGlow: {
          '0%, 100%': {
            borderColor: 'rgb(254, 208, 121)',
            backgroundColor: 'rgb(254, 245, 230)',
            boxShadow: '0 0 0 0px rgba(217, 119, 6, 0)',
          },
          '50%': {
            borderColor: 'rgb(217, 119, 6)',
            backgroundColor: 'rgb(255, 251, 235)',
            boxShadow: '0 0 12px 2px rgba(217, 119, 6, 0.3)',
          },
        },
      },
      animation: {
        easyButtonGlow: 'easyButtonGlow 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
