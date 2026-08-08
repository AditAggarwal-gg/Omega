import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/error.vue'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#14120E',
          900: '#F5F2E9',
          800: 'rgba(255,255,255,0.55)',
          700: '#E4E0D3',
          600: '#D8D3C4'
        },
        signal: {
          400: '#F7C27A',
          500: '#F2A93B',
          600: '#D98E22'
        },
        live: {
          400: '#79E6DA',
          500: '#0F6E56',
          600: '#0B5142'
        },
        danger: {
          500: '#C73137',
          600: '#A32424'
        },
        paper: {
          50: '#14120E',
          200: '#3A382F',
          400: '#7A7768'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular']
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px'
      },
      boxShadow: {
        panel: '0 20px 50px -12px rgba(20,18,14,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'
      },
      backgroundImage: {
        waveform: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='8' viewBox='0 0 120 8'%3E%3Cpath d='M0 4 Q3 0 6 4 T12 4 T18 4 T24 4 T30 4 T36 4 T42 4 T48 4 T54 4 T60 4 T66 4 T72 4 T78 4 T84 4 T90 4 T96 4 T102 4 T108 4 T114 4 T120 4' stroke='%23D8D3C4' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
        'omega-watermark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900' viewBox='0 0 900 900'%3E%3Ctext x='450' y='760' font-family='Space Grotesk,sans-serif' font-weight='700' font-size='820' fill='%2314120E' fill-opacity='0.06' text-anchor='middle'%3E%CE%A9%3C/text%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: [typography]
} satisfies Config
