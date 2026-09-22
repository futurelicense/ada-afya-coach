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
      // Bypass the Web Locks API — it throws noisy uncaught "LockManager lock
      // immediately failed" errors in Firefox / multi-tab / private windows.
      // A SPA doesn't need cross-tab refresh coordination.
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  }
)

export type { User, Session } from '@supabase/supabase-js'
