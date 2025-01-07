<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Company {
  company: string
}

const companies = ref<Company[]>([])  // Define companies as an array of Company objects
const { $supabase } = useNuxtApp() // Access the Supabase client

const fetchCompanies = async () => {
  const { data, error } = await $supabase
    .from('layoffs')
    .select('company')
    .order('id', {ascending: false})
    .limit(2)

  if (error) {
    console.error('Error fetching companies:', error.message)
  } else {
    console.log('Fetched data:', data)  // Log the returned data
    companies.value = data
  }
}


// Fetch data when the component is mounted
onMounted(() => {
  console.log('Component mounted')
  fetchCompanies()
})

</script>

<template>
  <div>
    <h1>Top 2 Companies</h1>
    <!-- <pre>{{ companies }}</pre> Display raw data to inspect -->
    <ul>
      <li v-for="(company, index) in companies" :key="index">
        {{ company.company }}
      </li>
    </ul>
  </div>
</template>
