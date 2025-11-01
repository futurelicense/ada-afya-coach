import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Utensils } from "lucide-react";
import { aiService } from "@/lib/aiService";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";

export const AIMealGenerator = ({ onGenerated }: { onGenerated?: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const meals = aiService.generateMealPlan();
    meals.forEach(meal => userDataService.addMeal(meal));
    
    setIsGenerating(false);
    
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    
    toast({
      title: "Meal Plan Generated! 🍽️",
      description: `3 Nigerian-inspired meals ready. Total: ${totalCalories} calories.`,
    });
    
    onGenerated?.();
  };

  return (
    <Card className="shadow-glow border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Meal Planner
        </CardTitle>
        <CardDescription>
          Get Nigerian-inspired meal suggestions tailored to your nutrition goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Our AI creates balanced meal plans featuring delicious Nigerian cuisine optimized for your fitness goals.
          </p>
        </div>
        <Button 
          onClick={generateMealPlan} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Planning Your Meals...
            </>
          ) : (
            <>
              <Utensils className="mr-2 h-4 w-4" />
              Generate Meal Plan
            </>
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">AI Powered</Badge>
          <span>•</span>
          <span>Nigerian cuisine focused</span>
        </div>
      </CardContent>
    </Card>
  );
};
