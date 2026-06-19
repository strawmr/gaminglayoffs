<template>
  <v-container class="fill-height home-container">
    <v-row justify="center">

      <!-- Logo -->
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

      <!-- Content -->
      <template v-if="state.company || state.daysSinceLastLayoff">

        <!-- Hero: days counter -->
        <v-col cols="12" class="text-center pb-8">
          <h1 class="hero-text">
            It's been <span class="DaysNum">{{ state.daysSinceLastLayoff }}</span> {{ dayText }} since the last gaming layoffs
          </h1>
        </v-col>

        <!-- Stat cards -->
        <v-col cols="12" sm="6" class="d-flex">
          <div class="stat-card">
            <div class="stat-label">Latest Studio</div>
            <div class="stat-value">{{ state.company?.company }}</div>
            <a v-if="state.company?.source" :href="state.company.source" target="_blank" class="stat-source">(Source)</a>
          </div>
        </v-col>

        <v-col cols="12" sm="6" class="d-flex">
          <div class="stat-card">
            <div class="stat-label">Employees Affected</div>
            <div class="stat-value">{{ employeesCount }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" class="d-flex">
          <div class="stat-card stat-card--aggregate">
            <div class="stat-label stat-label--aggregate">Total Estimated Layoffs in 2026</div>
            <div class="stat-value">~ {{ state.totalEmployees !== null ? formatNumber(state.totalEmployees) : '—' }}</div>
            <div v-if="yoyChange !== null" class="stat-yoy" :class="yoyChange > 0 ? 'stat-yoy--worse' : 'stat-yoy--better'">
              {{ yoyChange > 0 ? '+' : '' }}{{ yoyChange }}% vs same point in {{ currentYear - 1 }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" class="d-flex">
          <div class="stat-card stat-card--aggregate">
            <div class="stat-label stat-label--aggregate">Unique Companies Affected in 2026</div>
            <div class="stat-value">{{ state.uniqueCompanies ?? '—' }}</div>
          </div>
        </v-col>

        <!-- CTA -->
        <v-col cols="12" class="text-center mt-4">
          <div class="cta-row">
            <v-btn style="font-weight: 800;" size="large" base-color="#fd97be" to="/tracker">
              Full Gaming Layoff Tracker
            </v-btn>
            <SubmitLayoffModal>
              <template #activator="{ props }">
                <v-btn v-bind="props" style="font-weight: 800;" size="large" variant="outlined" color="#fd97be">
                  Submit a Layoff
                </v-btn>
              </template>
            </SubmitLayoffModal>
          </div>
        </v-col>

        <!-- Monthly bar chart -->
        <v-col cols="12" class="mt-4">
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">{{ currentYear }} Layoffs by Month</span>
              <span v-if="worstMonth !== null" class="chart-worst">
                Worst month: <strong>{{ MONTHS[worstMonth] }}</strong> (~{{ shortNumber(state.monthlyEmployees[worstMonth]) }} employees)
              </span>
            </div>

            <div class="chart-bar-area">
              <div v-for="(val, i) in state.monthlyEmployees" :key="i" class="chart-col">
                <span v-if="val > 0" class="chart-val">{{ shortNumber(val) }}</span>
                <div
                  class="chart-bar"
                  :class="{
                    'chart-bar--future': i > currentMonth,
                    'chart-bar--worst': i === worstMonth,
                  }"
                  :style="{ height: barHeight(val) }"
                />
              </div>
            </div>

            <div class="chart-months">
              <div v-for="(m, i) in MONTHS" :key="i" class="chart-month-label" :class="{ 'chart-month-label--current': i === currentMonth }">
                {{ m }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Resources -->
        <v-col cols="12" class="mt-2">
          <div class="resources-card">
            <div class="resources-header">
              <i class="fas fa-life-ring resources-icon"></i>
              Affected by a layoff? Here are some resources.
            </div>
            <div class="resources-grid">
              <div class="resources-group">
                <div class="resources-group-label">Job Boards</div>
                <a href="https://games-jobs-workbook.replit.app/" target="_blank" rel="noopener noreferrer" class="resources-link">ASGC Jobs Board</a>
                <a href="https://gamejobs.co" target="_blank" rel="noopener noreferrer" class="resources-link">GameJobs.co</a>
                <a href="https://hitmarker.net" target="_blank" rel="noopener noreferrer" class="resources-link">Hitmarker</a>
                <a href="https://workwithindies.com" target="_blank" rel="noopener noreferrer" class="resources-link">Work With Indies</a>
                <a href="https://www.linkedin.com/jobs/search/?keywords=game%20developer" target="_blank" rel="noopener noreferrer" class="resources-link">LinkedIn Gaming Jobs</a>
              </div>
              <div class="resources-group">
                <div class="resources-group-label">Community</div>
                <a href="https://www.igda.org" target="_blank" rel="noopener noreferrer" class="resources-link">IGDA</a>
<a href="https://www.reddit.com/r/gamedev" target="_blank" rel="noopener noreferrer" class="resources-link">r/gamedev</a>
              </div>
              <div class="resources-group">
                <div class="resources-group-label">Support</div>
                <a href="https://www.nami.org" target="_blank" rel="noopener noreferrer" class="resources-link">NAMI Mental Health</a>
                <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer" class="resources-link">Crisis Text Line</a>
                <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer" class="resources-link">Benefits.gov</a>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Share row -->
        <v-col cols="12" class="text-center pb-4">
          <div class="share-row">
            <span class="share-label">Share:</span>

            <v-tooltip text="Share on Twitter" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.twitter" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-x-twitter</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Share on Bluesky" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.bluesky" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-bluesky</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Share on Threads" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.threads" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-threads</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Share on Facebook" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.facebook" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-facebook</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Share on LinkedIn" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.linkedin" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-linkedin</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Share on Reddit" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" :href="shareLinks.reddit" target="_blank" rel="noopener noreferrer">
                  <v-icon>fab fa-reddit</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip :text="copied ? 'Copied!' : 'Copy text to clipboard'" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" color="#fd97be" @click="copyToClipboard">
                  <v-icon>{{ copied ? 'fas fa-check' : 'fas fa-copy' }}</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </v-col>

      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as numeralNamespace from 'numeral'
const numeral = (numeralNamespace as any).default || numeralNamespace

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const BAR_MAX_PX = 110
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()

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
  totalEmployees: null as number | null,
  prevYearEmployees: null as number | null,
  uniqueCompanies: null as number | null,
  monthlyEmployees: Array(12).fill(0) as number[],
})

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient

  try {
    const { data, error } = await supabase
      .from('layoffs')
      .select('company, employees, source, date')
      .order('date', { ascending: false })

    if (error) { console.error(error); return }

    if (data && data.length > 0) {
      state.company = data[0]
      state.daysSinceLastLayoff = calculateDaysDifference(data[0].date)

      const currentYearRows = data.filter((row) => new Date(row.date).getFullYear() === currentYear)

      state.totalEmployees = currentYearRows.reduce((sum, row) => sum + (row.employees || 0), 0)
      state.uniqueCompanies = new Set(currentYearRows.map((row) => row.company).filter(Boolean)).size

      const now = new Date()
      const prevYearRows = data.filter((row) => {
        const d = new Date(row.date)
        if (d.getFullYear() !== currentYear - 1) return false
        if (d.getMonth() > now.getMonth()) return false
        if (d.getMonth() === now.getMonth() && d.getDate() > now.getDate()) return false
        return true
      })
      state.prevYearEmployees = prevYearRows.reduce((sum, row) => sum + (row.employees || 0), 0)

      const monthly = Array(12).fill(0)
      currentYearRows.forEach((row) => {
        const m = new Date(row.date).getMonth()
        monthly[m] += row.employees || 0
      })
      state.monthlyEmployees = monthly
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
})

const maxMonthly = computed(() => Math.max(...state.monthlyEmployees.slice(0, currentMonth + 1), 1))

const worstMonth = computed(() => {
  const past = state.monthlyEmployees.slice(0, currentMonth + 1)
  const max = Math.max(...past)
  return max > 0 ? past.indexOf(max) : null
})

function barHeight(val: number): string {
  if (!val) return '3px'
  return Math.round((val / maxMonthly.value) * BAR_MAX_PX) + 'px'
}

function shortNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

const formatNumber = (number: number) => numeral(number).format('0,0')
const employeesCount = computed(() => state.company?.employees ? formatNumber(state.company.employees) : 'Unknown')
const dayText = computed(() => (state.daysSinceLastLayoff === 1 ? 'day' : 'days'))

const yoyChange = computed(() => {
  if (!state.totalEmployees || !state.prevYearEmployees) return null
  return Math.round(((state.totalEmployees - state.prevYearEmployees) / state.prevYearEmployees) * 100)
})

const shareText = computed(() =>
  `In ${currentYear}, ${state.uniqueCompanies ?? '?'} gaming studios have laid off ~${state.totalEmployees ? formatNumber(state.totalEmployees) : '?'} employees so far.\n\nTrack it at gaminglayoffs.com #GamingLayoffs #GameIndustry`
)

const shareLinks = computed(() => {
  const t = encodeURIComponent(shareText.value)
  const url = encodeURIComponent('https://gaminglayoffs.com')
  const title = encodeURIComponent(`${currentYear} Gaming Layoff Tracker`)
  return {
    twitter:  `https://twitter.com/intent/tweet?text=${t}`,
    bluesky:  `https://bsky.app/intent/compose?text=${t}`,
    threads:  `https://www.threads.net/intent/post?text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    reddit:   `https://reddit.com/submit?url=${url}&title=${title}`,
  }
})

const copied = ref(false)

async function copyToClipboard() {
  await navigator.clipboard.writeText(shareText.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style>
.home-container {
  max-width: 900px;
  margin: 0 auto;
}

.hero-text {
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  font-weight: 800;
  line-height: 1.3;
}

/* ── Stat cards ── */
.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(253, 151, 190, 0.2);
  border-top: 3px solid rgb(253, 151, 190);
  border-radius: 10px;
  padding: 28px 32px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(253, 151, 190);
}

.stat-value {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  font-family: 'Montserrat', sans-serif;
}

.stat-source {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgb(253, 151, 190);
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: 0.03em;
}
.stat-source:hover { color: #fff; }

.stat-card--aggregate {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid rgba(255, 255, 255, 0.35);
}
.stat-label--aggregate { color: rgba(255, 255, 255, 0.5); }

.stat-yoy {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 4px;
  align-self: flex-start;
}
.stat-yoy--worse {
  background: rgba(255, 80, 80, 0.15);
  color: rgb(255, 120, 120);
}
.stat-yoy--better {
  background: rgba(80, 220, 140, 0.15);
  color: rgb(80, 200, 130);
}

/* ── Chart card ── */
.chart-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(253, 151, 190, 0.15);
  border-radius: 10px;
  padding: 24px 28px 16px;
}

.chart-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(253, 151, 190);
}

.chart-worst {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
}
.chart-worst strong { color: rgba(255, 255, 255, 0.7); }

/* ── Bars ── */
.chart-bar-area {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 130px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0;
}

.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.chart-val {
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 3px;
  line-height: 1;
}

.chart-bar {
  width: 100%;
  background: rgb(253, 151, 190);
  border-radius: 3px 3px 0 0;
  opacity: 0.85;
  transition: opacity 0.2s;
  min-height: 3px;
}
.chart-bar:hover { opacity: 1; }

.chart-bar--worst {
  background: #fff;
  opacity: 1;
}

.chart-bar--future {
  background: rgba(255, 255, 255, 0.1);
  min-height: 3px;
}

/* ── Month labels ── */
.chart-months {
  display: flex;
  gap: 5px;
  margin-top: 6px;
}

.chart-month-label {
  flex: 1;
  text-align: center;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  text-transform: uppercase;
}

.chart-month-label--current {
  color: rgb(253, 151, 190);
}

/* ── Share row ── */
.share-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.share-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  margin-right: 4px;
}

/* ── CTA row ── */
.cta-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* ── Resources card ── */
.resources-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(253, 151, 190, 0.15);
  border-radius: 10px;
  padding: 20px 24px;
}

.resources-header {
  font-size: 0.95rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.resources-icon {
  color: rgb(253, 151, 190);
  font-size: 0.85rem;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .resources-grid { grid-template-columns: 1fr; gap: 12px; }
}

.resources-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resources-group-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(253, 151, 190);
  margin-bottom: 2px;
}

.resources-link {
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.15s;
}
.resources-link:hover { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
</style>
