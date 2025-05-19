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

  vite: {
    plugins: [
      tailwindcss(),
    ]
  },

  modules: ['@pinia/nuxt']
})