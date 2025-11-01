import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Flame, Apple, Sparkles, Clock } from "lucide-react";
import nigerianMeal from "@/assets/nigerian-meal.jpg";
import { AIMealGenerator } from "@/components/AIMealGenerator";
import { useUserData } from "@/hooks/useUserData";

const Nutrition = () => {
  const { todayMeals, refreshData } = useUserData();

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
    protein: `${meal.protein}g`,
    carbs: `${meal.carbs}g`,
    fats: `${meal.fats}g`,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Nutrition Plans</h1>
          <p className="text-muted-foreground mt-2">Nigerian cuisine meets healthy eating</p>
        </div>
        <Badge className="bg-secondary text-secondary-foreground gap-2">
          <Sparkles className="h-4 w-4" />
          AI Optimized
        </Badge>
      </div>

      {/* Daily Summary */}
      <Card className="shadow-glow border-primary">
        <CardHeader>
          <CardTitle>Today's Nutrition Summary</CardTitle>
          <CardDescription>Your daily macronutrient breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <p className="text-2xl font-bold text-secondary">{totalProtein}g</p>
              <p className="text-sm text-muted-foreground">Protein</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold">{totalCarbs}g</p>
              <p className="text-sm text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{totalFats}g</p>
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

        <TabsContent value="meals" className="space-y-4 mt-6">
          <AIMealGenerator onGenerated={refreshData} />
          
          {mealPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((meal) => (
              <Card key={meal.id} className="overflow-hidden hover-scale shadow-card">
                <div className="relative h-48">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">{meal.type}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{meal.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {meal.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <p className="font-bold text-primary">{meal.calories}</p>
                      <p className="text-xs text-muted-foreground">cal</p>
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{meal.protein}</p>
                      <p className="text-xs text-muted-foreground">protein</p>
                    </div>
                    <div>
                      <p className="font-bold">{meal.carbs}</p>
                      <p className="text-xs text-muted-foreground">carbs</p>
                    </div>
                    <div>
                      <p className="font-bold">{meal.fats}</p>
                      <p className="text-xs text-muted-foreground">fats</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Utensils className="mr-2 h-4 w-4" />
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="foods" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nigerianFoods.map((food, index) => (
              <Card key={index} className="shadow-card hover-scale">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-secondary" />
                      {food.name}
                    </CardTitle>
                    <Badge variant="outline">{food.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-bold text-primary">{food.calories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-bold text-secondary">{food.protein}</span>
                  </div>
                  <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-lg">
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
    </div>
  );
};

export default Nutrition;
