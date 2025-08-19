import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      BASE_API_URL: 'https://api.darelisme.my.id/mywuling',
      DARELISME_URL: 'https://darelisme.my.id',
      API_DARELISME_URL: 'https://api.darelisme.my.id',
    }
  },
  build: {
    transpile: ['vue-router'],
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['vue-router']
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/leaflet',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt'
  ],
  pwa: {
    manifest: {
      name: 'DWS-MyWuling',
      short_name: 'myWuling',
      description: 'Your wuling companion app',
      lang: 'en',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#e11d48',
      icons: [
        {
          src: 'public/favicon.ico',
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
  }
})