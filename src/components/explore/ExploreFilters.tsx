import { Button } from "@/components/ui/button";
import { 
  Dumbbell, User, Utensils, ShoppingBag, TrendingUp, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryType = 
  | "all" | "gyms" | "trainers" | "nutritionists" | "stores" | "events" | "spots" | "influencers";

interface ExploreFiltersProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  searchQuery: string;
}

const categories = [
  { id: "all" as CategoryType, label: "All", icon: LayoutGrid },
  { id: "gyms" as CategoryType, label: "Gyms", icon: Dumbbell },
  { id: "trainers" as CategoryType, label: "Trainers", icon: User },
  { id: "nutritionists" as CategoryType, label: "Nutrition", icon: Utensils },
  { id: "stores" as CategoryType, label: "Vendors", icon: ShoppingBag },
  { id: "influencers" as CategoryType, label: "Influencers", icon: TrendingUp },
];

export const ExploreFilters = ({ 
  activeCategory, onCategoryChange, searchQuery 
}: ExploreFiltersProps) => {
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto rounded-xl border bg-white p-1.5 shadow-card scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "h-9 flex-shrink-0 gap-1.5 rounded-lg px-3 text-xs transition-all duration-200",
                isActive 
                  ? "shadow-glow" 
                  : "text-[#405268] hover:bg-primary/5 hover:text-primary"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{category.label}</span>
            </Button>
          );
        })}
      </div>

      {searchQuery && <p className="mt-2 text-xs text-muted-foreground">Showing results for “{searchQuery}”</p>}
    </div>
  );
};
