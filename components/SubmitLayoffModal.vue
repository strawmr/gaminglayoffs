<template>
  <v-dialog v-model="open" max-width="520" persistent>
    <template #activator="{ props }">
      <slot name="activator" :props="props" />
    </template>

    <v-card class="submit-card">
      <v-card-title class="submit-title">Submit a Layoff</v-card-title>
      <v-card-subtitle class="submit-subtitle">Know about a layoff that isn't listed? Submit it here and we'll review it.</v-card-subtitle>

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field
            v-model="form.company"
            label="Company / Studio *"
            variant="outlined"
            color="#fd97be"
            class="submit-input mb-3"
            :rules="[required]"
            :disabled="loading || success"
          />
          <v-text-field
            v-model="form.date"
            label="Date *"
            type="date"
            variant="outlined"
            color="#fd97be"
            class="submit-input mb-3"
            :rules="[required]"
            :disabled="loading || success"
          />
          <v-text-field
            v-model="form.employees"
            label="Employees Affected"
            placeholder="e.g. 200 or ~50"
            variant="outlined"
            color="#fd97be"
            class="submit-input mb-3"
            :disabled="loading || success"
          />
          <v-select
            v-model="form.event_type"
            :items="['Layoff', 'Studio Closure']"
            label="Event Type *"
            variant="outlined"
            color="#fd97be"
            class="submit-input mb-3"
            :rules="[required]"
            :disabled="loading || success"
          />
          <v-text-field
            v-model="form.source"
            label="Source URL *"
            placeholder="https://..."
            variant="outlined"
            color="#fd97be"
            class="submit-input mb-3"
            :rules="[required, validUrl]"
            :disabled="loading || success"
          />
          <v-textarea
            v-model="form.notes"
            label="Notes"
            placeholder="Any additional context..."
            variant="outlined"
            color="#fd97be"
            class="submit-input"
            rows="3"
            auto-grow
            :disabled="loading || success"
          />
        </v-form>

        <v-alert v-if="success" type="success" class="mt-4" color="#fd97be" variant="tonal">
          Thanks! We'll review your submission shortly.
        </v-alert>
        <v-alert v-if="error" type="error" class="mt-4" variant="tonal">
          Something went wrong. Please try again.
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" color="rgba(255,255,255,0.5)" :disabled="loading" @click="close">
          {{ success ? 'Close' : 'Cancel' }}
        </v-btn>
        <v-btn
          v-if="!success"
          variant="flat"
          base-color="#fd97be"
          style="font-weight: 800;"
          :loading="loading"
          @click="submit"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useNuxtApp } from '#app'
import type { SupabaseClient } from '@supabase/supabase-js'

const open = ref(false)
const loading = ref(false)
const success = ref(false)
const error = ref(false)
const formRef = ref<any>(null)

const form = reactive({ company: '', date: '', employees: '', event_type: 'Layoff', source: '', notes: '' })

const required = (v: string) => !!v?.trim() || 'Required'
const validUrl = (v: string) => {
  try { new URL(v); return true } catch { return 'Must be a valid URL' }
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = false

  try {
    const { $supabase } = useNuxtApp()
    const supabase = $supabase as SupabaseClient

    const { error: sbError } = await supabase.from('submissions').insert({
      company: form.company.trim(),
      date: form.date,
      employees: form.employees.trim() || null,
      event_type: form.event_type,
      source: form.source.trim(),
      notes: form.notes.trim() || null,
    })

    if (sbError) throw sbError
    success.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.company = ''
  form.date = ''
  form.employees = ''
  form.event_type = 'Layoff'
  form.source = ''
  form.notes = ''
  success.value = false
  error.value = false
  formRef.value?.reset()
}

function close() {
  open.value = false
}

watch(open, (val) => {
  if (!val) setTimeout(resetForm, 300)
})
</script>

<style>
.submit-card {
  background: rgb(26, 9, 51) !important;
  border: 1px solid rgba(253, 151, 190, 0.3) !important;
  border-radius: 12px !important;
}

.submit-title {
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: rgb(253, 151, 190) !important;
  padding-top: 24px !important;
  padding-left: 24px !important;
}

.submit-subtitle {
  font-size: 0.82rem !important;
  color: rgba(255, 255, 255, 0.5) !important;
  padding-left: 24px !important;
  white-space: normal !important;
}

.submit-input .v-field__outline { color: rgba(253, 151, 190, 0.4) !important; }
.submit-input.v-input--focused .v-field__outline { color: rgb(253, 151, 190) !important; }
.submit-input .v-field__input,
.submit-input input,
.submit-input textarea { color: #fff !important; }
.submit-input .v-label { color: rgba(255, 255, 255, 0.5) !important; }
</style>
