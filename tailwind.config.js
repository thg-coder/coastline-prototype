/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Coastal palette — warm, soft, sophisticated. `ocean` mirrors
        // siteConfig.primaryColor (#1F6E8C) so config-driven and class-driven
        // surfaces stay in sync.
        coast: {
          sky: '#EAF4F7', // very light tint — selected card backgrounds, soft fills
          mist: '#D4E7EC', // light border / divider tint on tinted surfaces
          sea: '#5AA7BD', // mid teal — secondary accents, hover borders, icons
          ocean: '#1F6E8C', // primary teal — CTAs, links, active states
          deep: '#16505F', // deep teal — gradient end, hover-darken
          ink: '#0E2A33', // near-black teal — primary text
          sand: '#F0E8D8', // warm sand — subtle warm fills
          cream: '#FBF8F1', // warm off-white — page / panel background
          shell: '#FDFBF6', // lightest warm white — cards on cream
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
        // Soft serif for the brand wordmark and major display headings only.
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        widget: '0 16px 48px -16px rgba(14, 42, 51, 0.20), 0 2px 8px rgba(14, 42, 51, 0.05)',
        card: '0 1px 2px rgba(14, 42, 51, 0.04), 0 1px 3px rgba(14, 42, 51, 0.06)',
        'card-hover': '0 6px 16px -4px rgba(14, 42, 51, 0.10), 0 2px 4px rgba(14, 42, 51, 0.05)',
        'card-active': '0 2px 8px -2px rgba(31, 110, 140, 0.20)',
        cta: '0 6px 16px -4px rgba(31, 110, 140, 0.35), 0 2px 4px rgba(31, 110, 140, 0.20)',
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
        fadeIn: 'fadeIn 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        spin: 'spin 0.9s linear infinite',
      },
    },
  },
  plugins: [],
};
