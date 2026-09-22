export async function checkAndIncrementUsage(
  supabase: any,
  userId: string,
  feature: string,
): Promise<void> {
  const { error } = await supabase.rpc('consume_ai_usage', {
    p_user_id: userId,
    p_feature: feature,
  })

  if (!error) return

  if (
    error.message?.includes('AI_QUOTA_EXCEEDED') ||
    error.details?.includes('Daily')
  ) {
    throw Object.assign(
      new Error(`Daily limit reached. Upgrade your plan for more ${feature} requests.`),
      { status: 429 },
    )
  }

  throw Object.assign(new Error('Unable to record AI usage'), {
    status: 503,
    cause: error,
  })
}
