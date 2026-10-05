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
        float: 'aiFloat 5s ease-in-out infinite',
        flashGreen: 'flashGreen 1.8s ease forwards',
        flashRed: 'flashRed 1.8s ease forwards',
        pillGlow: 'pillGlow 1.5s ease',
        popIn: 'popIn 0.38s cubic-bezier(0.22, 1.4, 0.36, 1)',
        blinkClock: 'blinkClock 1s steps(1) infinite',
        riseIn: 'riseIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        fadeUp: 'fadeUp 0.3s ease both',
        growBar: 'growBar 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        drawLn: 'drawLn 1.2s cubic-bezier(0.3, 0.7, 0.3, 1) forwards'
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
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(52, 211, 153, 0.35)', boxShadow: '0 0 0 2px rgba(52, 211, 153, 0.6)' },
          '100%': { backgroundColor: 'transparent', boxShadow: 'none' }
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(248, 113, 113, 0.4)', boxShadow: '0 0 0 2px rgba(248, 113, 113, 0.6)' },
          '100%': { backgroundColor: 'transparent', boxShadow: 'none' }
        },
        pillGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
          '35%': { boxShadow: '0 0 16px 3px currentColor' },
          '100%': { boxShadow: '0 0 0 0 transparent' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.88) translateY(18px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        blinkClock: {
          '50%': { opacity: '0.2' }
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        growBar: {
          '0%': { transform: 'scaleY(0.12)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' }
        },
        drawLn: {
          '100%': { strokeDashoffset: '0' }
        }
      }
    }
  },
  plugins: [],
}
