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
    '@nuxtjs/google-fonts',
  ],

  ui: {
    icons: ['ph', 'mdi'],
  },

  css: [
    'floating-vue/dist/style.css',
    '~/assets/css/floating-vue.css',
  ],

  googleFonts: {
    families: {
      'Noto+Sans': [400, 700],
      'Noto+Sans+Mono': [400, 700],
    },
  },
})
