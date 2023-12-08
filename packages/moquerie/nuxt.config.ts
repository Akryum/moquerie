// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  ui: {
    icons: ['ph', 'mdi'],
  },

  css: [
    'floating-vue/dist/style.css',
    '~/assets/css/floating-vue.css',
  ],
})
