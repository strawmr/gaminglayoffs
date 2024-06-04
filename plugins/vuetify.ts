// plugins/vuetify.ts
import '@/assets/main.scss'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

 

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
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
  }
  ,)

  nuxtApp.vueApp.use(vuetify)
})
