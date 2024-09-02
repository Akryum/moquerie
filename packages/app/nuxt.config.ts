// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: false,
  },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
  ],

  ui: {
    icons: ['ph', 'mdi', 'carbon'],
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

  typescript: {
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },

  vite: {
    worker: {
      format: 'es',
    },
  },

  nitro: {
    preset: 'node',
    serveStatic: true,
    devServer: {
      watch: [
        './node_modules/@moquerie/core/**',
      ],
    },
    rollupConfig: {
      external: [
        /@moquerie/,
        'graphql',
      ],
    },
  },

  compatibilityDate: '2024-08-22',
})
