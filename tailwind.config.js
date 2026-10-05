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
        drawLn: 'drawLn 1.2s cubic-bezier(0.3, 0.7, 0.3, 1) forwards',
        // Flat Icon Sprite Animations
        aiPing: 'aiPing 2.4s ease-out infinite',
        aiPingSlow: 'aiPing 3.6s ease-out infinite',
        aiSpin: 'aiSpin 12s linear infinite',
        aiBlink: 'aiBlink 2.8s ease-in-out infinite',
        aiTwinkle: 'aiBlink 3.4s ease-in-out infinite',
        aiTyping: 'aiBlink 1.4s ease-in-out infinite',
        aiSlideX: 'aiSlideX 2.2s ease-in-out infinite',
        aiFly: 'aiSlideX 3s ease-in-out infinite',
        aiWave: 'aiWave 3s ease-in-out infinite',
        aiSmoke: 'aiSmoke 3s ease-in-out infinite',
        aiSteam: 'aiSmoke 2.6s ease-in-out infinite',
        aiFlicker: 'aiFlicker 4s linear infinite',
        aiToss: 'aiToss 5s ease-in-out infinite',
        aiWiggle: 'aiToss 3.6s ease-in-out infinite',
        aiBob: 'aiBob 2.6s ease-in-out infinite',
        aiHit: 'aiHit 1.8s ease-in-out infinite',
        // Animated Icon Component Animations
        bounceUp: 'bounceUp 0.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate',
        sparkleStar: 'sparkleSpin 3s linear infinite, sparklePulse 1.5s ease-in-out infinite alternate',
        sparkleBlink: 'sparkleBlink 2s ease-in-out infinite',
        xCross1: 'xCross1 0.3s ease-in-out',
        xCross2: 'xCross2 0.3s ease-in-out',
        flyAway: 'flyAway 0.6s ease-in-out forwards',
        capBounce: 'capBounce 0.5s cubic-bezier(0.28, 0.84, 0.42, 1)'
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
        },
        // Flat Icon Sprite Keyframes
        aiPing: {
          '0%': { transform: 'scale(0.55)', opacity: '0.9' },
          '75%, 100%': { transform: 'scale(1.7)', opacity: '0' }
        },
        aiSpin: {
          'to': { transform: 'rotate(360deg)' }
        },
        aiBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' }
        },
        aiSlideX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' }
        },
        aiWave: {
          '0%, 100%': { transform: 'skewY(0)' },
          '50%': { transform: 'skewY(5deg)' }
        },
        aiSmoke: {
          '0%': { transform: 'translateY(0)', opacity: '0.9' },
          '100%': { transform: 'translateY(-7px)', opacity: '0' }
        },
        aiFlicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.4' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.6' },
          '97%': { opacity: '1' }
        },
        aiToss: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' }
        },
        aiBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' }
        },
        aiHit: {
          '0%, 100%': { transform: 'rotate(0)' },
          '50%': { transform: 'rotate(-14deg)' }
        },
        // Animated Icon Component Keyframes
        bounceUp: {
          '0%': { transform: 'translateY(2px)' },
          '100%': { transform: 'translateY(-4px)' }
        },
        sparkleSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' }
        },
        sparklePulse: {
          '0%': { transform: 'scale(0.8) rotate(0deg)' },
          '100%': { transform: 'scale(1.1) rotate(45deg)' }
        },
        sparkleBlink: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' }
        },
        xCross1: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.5)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        xCross2: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
          '100%': { transform: 'scale(1)' }
        },
        flyAway: {
          '0%': { transform: 'translate(0, 0)', opacity: '1' },
          '40%': { transform: 'translate(10px, -10px)', opacity: '0' },
          '41%': { transform: 'translate(-10px, 10px)', opacity: '0' },
          '100%': { transform: 'translate(0, 0)', opacity: '1' }
        },
        capBounce: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [],
}
