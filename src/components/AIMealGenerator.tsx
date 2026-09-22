import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Utensils } from "lucide-react";
import { aiService } from "@/lib/aiService";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

export const AIMealGenerator = ({ onGenerated }: { onGenerated?: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const generateMealPlan = async () => {
    if (!session) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Sign in to generate AI meal plans.' })
      return
    }

    setIsGenerating(true);

    try {
      const profile = await userDataService.getProfile();
      const result  = await aiService.generateMealPlan({
        dietPreference: profile ? undefined : undefined,
      });

      const meals = result.meals ?? [];
      await Promise.all(meals.map((meal: any) => userDataService.addMeal(meal)));
      track.aiMealGenerated('standard');

      toast({
        title: "Meal Plan Generated! 🍽️",
        description: `${meals.length} Nigerian-inspired meals ready. Total: ${result.totalCalories ?? 0} calories.`,
      });

      onGenerated?.();
    } catch (err: any) {
      const isLimit = err?.status === 429
      toast({
        variant:     'destructive',
        title:       isLimit ? 'Daily limit reached' : 'Generation failed',
        description: isLimit
          ? "You've hit today's limit. Upgrade to Pro for more AI sessions!"
          : 'Could not generate meal plan. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
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
            Coach Ada creates balanced meal plans featuring delicious Nigerian cuisine optimised for your fitness goals.
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
