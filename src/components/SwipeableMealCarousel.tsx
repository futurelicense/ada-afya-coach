import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealCard } from "./MealCard";

interface SwipeableMealCarouselProps {
  meals: Array<{
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
  }>;
  onViewRecipe: (meal: any) => void;
  onOrderMeal?: (meal: any) => void;
}

export function SwipeableMealCarousel({ 
  meals, 
  onViewRecipe,
  onOrderMeal 
}: SwipeableMealCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: "start",
    skipSnaps: false,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (meals.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Today's Meal Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Swipe or use arrows to explore meals
          </p>
        </div>
        
        {/* Navigation Buttons - Desktop */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className="h-10 w-10 rounded-full glass"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className="h-10 w-10 rounded-full glass"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
            >
              <MealCard
                meal={meal}
                onViewRecipe={() => onViewRecipe(meal)}
                onOrder={() => onOrderMeal?.(meal)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {meals.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? "w-8 bg-primary shadow-glow" 
                : "w-2 bg-muted hover:bg-muted-foreground/50"
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to meal ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
