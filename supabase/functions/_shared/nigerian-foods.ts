// Condensed food reference (~600 tokens) for the meal-plan function so each
// request stays well under Groq's free-tier tokens-per-minute budget.
export const NIGERIAN_FOOD_KNOWLEDGE_BRIEF = `
NIGERIAN FOOD QUICK REFERENCE (approx per standard serving)

BREAKFAST: Akara 6pc ~285cal (P14/C32/F11) · Moi Moi 1 wrap ~220 (P12/C28/F6) · Pap 250ml ~120 (P2/C26) ·
Boiled plantain 1 ~180 · Boiled yam 150g ~177 · Bread+2 eggs ~340 (P18) · Oats+groundnut ~310 (weight loss) ·
Indomie+egg ~430 (processed).

LUNCH: Jollof rice 1cup ~350 · Jollof+grilled chicken ~570 (P40) · Fried rice+grilled fish ~490 (P32) ·
Beans+plantain ~420 (fiber, budget) · Egusi+eba ~580 (high fat) · Ofada+ayamase ~510 (lower GI) ·
Beans porridge ~320 (P16) · White rice+stew ~480.

DINNER (keep lighter for weight loss): Efo riro 1cup ~280 (P20, iron) · Okra soup+eba 150g ~410 ·
Pepper soup goat ~220 / catfish ~180 (low carb, lean) · Grilled tilapia 200g+salad ~320 (P38, best for cut) ·
Vegetable soup+small eba ~320.

SNACKS: Groundnuts 30g ~170 (healthy fat) · Banana ~90 (pre-workout) · Garden egg ~25 (diet) ·
Tiger nuts 60g ~240 · Coconut water 250ml ~46 (electrolytes) · Boli ~150 · Suya 100g ~200 (P26, post-workout).

SWAPS: eba/fufu→oat fufu (−80cal,+fiber) · palm oil 3tbsp→1tbsp (−360/wk) · fried→boiled/grilled fish or plantain ·
white rice→ofada · soft drinks→zobo/kunu.

RULES: hot climate → 3–3.5L water/day. Diabetes: cut white rice, no fufu at dinner, prefer ofada/beans/okra.
Hypertension: less palm oil & salt, more veg. Muslim users: no pork/alcohol extracts. Lactose: tiger nut / soy milk.
`

// Nigerian food knowledge base — full reference.
// ~2800 tokens of verified nutritional data for common Nigerian dishes.
export const NIGERIAN_FOOD_KNOWLEDGE = `
NIGERIAN FOOD DATABASE — Nutritional Reference (per standard serving)

BREAKFAST:
- Akara (bean fritters, 6 pieces): 285 cal | P:14g | C:32g | F:11g | High fiber & plant protein
- Moi Moi (steamed bean pudding, 1 wrap ~150g): 220 cal | P:12g | C:28g | F:6g | Excellent protein source
- Pap/Akamu (fermented corn porridge, 250ml): 120 cal | P:2g | C:26g | F:1g | Light, probiotic
- Plantain (boiled, 1 medium): 180 cal | P:2g | C:47g | F:0g | High potassium, pre-workout energy
- Yam (boiled white, 150g): 177 cal | P:2g | C:42g | F:0g | Complex carbs, filling
- Yam (fried, 150g): 290 cal | P:2g | C:42g | F:12g | Higher calorie option
- Bread + 2 eggs: 340 cal | P:18g | C:36g | F:14g | Convenient protein
- Oatmeal + groundnut (local variation, 200g + 30g): 310 cal | P:11g | C:48g | F:9g | Great for weight loss
- Agege bread + Akara: 380 cal | P:16g | C:52g | F:12g | Common Lagos breakfast
- Indomie noodles + egg (1 pack + 2 eggs): 430 cal | P:22g | C:56g | F:14g | Quick but processed

LUNCH:
- Jollof Rice (1 cup, no protein): 350 cal | P:7g | C:72g | F:5g
- Jollof Rice + Grilled Chicken (200g chicken): 570 cal | P:40g | C:72g | F:12g | Complete meal
- Jollof Rice + Fried Chicken: 680 cal | P:38g | C:72g | F:24g | Higher calorie
- Fried Rice + Grilled Fish (tilapia 150g): 490 cal | P:32g | C:65g | F:10g
- Beans + Plantain (1 cup beans + 1 plantain): 420 cal | P:18g | C:74g | F:7g | High fiber, budget-friendly
- Egusi Soup (1 cup) + Eba (200g): 580 cal | P:22g | C:78g | F:22g | High fat from palm oil & egusi
- Egusi Soup + Semovita (200g): 560 cal | P:20g | C:82g | F:18g
- Ofe Onugbu (bitter leaf) + Fufu (200g): 520 cal | P:25g | C:68g | F:18g
- Afang Soup + Wheat meal (200g): 490 cal | P:28g | C:62g | F:16g | High protein from seafood
- Ofada Rice + Ayamase sauce (1.5 cups): 510 cal | P:18g | C:85g | F:12g | Lower GI than parboiled rice
- Banga Soup + Starch (200g): 580 cal | P:20g | C:72g | F:24g | High in palm oil
- Beans Porridge (1 cup): 320 cal | P:16g | C:52g | F:6g | High fiber, vegetarian
- White Rice + Stew (1 cup + 1 cup): 480 cal | P:22g | C:78g | F:10g

DINNER (lighter options preferred for weight loss):
- Efo Riro (spinach/vegetable stew, 1 cup): 280 cal | P:20g | C:12g | F:18g | High iron & antioxidants
- Okra Soup (1 cup) + Eba (150g): 410 cal | P:18g | C:62g | F:12g
- Pepper Soup — goat (1 bowl 300ml): 220 cal | P:28g | C:8g | F:9g | Low carb, anti-inflammatory spices
- Pepper Soup — catfish: 180 cal | P:26g | C:5g | F:6g | Excellent lean protein
- Grilled fish (tilapia, 200g) + salad: 320 cal | P:38g | C:12g | F:10g | Best for weight loss
- Ugwu stir-fry + boiled yam (150g): 380 cal | P:16g | C:58g | F:8g
- Oha Soup + Fufu (150g): 480 cal | P:22g | C:65g | F:16g
- Vegetable soup + small Eba (100g): 320 cal | P:18g | C:42g | F:12g | Light dinner option
- Garden egg stew + boiled rice (1 cup): 380 cal | P:14g | C:68g | F:8g

SNACKS:
- Groundnuts/peanuts (1 handful, 30g): 170 cal | P:8g | C:5g | F:14g | Healthy fats, filling
- Banana (1 medium): 90 cal | P:1g | C:23g | F:0g | Best pre-workout snack
- Garden egg (2 medium): 25 cal | P:1g | C:5g | F:0g | Very low calorie, great for dieting
- Tiger nuts (1 cup, 60g): 240 cal | P:4g | C:34g | F:10g | Probiotic, dairy-free alternative
- Coconut water (1 cup, 250ml): 46 cal | P:2g | C:9g | F:0g | Natural electrolytes — better than sports drinks
- Roasted corn: 130 cal | P:3g | C:29g | F:1g | Popular roadside snack, good option
- Boli (roasted plantain, 1 medium): 150 cal | P:2g | C:38g | F:1g | Healthier than fried
- Chin chin (handful 40g): 200 cal | P:4g | C:28g | F:9g | High sugar — limit for weight loss
- Suya (100g beef): 200 cal | P:26g | C:4g | F:10g | High protein, good post-workout

HEALTHIER SWAPS (important for weight management):
- White Eba/Fufu → Oat fufu: saves ~80 cal, adds 6g fiber
- Regular palm oil (3 tbsp) → 1 tbsp: saves ~360 cal/week
- Fried plantain → Boiled/boli: saves ~80-110 cal per serving
- White rice → Ofada rice: lower glycemic index, more fiber
- Soft drinks → Zobo/kunu: saves ~150 cal, adds antioxidants
- Full fat milk → Tiger nut milk: lactose-free, similar calories
- Fried fish → Grilled/peppered fish: saves ~100-150 cal
- Fried chicken → Grilled/suya: saves ~150-200 cal

MEAL TIMING FOR NIGERIAN FITNESS GOALS:
Pre-workout (30-45 min before): Banana, roasted corn, or light Akara
Post-workout (within 30 min): Moi Moi + pap, boiled eggs + yam, or beans porridge
Weight loss: Larger lunch by 12-2pm, light dinner by 6-7pm, avoid heavy carbs after 7pm
Muscle gain: Add extra beans/eggs to all meals, groundnut as snack, increase Moi Moi frequency
Intermittent fasting compatible meals: Pepper soup, garden egg stew, grilled fish + salad

HYDRATION IN NIGERIAN CLIMATE:
- Hot/humid weather means 3-3.5L water daily (not 2L like temperate climates)
- Coconut water for electrolytes after outdoor workouts
- Avoid Zobo on workout days if diuretic sensitive
- Morning cup of warm water before breakfast — traditional practice, science-supported

DIETARY RESTRICTIONS COMMON IN NIGERIA:
- Muslim users: No pork, no alcohol-based extracts
- Many Igbo/Yoruba dishes are naturally pork-free — note when relevant
- Lactose sensitivity: common — recommend tiger nut milk, soy alternatives
- Type 2 diabetes (high prevalence): Reduce white rice portions, avoid fufu at dinner, prefer ofada rice, beans, okra (mucilaginous — helps blood sugar)
- Hypertension (very high prevalence): Reduce palm oil, reduce salt, avoid processed foods, increase vegetables
- Sickle cell: Increase folate foods (ugwu, spinach, beans), stay hydrated, avoid extreme workout intensity

FOOD SAFETY NOTES:
- Always wash Nigerian leafy vegetables (ugwu, efo, afang) thoroughly
- Fermented foods (ogi/pap, locust beans/dawadawa) are beneficial probiotics
- Palm oil is nutritious in moderation — not all fat is bad
- Ponmo (cow skin) has minimal nutritional value — note when relevant
`

export const ADA_SYSTEM_PROMPT = `
You are Coach Ada, WeFit's AI fitness and wellness coach for Nigerians. You are warm, encouraging, and direct — like a knowledgeable friend, not a formal doctor.

YOUR PERSONALITY:
- Speak naturally. Occasionally use light Nigerian expressions ("Oya let's go!", "You dey try!", "E go be!") but don't overdo it.
- Be concise. 2-4 short paragraphs max unless the user asks for a detailed plan.
- Never be condescending. Users know their bodies.
- Use emojis sparingly — 1-2 per response maximum.

YOUR EXPERTISE:
- Nigerian cuisine nutrition (you know every dish in the database below deeply)
- Effective home and gym workouts suited to Nigerian heat and humidity
- Weight loss and muscle gain strategies that respect local food culture and budgets
- Building sustainable habits, not crash programmes
- Motivating users who are struggling

ABSOLUTE SAFETY RULES — NEVER BREAK THESE:
1. Chest pain, difficulty breathing, severe dizziness, numbness during exercise → STOP and tell them to see a doctor immediately. No fitness advice.
2. Never recommend below 1,200 cal/day for women or 1,500 for men.
3. Never diagnose any medical condition.
4. If user mentions diabetes or hypertension → recommend consulting their doctor before following AI meal plans. You can still give general guidance.
5. Never recommend unregulated supplements or "fat burners".
6. Medication questions → defer to a pharmacist or doctor.

WHAT YOU KNOW:
- The user's WeFit profile and today's stats are provided in each message.
- Reference this data to give genuinely personalised advice, not generic tips.
- If you don't have data for something, say so — don't make it up.

WHAT YOU CANNOT DO:
- Access real-time info (news, prices, live events)
- Book appointments or place orders
- Analyse photos
- Remember previous conversations (each session starts fresh unless history is provided)
`
