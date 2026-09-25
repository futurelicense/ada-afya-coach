import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Apple, ArrowRight, BarChart3, BookOpen, CalendarDays, ChefHat, Droplet,
  Dumbbell, Flame, Scan, Sparkles, Target, Utensils, Wheat,
} from "lucide-react";
import nigerianMeal from "@/assets/nigerian-meal.jpg";
import nutritionHero from "@/assets/reference/nutrition-hero.png";
import { AIMealGenerator } from "@/components/AIMealGenerator";
import { RecipeModal } from "@/components/RecipeModal";
import { MealDeliverySystem } from "@/components/MealDeliverySystem";
import { SwipeableMealCarousel } from "@/components/SwipeableMealCarousel";
import { ScanFoodButton } from "@/components/ScanFoodButton";
import { useUserData } from "@/hooks/useUserData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Nutrition = () => {
  const { todayMeals, refreshData } = useUserData();
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const openRecipe = (meal: any) => {
    setSelectedMeal(meal);
    setIsRecipeModalOpen(true);
  };

  const handleOrderMeal = (meal: any) => {
    toast({
      title: "Use Order below",
      description: `Select ${meal.name} in the kitchen checkout and pay with Paystack.`,
    });
  };

  const eatenMeals = todayMeals.filter(meal => meal.eaten);
  const totalCalories = eatenMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = eatenMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = eatenMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = eatenMeals.reduce((sum, m) => sum + m.fats, 0);
  const targets = { calories: 2500, protein: 150, carbs: 235, fats: 60 };
  const insightItems = [
    { label: "Calories", value: totalCalories, target: targets.calories, color: "#16a36a" },
    { label: "Protein", value: totalProtein, target: targets.protein, color: "#3b82f6" },
    { label: "Carbs", value: totalCarbs, target: targets.carbs, color: "#8b5cf6" },
    { label: "Fats", value: totalFats, target: targets.fats, color: "#f97373" },
  ];
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
    <div className="mx-auto max-w-[1440px] space-y-4 pb-10 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-[#10233f] lg:text-4xl">
            Nutrition <span className="text-primary">Plans</span>
          </h1>
          <p className="text-sm text-muted-foreground">Nigerian cuisine meets healthy eating</p>
        </div>
        <div className="flex gap-2">
          <ScanFoodButton className="shadow-glow" onMealLogged={refreshData} />
          <Button variant="outline" className="gap-2 bg-white">
            <Sparkles className="h-4 w-4" /> AI Optimized
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
        <section className="relative min-h-[230px] overflow-hidden rounded-2xl border border-primary/10 bg-[#e9f8ef] shadow-card">
          <img src={nutritionHero} alt="Healthy Nigerian meal" className="absolute inset-y-0 right-0 h-full w-[58%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e9f8ef] via-[#e9f8ef]/95 to-transparent" />
          <div className="relative z-10 flex min-h-[230px] max-w-[58%] flex-col justify-center p-6 lg:p-8">
            <h2 className="font-display text-3xl font-black leading-[1.02] text-[#10233f] lg:text-4xl">
              Good Food<br /><span className="text-primary">Brighter You</span>
            </h2>
            <p className="mt-3 text-sm text-[#536579]">Eat well. Feel better. Live stronger.</p>
            <Button
              className="mt-5 w-fit gap-2 shadow-glow"
              onClick={() => document.getElementById("ai-meal-generator")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Sparkles className="h-4 w-4" /> Generate My Meal Plan
            </Button>
          </div>
          <div className="absolute right-[31%] top-7 hidden -rotate-6 text-center font-script text-xl leading-tight text-[#10233f] lg:block">
            Healthy<br />Nigerian Meals
          </div>
        </section>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Nutrition Goals</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Edit</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
              {[
                { icon: Flame, label: "Calories", value: targets.calories.toLocaleString(), bg: "bg-red-50", fg: "text-red-500" },
                { icon: Wheat, label: "Carbs", value: `${targets.carbs}g`, bg: "bg-emerald-50", fg: "text-emerald-600" },
                { icon: Dumbbell, label: "Protein", value: `${targets.protein}g`, bg: "bg-violet-50", fg: "text-violet-600" },
                { icon: Droplet, label: "Fats", value: `${targets.fats}g`, bg: "bg-amber-50", fg: "text-amber-500" },
              ].map(({ icon: Icon, label, value, bg, fg }) => (
                <div key={label} className="text-center">
                  <div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-5 w-5 ${fg}`} />
                  </div>
                  <p className="text-sm font-black text-[#10233f]">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meals" className="w-full">
        <div className="flex flex-col gap-3 rounded-2xl border bg-white p-2 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid h-10 w-full grid-cols-3 bg-muted/50 sm:max-w-lg">
            <TabsTrigger value="meals">Today</TabsTrigger>
            <TabsTrigger value="plan">My Plan</TabsTrigger>
            <TabsTrigger value="foods">Meal Library</TabsTrigger>
          </TabsList>
          <div className="flex items-center justify-center gap-2 px-3 text-xs font-medium text-[#294056]">
            <CalendarDays className="h-4 w-4" />
            {new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date())}
          </div>
        </div>

        <TabsContent value="meals" className="space-y-6 mt-6">
          <div id="ai-meal-generator" className="grid grid-cols-1 gap-5 scroll-mt-24 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
            <AIMealGenerator onGenerated={refreshData} />
            <MealDeliverySystem />
          </div>

          {mealPlans.length > 0 && (
            <SwipeableMealCarousel 
              meals={mealPlans}
              onViewRecipe={openRecipe}
              onOrderMeal={handleOrderMeal}
            />
          )}

          <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-primary" /> Nutrition Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {insightItems.map((item) => {
                  const pct = Math.min(100, Math.round((item.value / item.target) * 100) || 0);
                  return (
                    <div key={item.label} className="text-center">
                      <div
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(${item.color} ${pct * 3.6}deg, #edf2ef 0)` }}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-black">{pct}%</div>
                      </div>
                      <p className="mt-2 text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.value} / {item.target}{item.label === "Calories" ? " kcal" : "g"}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-base">Quick Tools</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Scan, label: "Scan Food", action: () => undefined },
                  { icon: BookOpen, label: "Find Recipes", action: () => navigate("/nutrition") },
                  { icon: ChefHat, label: "Create Plan", action: () => document.getElementById("ai-meal-generator")?.scrollIntoView({ behavior: "smooth" }) },
                  { icon: Target, label: "Track Meals", action: () => navigate("/dashboard") },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={action} className="rounded-xl bg-primary/5 p-4 text-center transition hover:bg-primary/10">
                    <Icon className="mx-auto h-5 w-5 text-primary" />
                    <span className="mt-2 block text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plan" className="mt-6 space-y-6">
          <div id="ai-meal-generator-plan"><AIMealGenerator onGenerated={refreshData} /></div>
          {mealPlans.length > 0 && <SwipeableMealCarousel meals={mealPlans} onViewRecipe={openRecipe} onOrderMeal={handleOrderMeal} />}
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
                  <Button variant="ghost" className="w-full justify-between text-primary" onClick={() => toast({ title: food.name, description: food.benefits })}>
                    View nutrition <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
