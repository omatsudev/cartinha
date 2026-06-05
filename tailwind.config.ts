import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#15803d',
          dark: '#14532d',
          light: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'card-play': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15) translateY(-8px)' }, '100%': { transform: 'scale(1) translateY(0)' } },
        'flip-in': { from: { transform: 'rotateY(90deg)', opacity: '0' }, to: { transform: 'rotateY(0)', opacity: '1' } },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'card-play': 'card-play 0.4s ease-in-out',
        'flip-in': 'flip-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
