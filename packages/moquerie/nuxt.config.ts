// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  ui: {
    icons: ['ph', 'mdi'],
  },
})
