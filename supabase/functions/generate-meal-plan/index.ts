import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'
import { checkAndIncrementUsage } from '../_shared/usage.ts'
import { NIGERIAN_FOOD_KNOWLEDGE_BRIEF } from '../_shared/nigerian-foods.ts'
import { llmStructured, type GroqTool } from '../_shared/llm.ts'

const mealPlanTool: GroqTool = {
  type: 'function',
  function: {
    name: 'create_meal_plan',
    description: 'Create a nutritionally balanced Nigerian meal plan for the user.',
    parameters: {
      type: 'object',
      required: ['meals', 'total_calories', 'macro_summary', 'shopping_list', 'hydration_tip'],
      properties: {
        meals: {
          type: 'array',
          minItems: 3,
          maxItems: 5,
          items: {
            type: 'object',
            required: ['name', 'meal_type', 'calories', 'protein', 'carbs', 'fats'],
            properties: {
              name:             { type: 'string' },
              meal_type:        { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
              calories:         { type: 'number' },
              protein:          { type: 'number' },
              carbs:            { type: 'number' },
              fats:             { type: 'number' },
              ingredients:      { type: 'array', items: { type: 'string' }, description: 'Main ingredients' },
              preparation_time: { type: 'string', description: 'e.g. 15 minutes' },
              quick_recipe:     { type: 'string', description: '2-3 sentence preparation guide' },
              healthier_swap:   { type: 'string', description: 'Optional lighter version of this meal' },
              best_time_to_eat: { type: 'string', description: 'e.g. 7-8am, post-workout' },
            },
          },
        },
        total_calories: { type: 'number' },
        macro_summary: {
          type: 'object',
          required: ['protein', 'carbs', 'fats'],
          properties: {
            protein: { type: 'number' },
            carbs:   { type: 'number' },
            fats:    { type: 'number' },
          },
        },
        shopping_list:      { type: 'array', items: { type: 'string' }, description: 'Ingredients to buy today' },
        hydration_tip:      { type: 'string' },
        meal_prep_tip:      { type: 'string' },
        nutrition_warning:  { type: 'string', description: 'Health caution if relevant e.g. for diabetics. Empty string if none.' },
      },
    },
  },
}

const SYSTEM = `You are WeFit's Nigerian nutrition coach. Create meal plans using ONLY real Nigerian foods that are locally available and affordable.

Rules:
- Never suggest imported superfoods or unavailable ingredients
- Meals must be achievable in a typical Nigerian kitchen
- Balance macros for the user's specific goal
- Never recommend below 1,200 cal/day for women or 1,500 for men
- Maximum 500 calorie deficit from TDEE for weight loss
- For diabetics or hypertensive users: always include a nutrition_warning recommending doctor consultation
- Prefer cooking methods: boiling, grilling, steaming over deep frying

Call the create_meal_plan tool with a complete plan. Do not reply with prose.

${NIGERIAN_FOOD_KNOWLEDGE_BRIEF}`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    await checkAndIncrementUsage(supabase, userId, 'meal', profile.plan ?? 'free')

    const { calorieTarget, dietPreference, healthNotes } = await req.json()

    const plan = await llmStructured<any>({
      maxTokens: 2600,
      reasoningEffort: 'low',
      tools: [mealPlanTool],
      toolName: 'create_meal_plan',
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Create a meal plan for:
- Goal: ${(profile.goals ?? []).join(', ') || 'general health'}
- Calorie target: ${calorieTarget ?? 1800} cal/day
- Diet restriction: ${dietPreference ?? profile.diet_preference ?? 'none'}
- Fitness level: ${profile.fitness_level ?? 'intermediate'}
- Weight: ${profile.weight ?? '?'}kg → Target: ${profile.target_weight ?? '?'}kg
- Health notes: ${healthNotes ?? 'none'}`,
        },
      ],
    })

    if (!Array.isArray(plan.meals) || plan.meals.length === 0) throw new Error('No meal plan generated')
    const today = new Date().toISOString().split('T')[0]

    const meals = plan.meals.map((m: any, i: number) => ({
      id:              `meal-${Date.now()}-${i}`,
      date:            today,
      mealType:        m.meal_type,
      name:            m.name,
      calories:        m.calories,
      protein:         m.protein,
      carbs:           m.carbs,
      fats:            m.fats,
      ingredients:     m.ingredients ?? [],
      quickRecipe:     m.quick_recipe ?? '',
      healthierSwap:   m.healthier_swap ?? '',
      bestTimeToEat:   m.best_time_to_eat ?? '',
      eaten:           false,
    }))

    return new Response(JSON.stringify({
      meals,
      totalCalories:    plan.total_calories,
      macroSummary:     plan.macro_summary,
      shoppingList:     plan.shopping_list ?? [],
      hydrationTip:     plan.hydration_tip ?? '',
      mealPrepTip:      plan.meal_prep_tip ?? '',
      nutritionWarning: plan.nutrition_warning ?? '',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    console.error('generate-meal-plan error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
