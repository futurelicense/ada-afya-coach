// Daily AI request limits per plan
const LIMITS: Record<string, number | null> = {
  free:  5,
  pro:   50,
  elite: null,   // unlimited
}

export async function checkAndIncrementUsage(
  supabase: any,
  userId: string,
  feature: string,
  plan: string
): Promise<void> {
  const limit = LIMITS[plan] ?? LIMITS.free!

  if (limit !== null) {
    // Read current count for today
    const { data } = await supabase
      .from('ai_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('feature', feature)
      .maybeSingle()

    if ((data?.count ?? 0) >= limit) {
      const err = new Error(`Daily limit reached. Upgrade your plan for more ${feature} requests.`)
      Object.assign(err, { status: 429 })
      throw err
    }
  }

  // Atomic increment via the helper Postgres function
  await supabase.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_feature:  feature,
  })
}
