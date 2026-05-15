import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY'), defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' } })

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
    await requireAuth(req)

    const { imageBase64, mediaType = 'image/jpeg' } = await req.json()
    if (!imageBase64) throw new Error('No image data provided')

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeMediaType = validTypes.includes(mediaType) ? mediaType : 'image/jpeg'

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type:       'base64',
              media_type: safeMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data:       imageBase64,
            },
          },
          { type: 'text', text: FOOD_SCAN_PROMPT },
        ],
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Extract JSON even if Claude wraps it in code fences
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
