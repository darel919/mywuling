// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      BASE_API_URL: 'https://api.darelisme.my.id/myWuling'
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
    '@nuxtjs/color-mode'
  ]
})