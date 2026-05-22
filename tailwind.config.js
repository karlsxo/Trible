/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0b0f14',
          900: '#111722',
          800: '#171e2c',
          700: '#1f2937',
          600: '#2a3443',
        },
        emerald: {
          500: '#14b8a6',
          400: '#2dd4bf',
        },
      },
      fontFamily: {
        sans: ['"Spline Sans"', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(20, 184, 166, 0.35)',
        soft: '0 20px 40px rgba(9, 14, 22, 0.45)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at top, rgba(20, 184, 166, 0.15), transparent 45%), radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.12), transparent 38%)',
      },
    },
  },
  plugins: [],
}

