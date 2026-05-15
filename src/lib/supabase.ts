import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[WeFit] Supabase env vars missing. Copy .env.example → .env and fill in your project values.\n' +
    'https://supabase.com/dashboard/project/_/settings/api'
  )
}

export const supabase = createClient(
  url  ?? 'https://placeholder.supabase.co',
  key  ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'wefit_session',
    },
  }
)

export type { User, Session } from '@supabase/supabase-js'
