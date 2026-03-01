/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'arcana-red':   '#C3002F',
        'arcana-red2':  '#FF1744',
        'arcana-black': '#080808',
        'arcana-card':  '#0E0E0E',
        'arcana-card2': '#161616',
        'arcana-white': '#EFEFEF',
        'arcana-gold':  '#E8C840',
        'arcana-dim':   '#3A3A3A',
        'arcana-muted': '#5A5A5A',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
        body:    ['"Noto Sans SC"', 'sans-serif'],
      },
      clipPath: {
        'skew-tr': 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
        'skew-tl': 'polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px)',
      },
    },
  },
  plugins: [],
}
