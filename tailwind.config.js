/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coast: {
          sky: '#E6F2F8',
          mist: '#CFE6EF',
          sea: '#5CA9C2',
          ocean: '#1F6E8C',
          deep: '#134659',
          sand: '#F5EFE2',
          cream: '#FBF7EE',
          ink: '#0F2A36',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        widget: '0 10px 40px -10px rgba(15, 42, 54, 0.18), 0 2px 8px rgba(15, 42, 54, 0.06)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 250ms ease-out',
        spin: 'spin 0.9s linear infinite',
      },
    },
  },
  plugins: [],
};
