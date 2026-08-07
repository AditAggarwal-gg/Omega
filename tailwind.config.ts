import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// --- Omega design tokens -----------------------------------------------
// Subject: a multi-tenant editorial/broadcast platform — teams "go live"
// with articles, video and audio. The palette leans into a control-room
// feel (deep ink surfaces) with a single warm "on-air" signal color,
// rather than the generic cream/terracotta or near-black/acid-green
// defaults. A cool cyan is reserved for live/status states only.
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
          950: '#0A0D12',
          900: '#0E1116',
          800: '#161B22',
          700: '#1F262E',
          600: '#2B333D'
        },
        signal: {
          400: '#F7C27A',
          500: '#F2A93B',
          600: '#D98E22'
        },
        live: {
          400: '#79E6DA',
          500: '#4FD1C5',
          600: '#33A99E'
        },
        danger: {
          500: '#E5484D',
          600: '#C73137'
        },
        paper: {
          50: '#F5F7FA',
          200: '#C9D1D9',
          400: '#8B949E'
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
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)'
      },
      backgroundImage: {
        // the "frequency line" signature divider — a subtle waveform
        // used instead of a plain <hr>, nodding to the audio content type
        waveform: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='8' viewBox='0 0 120 8'%3E%3Cpath d='M0 4 Q3 0 6 4 T12 4 T18 4 T24 4 T30 4 T36 4 T42 4 T48 4 T54 4 T60 4 T66 4 T72 4 T78 4 T84 4 T90 4 T96 4 T102 4 T108 4 T114 4 T120 4' stroke='%232B333D' stroke-width='1' fill='none'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: [typography]
} satisfies Config
