import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'
import { checkAndIncrementUsage } from '../_shared/usage.ts'
import { llmVision } from '../_shared/llm.ts'

const FOOD_SCAN_PROMPT = `You are a Nigerian food identification expert. Identify the food(s) in this image accurately.
Return ONLY a valid JSON object — no markdown, no explanation. Use this exact structure:

{
  "foods": [
    {
      "id": "kebab-case-slug",
      "name": "English food name",
      "localName": "Yoruba/Igbo/Hausa name if applicable",
      "category": "meal|snack|beverage|packaged",
      "calories": 350,
      "protein": 12,
      "carbs": 45,
      "fats": 14,
      "fiber": 3,
      "sugar": 4,
      "sodium": 600,
      "saturatedFat": 4,
      "portionSize": "1 serving (250g)",
      "ingredients": ["ingredient1", "ingredient2"],
      "allergens": ["peanuts"],
      "healthFlags": ["high-protein", "moderate-sodium"],
      "commonPreparations": ["with soup", "as side dish"]
    }
  ],
  "confidence": "high|medium|low"
}

If you cannot confidently identify the food, still return your best guess with "confidence": "low".
Nutritional values should be per the portionSize shown, not per 100g.`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    await checkAndIncrementUsage(supabase, userId, 'scan', profile.plan ?? 'free')

    const { imageBase64, mediaType = 'image/jpeg' } = await req.json()
    if (!imageBase64) throw new Error('No image data provided')

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeMediaType = validTypes.includes(mediaType) ? mediaType : 'image/jpeg'

    const raw = await llmVision({
      imageBase64,
      mediaType: safeMediaType,
      prompt:    FOOD_SCAN_PROMPT,
      maxTokens: 1024,
    })

    // Extract JSON even if the model wraps it in code fences
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Could not parse food identification response')

    const result = JSON.parse(match[0])

    return new Response(JSON.stringify(result), {
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
