<template>
  <v-container class="tracker-container py-8">
    <v-row>

      <!-- Header row -->
      <v-col cols="12" class="d-flex align-center pb-2">
        <v-btn to="/" variant="text" prepend-icon="fas fa-arrow-left" color="#fd97be">
          Back
        </v-btn>
        <h1 class="tracker-title flex-grow-1 text-center">Full Gaming Layoff Tracker</h1>
        <v-btn
          variant="outlined"
          color="#fd97be"
          prepend-icon="fas fa-download"
          style="font-weight: 700; font-size: 0.8rem;"
          @click="exportCSV"
        >
          Export CSV
        </v-btn>
      </v-col>

      <!-- Search -->
      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Search companies..."
          prepend-inner-icon="fas fa-magnifying-glass"
          variant="outlined"
          clearable
          hide-details
          color="#fd97be"
          class="tracker-input"
        />
      </v-col>

      <!-- Dropdown filters -->
      <v-col cols="12" sm="3">
        <v-select
          v-model="yearFilter"
          :items="yearOptions"
          label="Year"
          variant="outlined"
          clearable
          hide-details
          color="#fd97be"
          class="tracker-input"
        />
      </v-col>

      <v-col cols="12" sm="3">
        <v-autocomplete
          v-model="parentCompanyFilter"
          :items="parentCompanyOptions"
          label="Parent Company"
          variant="outlined"
          clearable
          hide-details
          color="#fd97be"
          class="tracker-input"
        />
      </v-col>

      <v-col cols="12" sm="3">
        <v-autocomplete
          v-model="studioCountryFilter"
          :items="studioCountryOptions"
          label="Studio Country"
          variant="outlined"
          clearable
          hide-details
          color="#fd97be"
          class="tracker-input"
        />
      </v-col>

      <v-col cols="12" sm="3">
        <v-autocomplete
          v-model="companyTypeFilter"
          :items="companyTypeOptions"
          label="Company Type"
          variant="outlined"
          clearable
          hide-details
          color="#fd97be"
          class="tracker-input"
        />
      </v-col>

      <!-- Table -->
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="filteredLayoffs"
          :loading="loading"
          :sort-by="[{ key: 'date', order: 'desc' }]"
          items-per-page="25"
          class="layoff-table"
          hover
          loading-text="Loading layoff data..."
          no-data-text="No layoff data found."
        >
          <template #item.date="{ item }">
            {{ formatDate(item.date) }}
          </template>

          <template #item.employees="{ item }">
            {{ item.employees ? formatNumber(item.employees) : 'Unknown' }}
          </template>

          <template #item.source="{ item }">
            <a
              v-if="item.source"
              :href="item.source"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link"
            >
              {{ parseDomain(item.source) }}
            </a>
            <span v-else class="empty-cell">—</span>
          </template>

          <template #item.notes="{ item }">
            <span v-if="item.notes">{{ item.notes }}</span>
            <span v-else class="empty-cell">—</span>
          </template>

          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>
        </v-data-table>
      </v-col>

      <!-- Totals bar -->
      <v-col v-if="!loading" cols="12">
        <div class="totals-bar">
          <span class="totals-item">
            <span class="totals-label">Layoffs shown</span>
            <span class="totals-value">{{ formatNumber(filteredLayoffs.length) }}</span>
          </span>
          <span class="totals-divider" />
          <span class="totals-item">
            <span class="totals-label">Employees affected</span>
            <span class="totals-value">~ {{ formatNumber(filteredEmployeeTotal) }}</span>
          </span>
        </div>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as numeralNamespace from 'numeral'

const numeral = (numeralNamespace as any).default || numeralNamespace

useHead({ title: 'Full Gaming Layoff Tracker | Video Game Layoffs' })

const search = ref('')
const loading = ref(true)
const layoffs = ref<Record<string, any>[]>([])

const yearFilter = ref<number | null>(null)
const parentCompanyFilter = ref<string | null>(null)
const studioCountryFilter = ref<string | null>(null)
const companyTypeFilter = ref<string | null>(null)

const HIDDEN_COLS = new Set(['id', 'new_layoff'])

const COLUMN_LABELS: Record<string, string> = {
  company: 'Company',
  employees: 'Employees Affected',
  date: 'Date',
  source: 'Source',
  notes: 'Notes',
  parent: 'Parent Company',
  studio_country: 'Studio Country',
  company_type: 'Company Type',
}

const COLUMN_ALIGN: Record<string, 'start' | 'end' | 'center'> = {
  employees: 'end',
}

const headers = computed(() => {
  if (!layoffs.value.length) return []
  return Object.keys(layoffs.value[0])
    .filter((k) => !HIDDEN_COLS.has(k))
    .map((k) => ({
      title: COLUMN_LABELS[k] ?? k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      key: k,
      sortable: k !== 'source' && k !== 'notes',
      align: COLUMN_ALIGN[k] ?? 'start',
    }))
})

function uniqueSorted(key: string): string[] {
  return [...new Set(layoffs.value.map((r) => r[key]).filter(Boolean))].sort() as string[]
}

const yearOptions = computed(() =>
  [...new Set(layoffs.value.map((r) => new Date(r.date).getFullYear()).filter(Boolean))].sort((a, b) => b - a)
)
const parentCompanyOptions = computed(() => uniqueSorted('parent'))
const studioCountryOptions = computed(() => uniqueSorted('studio_country'))
const companyTypeOptions = computed(() => uniqueSorted('company_type'))

const filteredLayoffs = computed(() => {
  const s = search.value?.toLowerCase() ?? ''
  return layoffs.value.filter((row) => {
    if (yearFilter.value && new Date(row.date).getFullYear() !== yearFilter.value) return false
    if (parentCompanyFilter.value && row.parent !== parentCompanyFilter.value) return false
    if (studioCountryFilter.value && row.studio_country !== studioCountryFilter.value) return false
    if (companyTypeFilter.value && row.company_type !== companyTypeFilter.value) return false
    if (s) return Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(s))
    return true
  })
})

const filteredEmployeeTotal = computed(() =>
  filteredLayoffs.value.reduce((sum, row) => sum + (row.employees || 0), 0)
)

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient

  const { data, error } = await supabase
    .from('layoffs')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching layoffs:', error)
  } else if (data) {
    layoffs.value = data
  }

  loading.value = false
})

const DOMAIN_NAMES: Record<string, string> = {
  'x': 'Twitter',
  'twitter': 'Twitter',
  'bsky': 'Bluesky',
  'kotaku': 'Kotaku',
  'ign': 'IGN',
  'eurogamer': 'Eurogamer',
  'polygon': 'Polygon',
  'gamespot': 'GameSpot',
  'pcgamer': 'PC Gamer',
  'gamesradar': 'GamesRadar',
  'theverge': 'The Verge',
  'rockpapershotgun': 'Rock Paper Shotgun',
  'gamesindustry': 'GamesIndustry.biz',
  'gamedeveloper': 'Game Developer',
  'venturebeat': 'VentureBeat',
  'bloomberg': 'Bloomberg',
  'variety': 'Variety',
  'hollywoodreporter': 'Hollywood Reporter',
  'axios': 'Axios',
  'techcrunch': 'TechCrunch',
  'bbc': 'BBC',
  'guardianers': 'The Guardian',
  'theguardian': 'The Guardian',
  '404media': '404 Media',
  'vgc': 'Video Games Chronicle',
  'videogameschronicle': 'Video Games Chronicle',
  'destructoid': 'Destructoid',
  'escapistmagazine': 'The Escapist',
  'gamasutra': 'Gamasutra',
  'wired': 'Wired',
  'forbes': 'Forbes',
  'wsj': 'Wall Street Journal',
  'nytimes': 'New York Times',
  'washingtonpost': 'Washington Post',
}

function parseDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const key = hostname.split('.')[0].toLowerCase()
    return DOMAIN_NAMES[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))
  } catch {
    return 'Coverage'
  }
}

const formatNumber = (n: number) => numeral(n).format('0,0')

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function exportCSV() {
  const cols = headers.value.map((h) => h.key)
  const labels = headers.value.map((h) => h.title)

  const escape = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }

  const rows = filteredLayoffs.value.map((row) => cols.map((k) => escape(row[k])).join(','))
  const csv = [labels.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gaming-layoffs${yearFilter.value ? `-${yearFilter.value}` : ''}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
.tracker-container {
  max-width: 100%;
}

.tracker-title {
  font-size: clamp(1.1rem, 3vw, 1.8rem);
  font-weight: 800;
  color: rgb(253, 151, 190);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Search + filter inputs ── */
.tracker-input .v-field__outline {
  color: rgba(253, 151, 190, 0.4) !important;
}
.tracker-input.v-input--focused .v-field__outline {
  color: rgb(253, 151, 190) !important;
}
.tracker-input .v-field__input,
.tracker-input .v-select__selection-text,
.tracker-input input {
  color: #fff !important;
}
.tracker-input .v-label {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* ── Table shell ── */
.layoff-table {
  background: rgb(26, 9, 51) !important;
  border: 1px solid rgba(253, 151, 190, 0.2);
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
}

/* ── Header row ── */
.layoff-table .v-data-table-header__content {
  color: rgb(253, 151, 190) !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.78rem;
}

.layoff-table thead tr th {
  background: rgba(253, 151, 190, 0.08) !important;
  border-bottom: 1px solid rgba(253, 151, 190, 0.3) !important;
  color: rgb(253, 151, 190) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  font-size: 0.78rem !important;
}

.layoff-table .v-data-table-header__sort-icon {
  color: rgb(253, 151, 190) !important;
}

/* ── Body rows ── */
.layoff-table tbody tr td {
  background: rgb(26, 9, 51) !important;
  color: #fff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  font-size: 0.9rem;
}

.layoff-table tbody tr:hover td {
  background: rgba(253, 151, 190, 0.07) !important;
}

/* ── Footer / pagination ── */
.layoff-table .v-data-table-footer {
  background: rgb(26, 9, 51) !important;
  border-top: 1px solid rgba(253, 151, 190, 0.2) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.layoff-table .v-data-table-footer .v-btn {
  color: rgb(253, 151, 190) !important;
}

.layoff-table .v-select__selection-text {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* ── Links ── */
.source-link {
  color: rgb(253, 151, 190);
  text-decoration: none;
  font-weight: 600;
}
.source-link:hover {
  text-decoration: underline;
}

.empty-cell {
  color: rgba(255, 255, 255, 0.3);
}

/* ── Totals bar ── */
.totals-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 20px;
  background: rgba(253, 151, 190, 0.06);
  border: 1px solid rgba(253, 151, 190, 0.2);
  border-radius: 8px;
}

.totals-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.totals-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
}

.totals-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: rgb(253, 151, 190);
  font-family: 'Montserrat', sans-serif;
}

.totals-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.12);
}
</style>
