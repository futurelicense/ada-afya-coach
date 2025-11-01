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

const recipes: Record<string, any> = {
  "Moi Moi & Pap": {
    prep: "30 mins",
    servings: 2,
    ingredients: [
      "2 cups beans (peeled)",
      "2 red bell peppers",
      "1 onion",
      "2 tbsp palm oil",
      "2 eggs",
      "Seasoning cubes",
      "Salt to taste",
      "Pap (Ogi) - 2 cups prepared",
    ],
    instructions: [
      "Blend beans with peppers and onions until smooth",
      "Add palm oil, seasoning, and salt",
      "Pour into moi moi containers or leaves",
      "Steam for 45 minutes until firm",
      "Prepare pap by mixing with hot water",
      "Serve moi moi with warm pap",
    ],
    tips: "You can add fish, crayfish, or corned beef for extra flavor",
  },
  "Jollof Rice & Grilled Chicken": {
    prep: "1 hour",
    servings: 4,
    ingredients: [
      "3 cups parboiled rice",
      "4 chicken pieces",
      "400g tomato paste",
      "2 onions",
      "3 scotch bonnet peppers",
      "Curry, thyme, bay leaves",
      "Knorr cubes",
      "Vegetable oil",
    ],
    instructions: [
      "Marinate chicken with spices and grill until golden",
      "Blend tomatoes, peppers, and onions",
      "Fry the mixture until oil separates",
      "Add stock, seasoning, and bring to boil",
      "Add rice, cover and cook on low heat",
      "Serve with grilled chicken",
    ],
    tips: "The secret to perfect jollof is low heat and patience!",
  },
  "Egusi Soup & Fufu": {
    prep: "45 mins",
    servings: 4,
    ingredients: [
      "2 cups ground egusi (melon seeds)",
      "Assorted meat and fish",
      "2 cups spinach or bitter leaf",
      "Palm oil",
      "Crayfish",
      "Seasoning",
      "Fufu (cassava/yam)",
    ],
    instructions: [
      "Cook meat with seasoning until tender",
      "Add palm oil and let it heat",
      "Mix egusi with water and pour into pot",
      "Add crayfish and stir occasionally",
      "Add washed vegetables last",
      "Prepare fufu by pounding or using instant mix",
      "Serve hot together",
    ],
    tips: "Don't over-stir the egusi to maintain its grainy texture",
  },
};

export const RecipeModal = ({ open, onOpenChange, meal }: RecipeModalProps) => {
  const recipe = recipes[meal.name] || {
    prep: "30 mins",
    servings: 2,
    ingredients: ["Recipe details coming soon..."],
    instructions: ["Full recipe will be available soon!"],
    tips: "Check back later for detailed instructions",
  };

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
            <p className="text-2xl font-bold text-blue-500">{meal.fats}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        </div>

        <Separator />

        {/* Ingredients */}
        <div>
          <h3 className="font-bold text-lg mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient: string, idx: number) => (
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
            {recipe.instructions.map((step: string, idx: number) => (
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
