import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'
import { checkAndIncrementUsage } from '../_shared/usage.ts'
import { llmStructured, type GroqTool } from '../_shared/llm.ts'

const analysisTool: GroqTool = {
  type: 'function',
  function: {
    name: 'analyze_fitness_progress',
    description: "Analyse a Nigerian user's weekly fitness data and return personalised insights.",
    parameters: {
      type: 'object',
      required: ['summary', 'strengths', 'areas_to_improve', 'recommendations', 'weekly_score'],
      properties: {
        summary: {
          type: 'string',
          description: '2-3 sentences summarising the week in an encouraging tone',
        },
        strengths: {
          type: 'array',
          items: { type: 'string' },
          description: '2-3 specific things the user did well this week',
        },
        areas_to_improve: {
          type: 'array',
          items: { type: 'string' },
          description: '1-2 honest areas that need attention — phrase constructively',
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          description: '2-3 concrete, actionable tips for next week specific to Nigerian lifestyle',
        },
        weekly_score: {
          type: 'number',
          description: 'Overall score 0-100 based on consistency, goal alignment, and effort',
        },
        next_week_focus: {
          type: 'string',
          description: 'The single most important thing to focus on next week',
        },
      },
    },
  },
}

const SYSTEM = `You are Coach Ada, WeFit's Nigerian fitness coach.
Analyse users' weekly data and give honest, encouraging, culturally relevant feedback.
Always suggest improvements that are realistic in a Nigerian lifestyle (budget food, home workouts, busy schedules, hot weather).
Be specific — reference the actual numbers in your analysis.
Call the analyze_fitness_progress tool with your analysis. Do not reply with prose.`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    await checkAndIncrementUsage(supabase, userId, 'analysis', profile.plan ?? 'free')

    const { weeklyData, todayStats } = await req.json()

    const totalWorkouts  = (weeklyData ?? []).reduce((s: number, d: any) => s + (d.workouts ?? 0), 0)
    const totalCalories  = (weeklyData ?? []).reduce((s: number, d: any) => s + (d.calories ?? 0), 0)
    const avgWater       = weeklyData?.length
      ? (weeklyData.reduce((s: number, d: any) => s + (d.water ?? 0), 0) / weeklyData.length).toFixed(1)
      : 0

    const analysis = await llmStructured<any>({
      maxTokens: 1200,
      tools: [analysisTool],
      toolName: 'analyze_fitness_progress',
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Analyse this week for ${profile.name ?? 'the user'}:

Profile:
- Goal: ${(profile.goals ?? []).join(', ') || 'general fitness'}
- Fitness level: ${profile.fitness_level ?? 'intermediate'}
- Weight: ${profile.weight ?? '?'}kg → Target: ${profile.target_weight ?? '?'}kg

Weekly summary:
- Workouts completed: ${totalWorkouts} out of 7 days
- Total calories burned: ${totalCalories}
- Average daily water: ${avgWater}L
- Today's calories burned: ${todayStats?.caloriesBurned ?? 0}

Day-by-day breakdown:
${(weeklyData ?? []).map((d: any) =>
  `  ${d.day}: ${d.workouts ?? 0} workout(s), ${d.calories ?? 0} cal burned, ${d.water ?? 0}L water`
).join('\n') || '  No daily data'}`,
        },
      ],
    })

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
