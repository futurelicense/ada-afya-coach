import { createClient } from 'jsr:@supabase/supabase-js@2'

export interface AuthedContext {
  userId:   string
  profile:  Record<string, any>
  supabase: ReturnType<typeof createClient>
}

export async function requireAuth(req: Request): Promise<AuthedContext> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) throw Object.assign(new Error('Missing auth token'), { status: 401 })

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  const { data: { user }, error } = await supabaseClient.auth.getUser(token)
  if (error || !user) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('name, email, plan, fitness_level, weight, target_weight, height, age, goals, diet_preference, role')
    .eq('id', user.id)
    .single()

  // Fall back to auth email if profile row doesn't have it yet
  const merged = { email: user.email, ...(profile ?? {}) }

  return { userId: user.id, profile: merged, supabase: supabaseClient }
}
