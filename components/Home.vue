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

      <!-- Loading indicator or skeleton placeholder -->
      <!-- <div v-if="!state.company && !state.daysSinceLastLayoff" class="skeleton-container text-center"> -->
        
        <v-col v-if="!state.company && !state.daysSinceLastLayoff" cols="12" class="text-center" >
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
              <span class="company-name cabin">{{ state.company.Company }}
                <p><a :href="state.company.Source" target="_blank">(Source)</a></p>
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

        <v-col cols="12">
          <div>
            <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Total Estimated Layoffs In 2025:</h2>
            <div v-if="state.company" class="text-center company-container">
              <span class="company-name cabin">~ {{ formatNumber(state.company.Total_Employees) }}</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <div>
            <h2 class="uppercase text-center" style="color: rgb(253, 151, 190)">Total Known Layoffs In 2024:</h2>
            <div class="text-center company-container">
              <span class="company-name cabin">~ 14,853 Known/Over 16,000 Estimated</span>
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
import axios from 'axios'
import { onMounted, reactive, computed } from 'vue'
import numeral from 'numeral'

// Helper function to calculate the difference in days
function calculateDaysDifference(lastDate: string) {
  const today = new Date()
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  const dateParts = lastDate.split('-')
  const year = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed
  const day = parseInt(dateParts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('Invalid date format:', lastDate)
    return null
  }

  const lastEntryDateUTC = Date.UTC(year, month, day)
  const differenceInTime = todayUTC - lastEntryDateUTC
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24))
  return differenceInDays
}

const state = reactive({
  daysSinceLastLayoff: null as number | null,
  company: null as Record<string, any> | null,
})

onMounted(() => {
  const url = 'https://script.google.com/macros/s/AKfycbyV76IxUxpJG3QT2x_cs2-JA8pAKMa8IeoyX6JvN3TzWSHJC35ijU0CXlkX8mpqgtFz/exec'
  axios
    .get(url)
    .then((response) => {
      if (response.data) {
        const mostRecentEntry = response.data // The response is now a single object
        state.company = mostRecentEntry
        state.daysSinceLastLayoff = calculateDaysDifference(mostRecentEntry.Date) // Assuming 'Date' is the key for the date in the data
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
    })
})

const formatNumber = (number: number) => {
  return numeral(number).format('0,0') // Format number with commas as thousand separators
}

// Computed property to display "Unknown" if Employees data is missing
const employeesCount = computed(() => {
  return state.company && state.company.Employees ? state.company.Employees : 'Unknown'
})

// Computed property to display "No Layoffs Yet This Year" if no data is available
const latestCompany = computed(() => {
  return state.company && state.company.Company ? state.company.Company : 'There have been no layoffs yet this year'
})

// Computed property to handle singular/plural day text
const dayText = computed(() => {
  return state.daysSinceLastLayoff === 1 ? 'day' : 'days'
})
</script>

<style>
/* Dummy style */
body {}
</style>
