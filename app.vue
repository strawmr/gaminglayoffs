<script setup lang="ts">
useHead({
  title: 'Video Game Layoffs | Track Gaming Industry Layoffs | Last Gaming Layoffs',
  meta: [
    { name: 'description', content: 'Track the latest gaming layoffs in 2024. Get the most recent data on company layoffs and employee numbers.' },
    { name: 'keywords', content: 'gaming layoffs, layoffs 2024, gaming industry, employee layoffs' },
    { property: 'og:title', content: 'Gaming Layoff Tracker - 2024' },
    { property: 'og:description', content: 'Track the latest gaming layoffs in 2024. Get the most recent data on company layoffs and employee numbers.' },
    { property: 'og:image', content: 'https://gaminglayoffs.com/_nuxt/PinkSlip.DHAW9k5K.png' }, // Replace with your image URL
    { property: 'og:url', content: 'https://gaminglayoffs.com' }, // Replace with your website URL
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Gaming Layoff Tracker - 2024' },
    { name: 'twitter:description', content: 'Track the latest gaming layoffs in 2024. Get the most recent data on company layoffs and employee numbers.' },
    { name: 'twitter:image', content: 'https://gaminglayoffs.com/_nuxt/PinkSlip.DHAW9k5K.png' } // Replace with your image URL
  ],
  bodyAttrs: {
    class: 'test'
  },
  script: [ { innerHTML: 'console.log(\'SEO IS CALLED\')' } ]
})
</script>


<template>
    <v-app>
     <Home />
     <Footer />
    </v-app>  
</template>