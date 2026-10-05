import { supabase } from "@/lib/supabase";
import { foodScanService, type FoodItem } from "@/lib/foodScanService";

interface FoodRow {
  id: string;
  name: string;
  local_name: string | null;
  category: FoodItem["category"];
  origin: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  serving_size: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  health_flags: string[] | null;
}

function fromRow(row: FoodRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    localName: row.local_name ?? undefined,
    category: row.category,
    origin: row.origin === "african" || row.origin === "international" ? row.origin : "nigerian",
    calories: Number(row.calories) || 0,
    protein: Number(row.protein_g) || 0,
    carbs: Number(row.carbs_g) || 0,
    fats: Number(row.fats_g) || 0,
    fiber: Number(row.fiber_g) || 0,
    sugar: Number(row.sugar_g) || 0,
    sodium: Number(row.sodium_mg) || 0,
    saturatedFat: Number(row.saturated_fat_g) || 0,
    ingredients: row.ingredients ?? [],
    allergens: row.allergens ?? [],
    commonPreparations: [],
    healthFlags: row.health_flags ?? [],
    portionSize: row.serving_size || "1 serving",
  };
}

/** Shared food list. The database is preferred; the bundled catalog covers an empty table. */
export async function loadFoodCatalog(): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("nigerian_foods")
    .select("id, name, local_name, category, origin, calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g, sodium_mg, saturated_fat_g, serving_size, ingredients, allergens, health_flags")
    .order("name");

  if (error || !data?.length) return foodScanService.getAllFoods();
  return (data as FoodRow[]).map(fromRow);
}

export function findFoodByName(foods: FoodItem[], name: string): FoodItem | undefined {
  const needle = name.toLowerCase().trim();
  if (!needle) return undefined;
  return foods.find((food) => {
    const candidates = [food.name, food.localName].filter(Boolean).map((value) => value!.toLowerCase());
    return candidates.some((candidate) => needle.includes(candidate) || candidate.includes(needle));
  });
}

export interface RecipeView {
  prep: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips: string;
}

const DETAILED: Record<string, RecipeView> = {
  "Moi Moi & Pap": {
    prep: "45 mins",
    servings: 2,
    ingredients: ["2 cups peeled beans", "2 red bell peppers", "1 onion", "2 tbsp palm oil", "2 eggs", "Seasoning", "Salt", "2 cups prepared pap"],
    instructions: [
      "Blend the beans with peppers and onion until smooth.",
      "Stir in palm oil, seasoning, and salt.",
      "Pour into containers and steam for about 45 minutes.",
      "Mix the pap with hot water and serve beside the moi moi.",
    ],
    tips: "Fish or crayfish can be folded in before steaming.",
  },
};

export function recipeForMeal(
  meal: { name: string; calories: number; protein: number; carbs: number; fats: number },
  foods: FoodItem[],
): RecipeView {
  const detailed = DETAILED[meal.name];
  if (detailed) return detailed;

  const food = findFoodByName(foods, meal.name);
  if (food && food.ingredients.length > 0) {
    return {
      prep: food.portionSize,
      servings: 1,
      ingredients: food.ingredients,
      instructions: [
        `Use ${food.portionSize} as one serving of ${food.name}.`,
        ...food.commonPreparations.map((prep) => `A common plate is ${food.name} ${prep}.`),
        "Log this serving so today's calories and macros stay in step with your plan.",
      ],
      tips: food.healthFlags.length
        ? `Watch for: ${food.healthFlags.join(", ")}.`
        : `${food.calories} kcal in the catalog serving.`,
    };
  }

  return {
    prep: "Logged meal",
    servings: 1,
    ingredients: [meal.name],
    instructions: [
      `This plate is saved as ${meal.calories} kcal, ${meal.protein}g protein, ${meal.carbs}g carbs, and ${meal.fats}g fat.`,
      "Mark it eaten on Today when you finish it. That updates your daily totals.",
    ],
    tips: "Generate a meal plan or pick a dish from the meal library for a full ingredient list.",
  };
}
