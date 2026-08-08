// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: '%s · Omega',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#F5F2E9' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    // Public marketing + content browsing can be pre-rendered / cached at
    // the edge. Everything under /app and /omega-admin is per-tenant and
    // must stay dynamic.
    '/': { prerender: true },
    '/pricing': { prerender: true },
    '/content/**': { swr: 3600 },
    '/app/**': { ssr: true },
    '/omega-admin/**': { ssr: true },
  },
  compatibilityDate: '2026-07-18',

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
  },

  typescript: { strict: true },
  eslint: { config: { stylistic: true } },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Omega',
      short_name: 'Omega',
      description: 'Multi-organization publishing and collaboration platform',
      theme_color: '#F5F2E9',
      background_color: '#F5F2E9',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // `navigateFallback` is workbox's SPA-shell mechanism — it serves one
      // cached HTML page for every navigation that isn't otherwise matched.
      // That's wrong for an SSR app like this one, where every URL has its
      // own real server-rendered page: it was the root cause of several
      // "wrong page shows up" bugs during development, where a route that
      // wasn't precached silently got swapped for a stale cached page.
      // Deliberately NOT set. Instead, navigations use NetworkFirst below —
      // always try the real server render first, and only fall back to a
      // previously-cached copy of that *same* URL if the network is truly
      // unreachable (genuine offline use), never as a catch-all guess.
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          // Never cache authenticated data or API responses — tenant data
          // must always come from the network, never from a stale cache.
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
          handler: 'NetworkOnly',
        },
        {
          // Page navigations: try the network (with a short timeout so a
          // slow connection doesn't hang), fall back to a cached copy of
          // that exact URL only if the network genuinely fails.
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'omega-pages',
            networkTimeoutSeconds: 4,
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Static assets (JS/CSS/fonts): fine to serve instantly from
          // cache while quietly checking for an update in the background.
          urlPattern: ({ request }: { request: Request }) =>
            ['style', 'script', 'worker', 'font'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'omega-assets' },
        },
      ],
    },
    // Service worker only builds for production (`npm run build` /
    // `generate`). Disabled in dev — a dev-mode service worker caused more
    // debugging confusion than value while actively changing routes.
    devOptions: { enabled: false },
  },

  // Supabase module: RLS is the real gate, but we also lock down which
  // routes require a session at the edge so anonymous users never render
  // authenticated shells.
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/app(/*)?', '/omega-admin(/*)?'],
      exclude: ['/', '/pricing', '/content/**', '/login', '/signup', '/legal/**'],
    },
    types: '~/types/database.types.ts',
  },
})
