import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Flame, Apple, Sparkles, Clock, ShoppingCart } from "lucide-react";
import nigerianMeal from "@/assets/nigerian-meal.jpg";
import { AIMealGenerator } from "@/components/AIMealGenerator";
import { RecipeModal } from "@/components/RecipeModal";
import { MealDeliverySystem } from "@/components/MealDeliverySystem";
import { VendorMarketplace } from "@/components/VendorMarketplace";
import { SwipeableMealCarousel } from "@/components/SwipeableMealCarousel";
import { useUserData } from "@/hooks/useUserData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Nutrition = () => {
  const { todayMeals, refreshData } = useUserData();
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const { toast } = useToast();

  const openRecipe = (meal: any) => {
    setSelectedMeal(meal);
    setIsRecipeModalOpen(true);
  };

  const handleOrderMeal = (meal: any) => {
    toast({
      title: "Order Placed!",
      description: `Your order for ${meal.name} has been sent to local vendors.`,
    });
  };

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = todayMeals.reduce((sum, m) => sum + m.fats, 0);
  const mealPlans = todayMeals.map(meal => ({
    id: meal.id,
    name: meal.name,
    type: meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1),
    time: meal.mealType === 'breakfast' ? '8:00 AM' : meal.mealType === 'lunch' ? '1:00 PM' : '7:00 PM',
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fats: meal.fats,
    mealType: meal.mealType,
    image: nigerianMeal,
    description: `Delicious ${meal.mealType} with balanced macronutrients`,
  }));

  const nigerianFoods = [
    {
      name: "Beans Porridge",
      calories: 320,
      protein: "16g",
      benefits: "High in fiber and plant protein",
      category: "Main Dish",
    },
    {
      name: "Plantain (Boiled)",
      calories: 180,
      protein: "2g",
      benefits: "Rich in potassium and vitamins",
      category: "Side Dish",
    },
    {
      name: "Egusi Soup",
      calories: 380,
      protein: "22g",
      benefits: "Packed with healthy fats and proteins",
      category: "Main Dish",
    },
    {
      name: "Suya Salad",
      calories: 280,
      protein: "32g",
      benefits: "Lean protein with fresh vegetables",
      category: "Salad",
    },
    {
      name: "Zobo Drink",
      calories: 45,
      protein: "0g",
      benefits: "Antioxidant-rich hibiscus drink",
      category: "Beverage",
    },
    {
      name: "Garden Egg Sauce",
      calories: 120,
      protein: "4g",
      benefits: "Low-calorie, nutrient-dense",
      category: "Sauce",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gradient">Nutrition Plans</h1>
          <p className="text-muted-foreground mt-2">Nigerian cuisine meets healthy eating</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 gap-2 w-fit">
          <Sparkles className="h-4 w-4" />
          AI Optimized
        </Badge>
      </div>

      {/* Daily Summary */}
      <Card className="glass shadow-premium border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Today's Nutrition Summary
          </CardTitle>
          <CardDescription>Your daily macronutrient breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 glass rounded-xl group hover:shadow-elevated transition-all duration-300">
              <Flame className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-4 glass rounded-xl group hover:shadow-elevated transition-all duration-300">
              <p className="text-2xl font-bold text-secondary group-hover:scale-110 transition-transform inline-block">{totalProtein}g</p>
              <p className="text-sm text-muted-foreground">Protein</p>
            </div>
            <div className="text-center p-4 glass rounded-xl group hover:shadow-elevated transition-all duration-300">
              <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform inline-block">{totalCarbs}g</p>
              <p className="text-sm text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-4 glass rounded-xl group hover:shadow-elevated transition-all duration-300">
              <p className="text-2xl font-bold group-hover:scale-110 transition-transform inline-block">{totalFats}g</p>
              <p className="text-sm text-muted-foreground">Fats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="meals">Today's Meals</TabsTrigger>
          <TabsTrigger value="foods">Food Library</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-6 mt-6">
          {/* AI Generator and Delivery System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIMealGenerator onGenerated={refreshData} />
            <MealDeliverySystem />
          </div>
          
          {/* Swipeable Meal Cards */}
          {mealPlans.length > 0 && (
            <SwipeableMealCarousel 
              meals={mealPlans}
              onViewRecipe={openRecipe}
              onOrderMeal={handleOrderMeal}
            />
          )}

          {/* Vendor Marketplace */}
          <VendorMarketplace />
        </TabsContent>

        <TabsContent value="foods" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nigerianFoods.map((food, index) => (
              <Card key={index} className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 group-hover:text-gradient transition-all duration-300">
                      <div className="p-2 rounded-xl bg-secondary/10 group-hover:scale-110 transition-transform">
                        <Apple className="h-5 w-5 text-secondary" />
                      </div>
                      {food.name}
                    </CardTitle>
                    <Badge variant="outline" className="glass">{food.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl glass">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-bold text-primary">{food.calories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl glass">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-bold text-secondary">{food.protein}</span>
                  </div>
                  <div className="glass p-3 rounded-xl border border-secondary/20">
                    <p className="text-sm flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{food.benefits}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recipe Modal */}
      {selectedMeal && (
        <RecipeModal
          open={isRecipeModalOpen}
          onOpenChange={setIsRecipeModalOpen}
          meal={selectedMeal}
        />
      )}
    </div>
  );
};

export default Nutrition;
