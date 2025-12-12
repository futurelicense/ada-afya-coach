// Nigerian & African Food Database with nutritional information
export interface FoodItem {
  id: string;
  name: string;
  localName?: string;
  category: 'meal' | 'snack' | 'beverage' | 'packaged';
  origin: 'nigerian' | 'african' | 'international';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat: number;
  ingredients: string[];
  allergens: string[];
  commonPreparations: string[];
  healthFlags: string[];
  portionSize: string;
  image?: string;
}

export interface UserHealthProfile {
  dietPreference: 'balanced' | 'low-carb' | 'high-protein' | 'vegetarian' | 'vegan' | 'keto';
  healthConditions: string[];
  allergies: string[];
  wellnessGoals: string[];
  dailyCalorieLimit?: number;
  dailySodiumLimit?: number;
  dailySugarLimit?: number;
}

export interface ScanResult {
  food: FoodItem;
  verdict: 'suitable' | 'caution' | 'not-recommended';
  reasonsForYou: string[];
  nutritionFlags: string[];
  ingredientAlerts: string[];
  portionGuidance: string;
  alternatives: FoodItem[];
  confidence: 'high' | 'medium' | 'low';
  isEstimated: boolean;
}

// Comprehensive Nigerian & African Food Database
const nigerianFoodDatabase: FoodItem[] = [
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    localName: 'Jollof',
    category: 'meal',
    origin: 'nigerian',
    calories: 350,
    protein: 8,
    carbs: 55,
    fats: 12,
    fiber: 3,
    sugar: 4,
    sodium: 680,
    saturatedFat: 3,
    ingredients: ['rice', 'tomatoes', 'onions', 'pepper', 'vegetable oil', 'stock cubes', 'thyme'],
    allergens: [],
    commonPreparations: ['party style', 'smoky', 'with chicken', 'with fish'],
    healthFlags: ['moderate-sodium', 'refined-carbs'],
    portionSize: '1 cup (250g)',
  },
  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    localName: 'Ofe Egusi',
    category: 'meal',
    origin: 'nigerian',
    calories: 420,
    protein: 22,
    carbs: 12,
    fats: 35,
    fiber: 5,
    sugar: 3,
    sodium: 750,
    saturatedFat: 8,
    ingredients: ['melon seeds', 'palm oil', 'leafy vegetables', 'stockfish', 'crayfish', 'ogiri', 'meat'],
    allergens: ['fish', 'shellfish'],
    commonPreparations: ['with spinach', 'with bitter leaf', 'with pounded yam'],
    healthFlags: ['high-fat', 'high-protein'],
    portionSize: '1 bowl (300ml)',
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro',
    localName: 'Efo Riro',
    category: 'meal',
    origin: 'nigerian',
    calories: 380,
    protein: 18,
    carbs: 8,
    fats: 32,
    fiber: 6,
    sugar: 2,
    sodium: 620,
    saturatedFat: 10,
    ingredients: ['spinach', 'palm oil', 'locust beans', 'crayfish', 'assorted meat', 'stockfish', 'peppers'],
    allergens: ['fish', 'shellfish'],
    commonPreparations: ['with assorted meat', 'with fish', 'vegetarian'],
    healthFlags: ['high-fat', 'iron-rich', 'vitamin-rich'],
    portionSize: '1 bowl (300ml)',
  },
  {
    id: 'amala',
    name: 'Amala',
    localName: 'Àmàlà',
    category: 'meal',
    origin: 'nigerian',
    calories: 280,
    protein: 3,
    carbs: 68,
    fats: 1,
    fiber: 4,
    sugar: 2,
    sodium: 15,
    saturatedFat: 0,
    ingredients: ['yam flour', 'water'],
    allergens: [],
    commonPreparations: ['with ewedu', 'with gbegiri', 'with efo'],
    healthFlags: ['high-carb', 'low-fat', 'gluten-free'],
    portionSize: '1 wrap (200g)',
  },
  {
    id: 'fufu',
    name: 'Fufu',
    localName: 'Fufu',
    category: 'meal',
    origin: 'nigerian',
    calories: 330,
    protein: 2,
    carbs: 80,
    fats: 0.5,
    fiber: 3,
    sugar: 1,
    sodium: 10,
    saturatedFat: 0,
    ingredients: ['cassava', 'water'],
    allergens: [],
    commonPreparations: ['pounded', 'with soup'],
    healthFlags: ['high-carb', 'low-protein'],
    portionSize: '1 wrap (200g)',
  },
  {
    id: 'moi-moi',
    name: 'Moi Moi',
    localName: 'Moin Moin',
    category: 'meal',
    origin: 'nigerian',
    calories: 180,
    protein: 12,
    carbs: 22,
    fats: 6,
    fiber: 5,
    sugar: 2,
    sodium: 320,
    saturatedFat: 1,
    ingredients: ['black-eyed peas', 'peppers', 'onions', 'palm oil', 'eggs', 'crayfish'],
    allergens: ['eggs', 'shellfish'],
    commonPreparations: ['with fish', 'with eggs', 'plain'],
    healthFlags: ['high-protein', 'high-fiber'],
    portionSize: '1 piece (150g)',
  },
  {
    id: 'akara',
    name: 'Akara',
    localName: 'Àkàrà',
    category: 'snack',
    origin: 'nigerian',
    calories: 220,
    protein: 10,
    carbs: 18,
    fats: 14,
    fiber: 4,
    sugar: 2,
    sodium: 280,
    saturatedFat: 2,
    ingredients: ['black-eyed peas', 'onions', 'peppers', 'vegetable oil'],
    allergens: [],
    commonPreparations: ['fried', 'with pap', 'with bread'],
    healthFlags: ['fried', 'moderate-fat'],
    portionSize: '3 pieces (120g)',
  },
  {
    id: 'suya',
    name: 'Suya',
    localName: 'Suya',
    category: 'snack',
    origin: 'nigerian',
    calories: 320,
    protein: 28,
    carbs: 8,
    fats: 20,
    fiber: 2,
    sugar: 3,
    sodium: 890,
    saturatedFat: 6,
    ingredients: ['beef', 'suya spice', 'groundnut powder', 'ginger', 'onions'],
    allergens: ['peanuts'],
    commonPreparations: ['with onions', 'with cabbage', 'with tomatoes'],
    healthFlags: ['high-protein', 'high-sodium', 'contains-peanuts'],
    portionSize: '6 sticks (200g)',
  },
  {
    id: 'pounded-yam',
    name: 'Pounded Yam',
    localName: 'Iyan',
    category: 'meal',
    origin: 'nigerian',
    calories: 310,
    protein: 4,
    carbs: 72,
    fats: 0.5,
    fiber: 4,
    sugar: 1,
    sodium: 20,
    saturatedFat: 0,
    ingredients: ['yam', 'water'],
    allergens: [],
    commonPreparations: ['with egusi', 'with efo', 'with ogbono'],
    healthFlags: ['high-carb', 'low-fat', 'gluten-free'],
    portionSize: '1 wrap (200g)',
  },
  {
    id: 'fried-rice',
    name: 'Nigerian Fried Rice',
    localName: 'Fried Rice',
    category: 'meal',
    origin: 'nigerian',
    calories: 380,
    protein: 10,
    carbs: 52,
    fats: 15,
    fiber: 4,
    sugar: 5,
    sodium: 720,
    saturatedFat: 4,
    ingredients: ['rice', 'mixed vegetables', 'liver', 'shrimps', 'vegetable oil', 'curry', 'thyme'],
    allergens: ['shellfish'],
    commonPreparations: ['party style', 'with chicken', 'with coleslaw'],
    healthFlags: ['moderate-sodium', 'contains-shellfish'],
    portionSize: '1 cup (250g)',
  },
  {
    id: 'ogbono-soup',
    name: 'Ogbono Soup',
    localName: 'Ofe Ogbono',
    category: 'meal',
    origin: 'nigerian',
    calories: 360,
    protein: 18,
    carbs: 10,
    fats: 28,
    fiber: 4,
    sugar: 2,
    sodium: 680,
    saturatedFat: 12,
    ingredients: ['ogbono seeds', 'palm oil', 'stockfish', 'meat', 'crayfish', 'vegetables'],
    allergens: ['fish', 'shellfish'],
    commonPreparations: ['with okra', 'plain', 'with spinach'],
    healthFlags: ['high-fat', 'high-protein'],
    portionSize: '1 bowl (300ml)',
  },
  {
    id: 'pepper-soup',
    name: 'Pepper Soup',
    localName: 'Ofe Nsala',
    category: 'meal',
    origin: 'nigerian',
    calories: 250,
    protein: 25,
    carbs: 8,
    fats: 14,
    fiber: 2,
    sugar: 2,
    sodium: 580,
    saturatedFat: 4,
    ingredients: ['meat/fish', 'pepper soup spice', 'onions', 'utazi leaves', 'scent leaves'],
    allergens: ['fish'],
    commonPreparations: ['with catfish', 'with goat meat', 'with chicken'],
    healthFlags: ['high-protein', 'spicy', 'low-carb'],
    portionSize: '1 bowl (350ml)',
  },
  {
    id: 'ewa-agoyin',
    name: 'Ewa Agoyin',
    localName: 'Ẹ̀wà Àgọ̀yìn',
    category: 'meal',
    origin: 'nigerian',
    calories: 340,
    protein: 14,
    carbs: 42,
    fats: 14,
    fiber: 8,
    sugar: 3,
    sodium: 450,
    saturatedFat: 5,
    ingredients: ['honey beans', 'palm oil', 'onions', 'peppers', 'crayfish'],
    allergens: ['shellfish'],
    commonPreparations: ['with bread', 'with yam', 'with plantain'],
    healthFlags: ['high-fiber', 'high-protein'],
    portionSize: '1 plate (300g)',
  },
  {
    id: 'puff-puff',
    name: 'Puff Puff',
    localName: 'Puff Puff',
    category: 'snack',
    origin: 'nigerian',
    calories: 280,
    protein: 4,
    carbs: 38,
    fats: 12,
    fiber: 1,
    sugar: 15,
    sodium: 180,
    saturatedFat: 2,
    ingredients: ['flour', 'sugar', 'yeast', 'nutmeg', 'vegetable oil'],
    allergens: ['gluten'],
    commonPreparations: ['plain', 'with sugar', 'filled'],
    healthFlags: ['high-sugar', 'fried', 'refined-carbs'],
    portionSize: '5 pieces (100g)',
  },
  {
    id: 'zobo',
    name: 'Zobo Drink',
    localName: 'Zobo',
    category: 'beverage',
    origin: 'nigerian',
    calories: 45,
    protein: 0,
    carbs: 12,
    fats: 0,
    fiber: 0,
    sugar: 8,
    sodium: 10,
    saturatedFat: 0,
    ingredients: ['hibiscus leaves', 'ginger', 'pineapple', 'cloves'],
    allergens: [],
    commonPreparations: ['sweetened', 'unsweetened', 'with fruits'],
    healthFlags: ['antioxidant-rich', 'may-contain-added-sugar'],
    portionSize: '1 glass (250ml)',
  },
  {
    id: 'chin-chin',
    name: 'Chin Chin',
    localName: 'Chin Chin',
    category: 'snack',
    origin: 'nigerian',
    calories: 450,
    protein: 6,
    carbs: 52,
    fats: 24,
    fiber: 2,
    sugar: 18,
    sodium: 220,
    saturatedFat: 6,
    ingredients: ['flour', 'sugar', 'butter', 'eggs', 'milk', 'nutmeg'],
    allergens: ['gluten', 'eggs', 'dairy'],
    commonPreparations: ['hard', 'soft', 'coconut flavored'],
    healthFlags: ['high-sugar', 'high-fat', 'fried'],
    portionSize: '1 cup (80g)',
  },
  {
    id: 'kunu',
    name: 'Kunu',
    localName: 'Kunu Zaki',
    category: 'beverage',
    origin: 'nigerian',
    calories: 120,
    protein: 3,
    carbs: 26,
    fats: 1,
    fiber: 2,
    sugar: 12,
    sodium: 15,
    saturatedFat: 0,
    ingredients: ['millet', 'ginger', 'cloves', 'sweet potatoes'],
    allergens: [],
    commonPreparations: ['sweetened', 'with milk', 'plain'],
    healthFlags: ['probiotic', 'moderate-sugar'],
    portionSize: '1 glass (250ml)',
  },
  {
    id: 'banga-soup',
    name: 'Banga Soup',
    localName: 'Ofe Akwu',
    category: 'meal',
    origin: 'nigerian',
    calories: 450,
    protein: 20,
    carbs: 15,
    fats: 38,
    fiber: 5,
    sugar: 3,
    sodium: 720,
    saturatedFat: 15,
    ingredients: ['palm fruit', 'beef', 'fish', 'crayfish', 'beletete', 'oburunbebe stick'],
    allergens: ['fish', 'shellfish'],
    commonPreparations: ['with starch', 'with eba', 'with pounded yam'],
    healthFlags: ['high-fat', 'high-saturated-fat'],
    portionSize: '1 bowl (300ml)',
  },
  {
    id: 'okra-soup',
    name: 'Okra Soup',
    localName: 'Ofe Okwuru',
    category: 'meal',
    origin: 'nigerian',
    calories: 220,
    protein: 16,
    carbs: 12,
    fats: 14,
    fiber: 6,
    sugar: 3,
    sodium: 520,
    saturatedFat: 4,
    ingredients: ['okra', 'palm oil', 'meat', 'fish', 'crayfish', 'ogiri'],
    allergens: ['fish', 'shellfish'],
    commonPreparations: ['with eba', 'with fufu', 'seafood style'],
    healthFlags: ['high-fiber', 'low-calorie'],
    portionSize: '1 bowl (300ml)',
  },
  {
    id: 'plantain-fried',
    name: 'Fried Plantain',
    localName: 'Dodo',
    category: 'snack',
    origin: 'nigerian',
    calories: 250,
    protein: 2,
    carbs: 45,
    fats: 8,
    fiber: 3,
    sugar: 18,
    sodium: 5,
    saturatedFat: 1,
    ingredients: ['ripe plantain', 'vegetable oil'],
    allergens: [],
    commonPreparations: ['crispy', 'soft', 'with beans'],
    healthFlags: ['fried', 'natural-sugars'],
    portionSize: '1 plantain (150g)',
  },
  {
    id: 'garri',
    name: 'Garri (Eba)',
    localName: 'Eba / Garri',
    category: 'meal',
    origin: 'nigerian',
    calories: 360,
    protein: 1,
    carbs: 88,
    fats: 0.5,
    fiber: 2,
    sugar: 1,
    sodium: 5,
    saturatedFat: 0,
    ingredients: ['cassava granules', 'hot water'],
    allergens: [],
    commonPreparations: ['with soup', 'soaked with sugar', 'with groundnuts'],
    healthFlags: ['high-carb', 'low-nutrient-density'],
    portionSize: '1 wrap (200g)',
  },
];

// User health profile storage
const HEALTH_PROFILE_KEY = 'fitnaija_health_profile';
const SCAN_HISTORY_KEY = 'fitnaija_scan_history';

export const foodScanService = {
  // Get or create user health profile
  getHealthProfile(): UserHealthProfile {
    const stored = localStorage.getItem(HEALTH_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default profile
    return {
      dietPreference: 'balanced',
      healthConditions: [],
      allergies: [],
      wellnessGoals: ['maintain-weight'],
      dailyCalorieLimit: 2000,
      dailySodiumLimit: 2300,
      dailySugarLimit: 50,
    };
  },

  saveHealthProfile(profile: UserHealthProfile): void {
    localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(profile));
  },

  // Search food by name (for manual search and photo recognition)
  searchFood(query: string): FoodItem[] {
    const normalizedQuery = query.toLowerCase().trim();
    return nigerianFoodDatabase.filter(food => 
      food.name.toLowerCase().includes(normalizedQuery) ||
      (food.localName && food.localName.toLowerCase().includes(normalizedQuery)) ||
      food.ingredients.some(i => i.toLowerCase().includes(normalizedQuery))
    );
  },

  // Get food by ID
  getFoodById(id: string): FoodItem | undefined {
    return nigerianFoodDatabase.find(f => f.id === id);
  },

  // Analyze food against user profile
  analyzeFood(food: FoodItem, profile: UserHealthProfile, portionMultiplier: number = 1): ScanResult {
    const adjustedFood = {
      ...food,
      calories: Math.round(food.calories * portionMultiplier),
      protein: Math.round(food.protein * portionMultiplier),
      carbs: Math.round(food.carbs * portionMultiplier),
      fats: Math.round(food.fats * portionMultiplier),
      sugar: Math.round(food.sugar * portionMultiplier),
      sodium: Math.round(food.sodium * portionMultiplier),
      saturatedFat: Math.round(food.saturatedFat * portionMultiplier),
    };

    const nutritionFlags: string[] = [];
    const ingredientAlerts: string[] = [];
    const reasonsForYou: string[] = [];
    let verdict: 'suitable' | 'caution' | 'not-recommended' = 'suitable';

    // Check allergens (HARD RULES)
    const allergenMatch = food.allergens.filter(a => 
      profile.allergies.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
    );
    if (allergenMatch.length > 0) {
      verdict = 'not-recommended';
      ingredientAlerts.push(`Contains ${allergenMatch.join(', ')} - you are allergic`);
    }

    // Check health conditions
    if (profile.healthConditions.includes('diabetes') || profile.healthConditions.includes('diabetic')) {
      if (adjustedFood.sugar > 15) {
        nutritionFlags.push('High sugar content');
        if (verdict !== 'not-recommended') verdict = 'caution';
        reasonsForYou.push('Sugar content may affect your blood glucose levels');
      }
      if (adjustedFood.carbs > 50) {
        reasonsForYou.push('High carbohydrate content - monitor portion size');
      }
    }

    if (profile.healthConditions.includes('hypertension') || profile.healthConditions.includes('high-blood-pressure')) {
      if (adjustedFood.sodium > 600) {
        nutritionFlags.push('High sodium content');
        if (verdict !== 'not-recommended') verdict = 'caution';
        reasonsForYou.push('High sodium may affect your blood pressure');
      }
    }

    if (profile.healthConditions.includes('heart-disease') || profile.healthConditions.includes('cholesterol')) {
      if (adjustedFood.saturatedFat > 10) {
        nutritionFlags.push('High saturated fat');
        if (verdict !== 'not-recommended') verdict = 'caution';
        reasonsForYou.push('Saturated fat content may impact heart health');
      }
    }

    // Check diet preferences
    if (profile.dietPreference === 'low-carb' || profile.dietPreference === 'keto') {
      if (adjustedFood.carbs > 30) {
        nutritionFlags.push('High in carbohydrates');
        if (verdict === 'suitable') verdict = 'caution';
        reasonsForYou.push(`Contains ${adjustedFood.carbs}g carbs - higher than your low-carb preference`);
      }
    }

    if (profile.dietPreference === 'high-protein') {
      if (adjustedFood.protein >= 20) {
        reasonsForYou.push(`Good protein source with ${adjustedFood.protein}g per serving`);
      } else if (adjustedFood.protein < 10) {
        reasonsForYou.push('Consider adding a protein source to this meal');
      }
    }

    if (profile.dietPreference === 'vegetarian' || profile.dietPreference === 'vegan') {
      if (food.ingredients.some(i => ['meat', 'beef', 'chicken', 'fish', 'stockfish', 'crayfish', 'shrimps'].includes(i.toLowerCase()))) {
        verdict = 'not-recommended';
        ingredientAlerts.push('Contains animal products');
        reasonsForYou.push('This dish contains animal-based ingredients');
      }
    }

    // Check wellness goals
    if (profile.wellnessGoals.includes('weight-loss') || profile.wellnessGoals.includes('lose-weight')) {
      if (adjustedFood.calories > 400) {
        if (verdict === 'suitable') verdict = 'caution';
        reasonsForYou.push('Higher calorie content - consider a smaller portion');
      }
      if (food.healthFlags.includes('fried')) {
        reasonsForYou.push('Fried foods may slow your weight loss progress');
      }
    }

    if (profile.wellnessGoals.includes('muscle-gain') || profile.wellnessGoals.includes('build-muscle')) {
      if (adjustedFood.protein >= 20) {
        reasonsForYou.push('Excellent protein content for muscle building');
      }
    }

    // General nutrition flags
    if (adjustedFood.sugar > 20 && !nutritionFlags.includes('High sugar content')) {
      nutritionFlags.push('High sugar content');
    }
    if (adjustedFood.sodium > 800 && !nutritionFlags.includes('High sodium content')) {
      nutritionFlags.push('High sodium content');
    }
    if (adjustedFood.saturatedFat > 12 && !nutritionFlags.includes('High saturated fat')) {
      nutritionFlags.push('High saturated fat');
    }

    // Check ingredient-specific alerts
    if (food.ingredients.includes('palm oil') && profile.healthConditions.includes('cholesterol')) {
      ingredientAlerts.push('Contains palm oil (high in saturated fat)');
    }
    if (food.ingredients.includes('stock cubes') && profile.healthConditions.includes('hypertension')) {
      ingredientAlerts.push('Contains stock cubes (high sodium)');
    }

    // Generate portion guidance
    let portionGuidance = '';
    if (verdict === 'suitable') {
      portionGuidance = `Enjoy ${food.portionSize} as part of a balanced meal`;
    } else if (verdict === 'caution') {
      portionGuidance = `Consider half a portion or limit to once per week`;
    } else {
      portionGuidance = `Best to avoid or find a suitable alternative`;
    }

    // If no specific reasons, add generic positive notes
    if (reasonsForYou.length === 0) {
      if (food.origin === 'nigerian') {
        reasonsForYou.push('Traditional Nigerian dish with authentic flavors');
      }
      if (adjustedFood.fiber > 5) {
        reasonsForYou.push('Good source of dietary fiber');
      }
      if (adjustedFood.protein > 15) {
        reasonsForYou.push('Good source of protein');
      }
      reasonsForYou.push('Fits within your dietary preferences');
    }

    // Find alternatives
    const alternatives = this.findAlternatives(food, profile);

    return {
      food: adjustedFood,
      verdict,
      reasonsForYou: reasonsForYou.slice(0, 4),
      nutritionFlags: nutritionFlags.slice(0, 3),
      ingredientAlerts,
      portionGuidance,
      alternatives,
      confidence: 'high',
      isEstimated: false,
    };
  },

  // Find healthier alternatives
  findAlternatives(currentFood: FoodItem, profile: UserHealthProfile): FoodItem[] {
    return nigerianFoodDatabase
      .filter(food => {
        // Don't suggest the same food
        if (food.id === currentFood.id) return false;
        // Don't suggest foods with allergens
        if (food.allergens.some(a => profile.allergies.includes(a))) return false;
        // Same category
        if (food.category !== currentFood.category) return false;
        // Lower calories for weight loss
        if (profile.wellnessGoals.includes('weight-loss') && food.calories >= currentFood.calories) return false;
        // Higher protein for muscle gain
        if (profile.wellnessGoals.includes('muscle-gain') && food.protein <= currentFood.protein) return false;
        return true;
      })
      .slice(0, 3);
  },

  // Simulate photo recognition (mock AI)
  async recognizeMealPhoto(imageData: string): Promise<{ foods: FoodItem[], confidence: 'high' | 'medium' | 'low' }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call an AI vision API
    // For now, return random Nigerian foods as mock recognition
    const shuffled = [...nigerianFoodDatabase]
      .filter(f => f.category === 'meal')
      .sort(() => Math.random() - 0.5);
    
    return {
      foods: shuffled.slice(0, 3),
      confidence: 'medium',
    };
  },

  // Real barcode lookup using Open Food Facts API (free, no API key needed)
  async lookupBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );
      
      if (!response.ok) {
        console.log('Barcode not found in Open Food Facts');
        return null;
      }
      
      const data = await response.json();
      
      if (data.status !== 1 || !data.product) {
        console.log('Product not found');
        return null;
      }
      
      const product = data.product;
      const nutriments = product.nutriments || {};
      
      // Convert Open Food Facts data to our FoodItem format
      const foodItem: FoodItem = {
        id: `off-${barcode}`,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        localName: product.product_name,
        category: 'packaged',
        origin: 'international',
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments.energy_value || 0),
        protein: Math.round(nutriments.proteins_100g || 0),
        carbs: Math.round(nutriments.carbohydrates_100g || 0),
        fats: Math.round(nutriments.fat_100g || 0),
        fiber: Math.round(nutriments.fiber_100g || 0),
        sugar: Math.round(nutriments.sugars_100g || 0),
        sodium: Math.round((nutriments.sodium_100g || 0) * 1000), // Convert g to mg
        saturatedFat: Math.round(nutriments['saturated-fat_100g'] || 0),
        ingredients: product.ingredients_text 
          ? product.ingredients_text.split(',').map((i: string) => i.trim().toLowerCase())
          : [],
        allergens: product.allergens_tags 
          ? product.allergens_tags.map((a: string) => a.replace('en:', ''))
          : [],
        commonPreparations: [],
        healthFlags: this.generateHealthFlags(nutriments),
        portionSize: product.serving_size || 'Per 100g',
        image: product.image_url,
      };
      
      return foodItem;
    } catch (error) {
      console.error('Error fetching from Open Food Facts:', error);
      return null;
    }
  },

  // Generate health flags from nutriments
  generateHealthFlags(nutriments: Record<string, number>): string[] {
    const flags: string[] = [];
    if ((nutriments.sugars_100g || 0) > 15) flags.push('high-sugar');
    if ((nutriments['saturated-fat_100g'] || 0) > 5) flags.push('high-saturated-fat');
    if ((nutriments.sodium_100g || 0) > 0.6) flags.push('high-sodium');
    if ((nutriments.fiber_100g || 0) > 6) flags.push('high-fiber');
    if ((nutriments.proteins_100g || 0) > 20) flags.push('high-protein');
    return flags;
  },

  // Simulate nutrition label OCR
  async extractNutritionLabel(imageData: string): Promise<Partial<FoodItem> | null> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR result
    return {
      name: 'Packaged Food',
      category: 'packaged',
      origin: 'international',
      calories: 250,
      protein: 8,
      carbs: 35,
      fats: 10,
      fiber: 2,
      sugar: 12,
      sodium: 450,
      saturatedFat: 3,
      ingredients: [],
      allergens: [],
      commonPreparations: [],
      healthFlags: [],
      portionSize: 'Per serving',
    };
  },

  // Save scan to history
  saveScanToHistory(result: ScanResult): void {
    const history = this.getScanHistory();
    history.unshift({
      ...result,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 50 scans
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  },

  getScanHistory(): (ScanResult & { timestamp: string })[] {
    const stored = localStorage.getItem(SCAN_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Get all foods for browsing
  getAllFoods(): FoodItem[] {
    return nigerianFoodDatabase;
  },
};
