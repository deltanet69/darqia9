/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    './app/**/*.{js,vue,ts}'
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A2A5C',
        navy2: '#0d3470',
        blue: { DEFAULT: '#1B5FD9', d: '#14499F' },
        sky: { DEFAULT: '#4C8DFF', soft: '#E8F0FE' },
        gold: { DEFAULT: '#F0B429', soft: '#FDF3DC' },
        bg: '#F5F8FF',
        card: '#FFFFFF',
        ink: '#0F1E38',
        mut: '#5A6B8C',
        line: '#E3EAF7',
        green: { DEFAULT: '#16A34A', soft: '#E7F7EE' }
      },
      borderRadius: {
        'r': '18px',
        'r-sm': '12px'
      },
      boxShadow: {
        'sh': '0 10px 30px rgba(10,42,92,.10)',
        'sh-lg': '0 24px 60px rgba(10,42,92,.16)'
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        float: 'aiFloat 5s ease-in-out infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        aiFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' }
        }
      }
    }
  },
  plugins: [],
}
