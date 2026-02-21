import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, User, Utensils, ShoppingBag, Calendar, TreePine, TrendingUp, Filter, X
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
  { id: "all" as CategoryType, label: "All", icon: Filter, count: 28 },
  { id: "gyms" as CategoryType, label: "Gyms", icon: Dumbbell, count: 3 },
  { id: "trainers" as CategoryType, label: "Trainers", icon: User, count: 3 },
  { id: "nutritionists" as CategoryType, label: "Nutrition", icon: Utensils, count: 3 },
  { id: "stores" as CategoryType, label: "Stores", icon: ShoppingBag, count: 3 },
  { id: "events" as CategoryType, label: "Events", icon: Calendar, count: 3 },
  { id: "spots" as CategoryType, label: "Outdoor", icon: TreePine, count: 3 },
  { id: "influencers" as CategoryType, label: "Influencers", icon: TrendingUp, count: 4 },
];

export const ExploreFilters = ({ 
  activeCategory, onCategoryChange, searchQuery 
}: ExploreFiltersProps) => {
  return (
    <div className="space-y-3">
      {/* Category Pills - horizontal scroll on mobile */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 md:flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex-shrink-0 gap-1 sm:gap-2 transition-all duration-200 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm",
                isActive 
                  ? "shadow-glow" 
                  : "hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{category.label}</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-0.5 text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5",
                  isActive && "bg-primary-foreground/20 text-primary-foreground"
                )}
              >
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Active filters indicator */}
      {(searchQuery || activeCategory !== "all") && (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-muted-foreground">Filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 text-xs">
              "{searchQuery}"
              <X className="h-3 w-3 cursor-pointer" />
            </Badge>
          )}
          {activeCategory !== "all" && (
            <Badge variant="secondary" className="gap-1 capitalize text-xs">
              {activeCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
