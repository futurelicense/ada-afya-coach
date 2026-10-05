import { describe, expect, it } from "vitest";
import { nutritionTargetsFor } from "@/lib/nutritionTargets";
import { findFoodByName, recipeForMeal } from "@/lib/foodCatalog";
import type { FoodItem } from "@/lib/foodScanService";

const egusi: FoodItem = {
  id: "egusi",
  name: "Egusi Soup",
  localName: "Ofe Egusi",
  category: "meal",
  origin: "nigerian",
  calories: 420,
  protein: 22,
  carbs: 12,
  fats: 35,
  fiber: 5,
  sugar: 3,
  sodium: 750,
  saturatedFat: 8,
  ingredients: ["melon seeds", "palm oil"],
  allergens: ["fish"],
  commonPreparations: ["with pounded yam"],
  healthFlags: ["high-fat"],
  portionSize: "1 bowl",
};

describe("nutritionTargetsFor", () => {
  it("lowers calories for a weight-loss goal", () => {
    const base = nutritionTargetsFor({
      weight: 80, height: 175, age: 30, gender: "male", fitnessLevel: "intermediate", goals: ["stay-fit"],
    });
    const cutting = nutritionTargetsFor({
      weight: 80, height: 175, age: 30, gender: "male", fitnessLevel: "intermediate", goals: ["lose-weight"],
    });
    expect(cutting.calories).toBe(base.calories - 400);
    expect(cutting.protein).toBeGreaterThan(0);
    expect(cutting.carbs).toBeGreaterThan(0);
  });
});

describe("recipeForMeal", () => {
  it("uses catalog ingredients instead of a placeholder", () => {
    const recipe = recipeForMeal({ name: "Egusi Soup", calories: 420, protein: 22, carbs: 12, fats: 35 }, [egusi]);
    expect(recipe.ingredients).toContain("melon seeds");
    expect(recipe.instructions.join(" ")).not.toMatch(/coming soon/i);
  });

  it("finds a dish by local name", () => {
    expect(findFoodByName([egusi], "ofe egusi")?.name).toBe("Egusi Soup");
  });
});
