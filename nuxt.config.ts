// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-18',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      titleTemplate: '%s · Omega',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#0E1116' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ]
    }
  },

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/app(/*)?', '/omega-admin(/*)?'],
      exclude: ['/', '/pricing', '/content/**', '/login', '/signup', '/legal/**']
    },
    types: '~/types/database.types.ts'
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Omega',
      short_name: 'Omega',
      description: 'Multi-organization publishing and collaboration platform',
      theme_color: '#0E1116',
      background_color: '#0E1116',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
          handler: 'NetworkOnly'
        },
        {
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'omega-pages',
            networkTimeoutSeconds: 4,
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: ({ request }: { request: Request }) =>
            ['style', 'script', 'worker', 'font'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'omega-assets' }
        }
      ]
    },
    devOptions: { enabled: false }
  },

  routeRules: {
    '/': { prerender: true },
    '/pricing': { prerender: true },
    '/content/**': { swr: 3600 },
    '/app/**': { ssr: true },
    '/omega-admin/**': { ssr: true }
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      }
    }
  },

  typescript: { strict: true },
  eslint: { config: { stylistic: true } }
})
