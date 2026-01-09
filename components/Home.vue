<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="12">
        <v-img
          class="mb-4"
          height="auto"
          style="margin: 0 auto; max-width: 700px"
          src="@/assets/PinkSlip.png"
        />
      </v-col>

      <!-- Loading indicator -->
      <v-col v-if="!state.company && !state.daysSinceLastLayoff" cols="12" class="text-center">
        <h2 class="skeleton-title text-center">
          <v-container>
            <div class="loading">
              <div class="loading__letter">L</div>
              <div class="loading__letter">o</div>
              <div class="loading__letter">a</div>
              <div class="loading__letter">d</div>
              <div class="loading__letter">i</div>
              <div class="loading__letter">n</div>
              <div class="loading__letter">g</div>
              <div class="loading__letter">.</div>
              <div class="loading__letter">.</div>
              <div class="loading__letter">.</div>
            </div>
          </v-container>
        </h2>
      </v-col>

      <!-- REAL DATA/CONTENT -->
      <div v-if="state.company || state.daysSinceLastLayoff" class="text-content" style="margin: 0 auto;" :class="{ 'hide-text': !state.company && !state.daysSinceLastLayoff }">
        <v-col cols="12">
          <div>
            <h1 class="text-center">
              It's been <span class="DaysNum">{{ state.daysSinceLastLayoff }}</span> {{ dayText }} since the last gaming layoffs
            </h1>
          </div>
        </v-col>

        <v-col cols="12">
          <div>
            <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Latest Studio:</h2>
            <div v-if="state.company" class="text-center company-container">
              <span class="company-name cabin">{{ state.company.company }}
                <p v-if="state.company.source"><a :href="state.company.source" target="_blank">(Source)</a></p>
              </span>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <div>
            <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Employees Affected:</h2>
            <div v-if="state.company" class="text-center company-container">
              <span class="company-name cabin">{{ employeesCount }}</span>
            </div>
          </div>
        </v-col>

        <!-- <v-col cols="12">
          <div>
            <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Total Estimated Layoffs In 2025:</h2>
            <div v-if="totalEmployees2025" class="text-center company-container">
              <span class="company-name cabin">~ {{ formatNumber(totalEmployees2025) }}</span>
            </div>
          </div>
        </v-col> -->

        <v-col cols="12">
  <div>
    <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Total Estimated Layoffs In 2026:</h2>
    <div v-if="state.totalEmployees !== null" class="text-center company-container">
      <span class="company-name cabin">~ {{ formatNumber(state.totalEmployees) }}</span>
    </div>
  </div>
</v-col>


      </div>

      <v-col cols="12" class="text-center footer-tag">
        <v-btn style="font-weight: 800;" size="large" base-color="#fd97be" href="https://docs.google.com/spreadsheets/d/1sxqxCSPvMdBW0PPJdOYhmRutANitab-jFgmcltraPRQ/edit?usp=sharing" target="_blank">
          Full Gaming Layoff Tracker
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import numeral from 'numeral'
import { useNuxtApp } from '#app'

// Helper function to calculate the difference in days
function calculateDaysDifference(lastDate: string) {
  const today = new Date()
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  const [year, month, day] = lastDate.split('-').map(Number)
  const lastEntryDateUTC = Date.UTC(year, month - 1, day)

  return Math.ceil((todayUTC - lastEntryDateUTC) / (1000 * 60 * 60 * 24))
}

const state = reactive({
  daysSinceLastLayoff: null as number | null,
  company: null as Record<string, any> | null,
  totalEmployees: null as number | null, // Track total employees
})

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const currentYear = new Date().getFullYear()

  try {
    // Fetch the most recent layoffs data
    const { data: recentData, error: recentError } = await $supabase
      .from('layoffs')
      .select('company, employees, source, date')
      .order('date', { ascending: false })
      .limit(1)

    if (recentError) {
      console.error('Error fetching recent data from Supabase:', recentError)
      return
    }

    if (recentData && recentData.length > 0) {
      const mostRecentEntry = recentData[0]
      state.company = mostRecentEntry
      state.daysSinceLastLayoff = calculateDaysDifference(mostRecentEntry.date)
    }

    // Fetch all rows and filter for the current year
    const { data: employeesData, error: employeesError } = await $supabase
      .from('layoffs')
      .select('employees, date')

    if (employeesError) {
      console.error('Error fetching employees data from Supabase:', employeesError)
      return
    }

    if (employeesData) {
      // Filter data for the current year and sum employees
      state.totalEmployees = employeesData
        .filter((row) => {
          const rowYear = new Date(row.date).getFullYear()
          return rowYear === currentYear
        })
        .reduce((sum, row) => {
          return sum + (row.employees || 0) // Safeguard against null values
        }, 0)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
})



// Format numbers with commas
const formatNumber = (number: number) => numeral(number).format('0,0')

// Computed property for employees affected
const employeesCount = computed(() => state.company?.employees || 'Unknown')

// Computed property for day text (singular/plural)
const dayText = computed(() => (state.daysSinceLastLayoff === 1 ? 'day' : 'days'))
</script>


<style>
/* Add your styles here */
</style>
