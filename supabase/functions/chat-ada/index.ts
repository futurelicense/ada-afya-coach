import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'
import { checkAndIncrementUsage } from '../_shared/usage.ts'
import { ADA_SYSTEM_PROMPT } from '../_shared/nigerian-foods.ts'

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY'), defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' } })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    await checkAndIncrementUsage(supabase, userId, 'chat', profile.plan ?? 'free')

    const { message, sessionId, context } = await req.json()
    if (!message?.trim()) throw new Error('Empty message')

    // Load last 10 messages from this session for conversation memory
    const { data: history } = await supabase
      .from('ai_conversations')
      .select('role, content')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Save the user message before streaming starts
    await supabase.from('ai_conversations').insert({
      user_id:    userId,
      session_id: sessionId,
      role:       'user',
      content:    message,
    })

    // Build Claude messages array from history + new message
    const claudeMessages: Anthropic.MessageParam[] = [
      ...(history ?? []).map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ]

    // Streaming request
    const stream = client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          // Static persona block — cached across all requests
          type: 'text',
          text: ADA_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
        {
          // Dynamic user context — not cached (changes per user per day)
          type: 'text',
          text: `CURRENT USER CONTEXT:
Name: ${profile.name ?? 'User'}
Age: ${profile.age ?? 'unknown'} | Weight: ${profile.weight ?? '?'}kg | Height: ${profile.height ?? '?'}cm
Fitness level: ${profile.fitness_level ?? 'intermediate'}
Goals: ${(profile.goals ?? []).join(', ') || 'general fitness'}

TODAY'S STATS:
- Calories burned:      ${context?.todayStats?.caloriesBurned ?? 0}
- Workouts completed:   ${context?.todayStats?.workoutsCompleted ?? 0}
- Water intake:         ${context?.todayStats?.waterIntake ?? 0}L
- Current streak:       ${context?.streak ?? 0} days

THIS WEEK:
${(context?.weeklyStats ?? []).map((d: any) => `  ${d.day}: ${d.workouts ?? 0} workout(s), ${d.calories ?? 0} cal burned`).join('\n') || '  No data yet'}`,
        },
      ],
      messages: claudeMessages,
    })

    let fullResponse = ''

    // Stream raw text tokens back to the client
    const readable = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              fullResponse += event.delta.text
              controller.enqueue(enc.encode(event.delta.text))
            }
          }
        } finally {
          // Persist Ada's complete response once stream finishes
          if (fullResponse.trim()) {
            await supabase.from('ai_conversations').insert({
              user_id:    userId,
              session_id: sessionId,
              role:       'assistant',
              content:    fullResponse,
            })
          }
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type':           'text/plain; charset=utf-8',
        'Transfer-Encoding':      'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
