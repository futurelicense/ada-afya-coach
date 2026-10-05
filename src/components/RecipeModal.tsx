import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Flame } from "lucide-react";
import { loadFoodCatalog, recipeForMeal, type RecipeView } from "@/lib/foodCatalog";

interface RecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    mealType: string;
  };
}

export const RecipeModal = ({ open, onOpenChange, meal }: RecipeModalProps) => {
  const [recipe, setRecipe] = useState<RecipeView>(() => recipeForMeal(meal, []));

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRecipe(recipeForMeal(meal, []));
    void loadFoodCatalog().then((foods) => {
      if (!cancelled) setRecipe(recipeForMeal(meal, foods));
    });
    return () => { cancelled = true; };
  }, [open, meal]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{meal.name}</DialogTitle>
          <DialogDescription>
            Nigerian cuisine recipe with nutritional information
          </DialogDescription>
        </DialogHeader>

        {/* Recipe Info */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.prep}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings} servings
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {meal.calories} cal
          </Badge>
        </div>

        {/* Nutritional Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{meal.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{meal.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-info">{meal.fats}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        </div>

        <Separator />

        {/* Ingredients */}
        <div>
          <h3 className="font-bold text-lg mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Instructions */}
        <div>
          <h3 className="font-bold text-lg mb-3">Instructions</h3>
          <ol className="space-y-3">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="font-bold text-primary min-w-6">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {recipe.tips && (
          <>
            <Separator />
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                💡 Chef's Tip
              </h3>
              <p className="text-sm">{recipe.tips}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
