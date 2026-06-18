// plugins/vuetify.ts
import '@/assets/main.scss'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from 'vuetify/iconsets/fa'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'fa',
      aliases,
      sets: { fa },
    },
    theme: {
      defaultTheme: 'dark',
    },
    defaults: {
      global: {
        font: {
          family: 'Montserrat',
        },
      },
    },
    components,
    directives,
  })

  nuxtApp.vueApp.use(vuetify)
})
