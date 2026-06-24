<script setup lang="ts">
const year = new Date().getFullYear()

useHead({
  title: `${year} Games Industry Layoffs | Video Game Layoffs`,
  link: [
    { rel: 'canonical', href: 'https://gaminglayoffs.com' },
  ],
  meta: [
    { name: 'description', content: 'Track every games industry layoff and studio closure. Real-time data on affected employees, parent companies, and historical trends going back to 2020.' },
    { name: 'keywords', content: 'gaming layoffs, layoffs 2025, layoffs 2026, gaming industry, employee layoffs, games industry layoffs, games layoffs, video game layoffs, studio closures' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Gaming Layoffs' },
    { property: 'og:title', content: `Gaming Layoff Tracker — ${year}` },
    { property: 'og:description', content: 'Track every games industry layoff and studio closure. Real-time data on affected employees and historical trends.' },
    { property: 'og:image', content: 'https://gaminglayoffs.com/og-image.png' },
    { property: 'og:url', content: 'https://gaminglayoffs.com' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@MikeStrawMedia' },
    { name: 'twitter:title', content: `Gaming Layoff Tracker — ${year}` },
    { name: 'twitter:description', content: 'Track every games industry layoff and studio closure. Real-time data on affected employees and historical trends.' },
    { name: 'twitter:image', content: 'https://gaminglayoffs.com/og-image.png' },
  ],
})
</script>


<template>
    <v-app>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
      <Footer />
    </v-app>
</template>