"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Dumbbell } from "lucide-react";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { VoiceGuidedWorkout } from "@/components/VoiceGuidedWorkout";
import { useToast } from "@/hooks/use-toast";

function WorkoutSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);

  const workoutName = searchParams?.get("name")
    ? decodeURIComponent(searchParams.get("name")!)
    : "My Workout";

  const handleComplete = () => {
    setCompleted(true);
    toast({
      title: "Workout Complete! 🎉",
      description: `Great job finishing ${workoutName}! Your progress has been saved.`,
    });
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-xl border-primary/20">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-gradient">Workout Complete!</h1>
            <p className="text-muted-foreground">
              You crushed <strong>{workoutName}</strong>. Every rep counts!
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4</p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">~30</p>
              <p className="text-xs text-muted-foreground">Min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">~280</p>
              <p className="text-xs text-muted-foreground">Cal</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button className="w-full shadow-glow" onClick={() => router.push("/workouts")}>
              Return to Workouts
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workouts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-semibold truncate">{workoutName}</h1>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">In Progress</Badge>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-12">
        <VoiceGuidedWorkout />

        <WorkoutTimer
          exerciseName="Push-ups"
          sets={3}
          reps={12}
          restTime={60}
          onComplete={handleComplete}
        />

        <div className="text-center pt-4">
          <Button variant="outline" className="text-muted-foreground" onClick={handleComplete}>
            <Trophy className="mr-2 h-4 w-4" />
            Mark Workout as Complete
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-3">
            <Dumbbell className="h-12 w-12 text-primary mx-auto animate-bounce" />
            <p className="text-muted-foreground">Loading workout...</p>
          </div>
        </div>
      }
    >
      <WorkoutSessionContent />
    </Suspense>
  );
}
