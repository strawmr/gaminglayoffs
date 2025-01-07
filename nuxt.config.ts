import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'


// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },

  ssr: true,
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify'],
  },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/main.scss',
  ],

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    'nuxt-gtag',
    //...
  ],

  gtag: {
    id: 'G-2NC0DNT9Q5',
    config: {
      page_title: 'Video Game Layoffs Analytics Test'
    },
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY
    },
  },

  hooks: {
    'vite:serverCreated'(server) {
      console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
      console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY)
    }
  },

  compatibilityDate: '2025-01-04',
})