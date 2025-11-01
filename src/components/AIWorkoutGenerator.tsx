import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Dumbbell } from "lucide-react";
import { aiService } from "@/lib/aiService";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";

export const AIWorkoutGenerator = ({ onGenerated }: { onGenerated?: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWorkout = async () => {
    setIsGenerating(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const profile = userDataService.getProfile();
    const level = profile?.fitnessLevel || 'intermediate';
    
    const workout = aiService.generateWorkoutPlan(level);
    userDataService.addWorkout(workout);
    
    setIsGenerating(false);
    
    toast({
      title: "Workout Generated! 💪",
      description: `${workout.name} is ready for you. ${workout.exercises.length} exercises, ${workout.duration} minutes.`,
    });
    
    onGenerated?.();
  };

  return (
    <Card className="shadow-glow border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Workout Generator
        </CardTitle>
        <CardDescription>
          Get a personalized workout plan tailored to your fitness level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Our AI analyzes your fitness level, goals, and progress to create the perfect workout routine for you.
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
          <span>Personalized just for you</span>
        </div>
      </CardContent>
    </Card>
  );
};
