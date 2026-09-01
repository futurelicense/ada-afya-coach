import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'
import { checkAndIncrementUsage } from '../_shared/usage.ts'
import { llmStructured, type GroqTool } from '../_shared/llm.ts'

const workoutTool: GroqTool = {
  type: 'function',
  function: {
    name: 'create_workout_plan',
    description: 'Create a safe, structured workout plan personalised for a Nigerian user.',
    parameters: {
      type: 'object',
      required: ['name', 'description', 'duration', 'difficulty', 'exercises', 'total_calories', 'coaching_note'],
      properties: {
        name:        { type: 'string', description: 'Creative workout name' },
        description: { type: 'string', description: '1-2 sentence overview of this session' },
        duration:    { type: 'number', description: 'Total estimated minutes' },
        difficulty:  { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        warmup: {
          type: 'array',
          description: '2-3 warm-up movements',
          items: {
            type: 'object',
            required: ['name', 'duration_seconds', 'instruction'],
            properties: {
              name:             { type: 'string' },
              duration_seconds: { type: 'number' },
              instruction:      { type: 'string' },
            },
          },
        },
        exercises: {
          type: 'array',
          minItems: 4,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['name', 'sets', 'reps', 'rest_seconds', 'target_muscles', 'form_tip', 'calories_estimate'],
            properties: {
              name:                { type: 'string' },
              sets:                { type: 'number' },
              reps:                { type: 'number', description: 'Reps per set. Use seconds for timed holds.' },
              rest_seconds:        { type: 'number' },
              target_muscles:      { type: 'array', items: { type: 'string' } },
              form_tip:            { type: 'string', description: 'Most critical form cue for this exercise' },
              calories_estimate:   { type: 'number', description: 'Calories for all sets combined' },
              modification_easier: { type: 'string', description: 'Easier regression' },
              modification_harder: { type: 'string', description: 'Harder progression' },
            },
          },
        },
        cooldown: {
          type: 'array',
          description: '2-3 cooldown/stretch movements',
          items: {
            type: 'object',
            required: ['name', 'duration_seconds', 'instruction'],
            properties: {
              name:             { type: 'string' },
              duration_seconds: { type: 'number' },
              instruction:      { type: 'string' },
            },
          },
        },
        total_calories:  { type: 'number' },
        coaching_note:   { type: 'string', description: 'Short personal motivational note for this specific user' },
      },
    },
  },
}

const SYSTEM = `You are WeFit's AI fitness coach creating workouts for Nigerian users.

Context:
- Many users work out at home or basic gyms with minimal equipment
- Weather is hot and humid — include hydration reminders and rest guidance
- Available equipment unless specified: bodyweight only
- Prioritise functional movements that work in small spaces
- Always include warm-up and cooldown — injury prevention is non-negotiable
- Provide easier and harder modifications for every exercise
- Beginner: max 40 min, long rests (60-90s). Intermediate: 45-55 min, moderate rests (45-60s). Advanced: up to 60 min.
- Never prescribe exercises requiring a spotter unless heavy dumbbells are confirmed available

Call the create_workout_plan tool with a complete plan. Do not reply with prose.`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    await checkAndIncrementUsage(supabase, userId, 'workout', profile.plan ?? 'free')

    const { targetMuscles, equipment, durationMinutes } = await req.json()

    const w = await llmStructured<any>({
      maxTokens: 2800,
      reasoningEffort: 'low',
      tools: [workoutTool],
      toolName: 'create_workout_plan',
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Generate a personalised workout:
- Fitness level: ${profile.fitness_level ?? 'intermediate'}
- Primary goal: ${(profile.goals ?? []).join(', ') || 'general fitness'}
- Target muscles: ${targetMuscles?.join(', ') ?? 'full body'}
- Equipment available: ${equipment ?? 'bodyweight only'}
- Requested duration: ${durationMinutes ?? 30} minutes
- Age: ${profile.age ?? 'not provided'}
- Weight: ${profile.weight ?? 'not provided'}kg`,
        },
      ],
    })

    if (!Array.isArray(w.exercises) || w.exercises.length === 0) throw new Error('No workout generated by AI')

    const workout = {
      id:             crypto.randomUUID(),
      name:           w.name,
      description:    w.description,
      duration:       w.duration,
      difficulty:     w.difficulty,
      calories:       w.total_calories,
      caloriesBurned: 0,
      warmup:         w.warmup ?? [],
      exercises:      w.exercises.map((ex: any) => ({
        name:                ex.name,
        sets:                ex.sets,
        reps:                ex.reps,
        rest_seconds:        ex.rest_seconds,
        muscles:             Array.isArray(ex.target_muscles) ? ex.target_muscles.join(', ') : (ex.target_muscles ?? ''),
        formTip:             ex.form_tip,
        caloriesBurn:        ex.calories_estimate,
        modificationEasier:  ex.modification_easier ?? '',
        modificationHarder:  ex.modification_harder ?? '',
        completed:           false,
      })),
      cooldown:      w.cooldown ?? [],
      coachingNote:  w.coaching_note,
      date:          new Date().toISOString().split('T')[0],
      completed:     false,
    }

    return new Response(JSON.stringify(workout), {
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
