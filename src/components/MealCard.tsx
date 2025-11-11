import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, ShoppingCart, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    type: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    image: string;
    description: string;
    mealType: string;
  };
  onOrder?: () => void;
  onViewRecipe?: () => void;
}

export function MealCard({ meal, onOrder, onViewRecipe }: MealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: meal.name,
        text: `Check out this healthy Nigerian meal: ${meal.name} - ${meal.calories} calories`,
      });
    }
  };

  return (
    <Card className="overflow-hidden border-0 glass shadow-premium hover:shadow-elevated transition-all duration-300 group h-full flex flex-col">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={meal.image} 
          alt={meal.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-glow">
            {meal.type}
          </Badge>
          <Badge variant="secondary" className="backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {meal.time}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full glass backdrop-blur-md transition-all duration-300",
              isFavorite ? "text-red-500" : "text-white hover:text-red-500"
            )}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full glass backdrop-blur-md text-white hover:text-primary transition-all duration-300"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Calories Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="glass backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <div className="text-white">
              <p className="text-lg font-bold leading-none">{meal.calories}</p>
              <p className="text-[10px] opacity-80">calories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all duration-300">
          {meal.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {meal.description}
        </p>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl glass">
            <p className="text-lg font-bold text-secondary">{meal.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center p-3 rounded-xl glass">
            <p className="text-lg font-bold text-primary">{meal.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center p-3 rounded-xl glass">
            <p className="text-lg font-bold">{meal.fats}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewRecipe}
          >
            View Recipe
          </Button>
          <Button 
            className="w-full shadow-glow gap-2"
            onClick={onOrder}
          >
            <ShoppingCart className="h-4 w-4" />
            Order
          </Button>
        </div>
      </div>
    </Card>
  );
}
