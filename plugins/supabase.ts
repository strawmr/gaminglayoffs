import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  // Access the runtime configuration
  const config = useRuntimeConfig()
  
  // Get the environment variables from runtimeConfig
  const supabaseUrl = config.public.SUPABASE_URL
  const supabaseKey = config.public.SUPABASE_KEY

  // Ensure the environment variables are defined
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key is not defined in the environment variables')
  }

  // Create the Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
})
