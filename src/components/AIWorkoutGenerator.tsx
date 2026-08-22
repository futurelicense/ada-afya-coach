import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Dumbbell } from "lucide-react";
import { aiService } from "@/lib/aiService";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

export const AIWorkoutGenerator = ({ onGenerated }: { onGenerated?: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const generateWorkout = async () => {
    if (!session) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Sign in to generate AI workouts.' })
      return
    }

    setIsGenerating(true);

    try {
      const profile = await userDataService.getProfile();
      const level   = profile?.fitnessLevel || 'intermediate';

      const workout = await aiService.generateWorkoutPlan({
        durationMinutes: level === 'beginner' ? 30 : level === 'advanced' ? 60 : 45,
      });

      await userDataService.addWorkout(workout);
      track.aiWorkoutGenerated(level);

      toast({
        title: "Workout Generated! 💪",
        description: `${workout.name} is ready. ${workout.exercises?.length ?? 0} exercises, ${workout.duration} minutes.`,
      });

      onGenerated?.();
    } catch (err: any) {
      const isLimit = err?.status === 429
      toast({
        variant:     'destructive',
        title:       isLimit ? 'Daily limit reached' : 'Generation failed',
        description: isLimit
          ? "You've hit today's limit. Upgrade to Pro for more AI sessions!"
          : 'Could not generate workout. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-glow border-primary overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          AI Workout Generator
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Get a personalised workout plan tailored to your fitness level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="bg-secondary/10 border border-secondary/20 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Coach Ada analyses your fitness level, goals, and progress to create the perfect workout routine for you.
          </p>
        </div>
        <Button
          onClick={generateWorkout}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Your Workout...
            </>
          ) : (
            <>
              <Dumbbell className="mr-2 h-4 w-4" />
              Generate New Workout
            </>
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">AI Powered</Badge>
          <span>•</span>
          <span>Personalised just for you</span>
        </div>
      </CardContent>
    </Card>
  );
};
