import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Clock, Zap, Play, CheckCircle2, Sparkles } from "lucide-react";
import workoutImage from "@/assets/workout-session.jpg";
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator";
import { useUserData } from "@/hooks/useUserData";

const Workouts = () => {
  const { todayWorkouts, refreshData } = useUserData();
  const workoutPlans = todayWorkouts.map(workout => ({
    id: workout.id,
    name: workout.name,
    duration: `${workout.duration} min`,
    difficulty: workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1),
    calories: `${workout.calories} cal`,
    exercises: workout.exercises.length,
    completed: workout.completed,
    image: workoutImage,
  }));

  const exercises = [
    {
      name: "Push-ups",
      sets: "3 sets",
      reps: "12 reps",
      rest: "60s rest",
      tip: "Keep your body in a straight line",
      muscles: "Chest, Triceps, Shoulders",
    },
    {
      name: "Bodyweight Squats",
      sets: "4 sets",
      reps: "15 reps",
      rest: "45s rest",
      tip: "Keep knees behind toes",
      muscles: "Quadriceps, Glutes, Hamstrings",
    },
    {
      name: "Plank Hold",
      sets: "3 sets",
      reps: "45s hold",
      rest: "60s rest",
      tip: "Engage your core throughout",
      muscles: "Core, Shoulders",
    },
    {
      name: "Mountain Climbers",
      sets: "3 sets",
      reps: "20 reps",
      rest: "30s rest",
      tip: "Maintain steady breathing",
      muscles: "Full Body, Cardio",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Workout Plans</h1>
          <p className="text-muted-foreground mt-2">AI-powered exercises tailored for you</p>
        </div>
        <Badge className="bg-secondary text-secondary-foreground gap-2">
          <Sparkles className="h-4 w-4" />
          AI Generated
        </Badge>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4 mt-6">
          <AIWorkoutGenerator onGenerated={refreshData} />
          
          {workoutPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden hover-scale shadow-card">
                <div className="relative h-48">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                  {plan.completed && (
                    <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground rounded-full p-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.exercises} exercises</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {plan.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {plan.calories}
                    </span>
                  </div>
                  <Badge variant={plan.difficulty === "Beginner" ? "outline" : plan.difficulty === "Intermediate" ? "secondary" : "default"}>
                    {plan.difficulty}
                  </Badge>
                  <Button className="w-full" disabled={plan.completed}>
                    {plan.completed ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Workout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((exercise, index) => (
              <Card key={index} className="shadow-card hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    {exercise.name}
                  </CardTitle>
                  <CardDescription>{exercise.muscles}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded-lg text-center">
                      <p className="font-medium">{exercise.sets}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg text-center">
                      <p className="font-medium">{exercise.reps}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg text-center">
                      <p className="font-medium">{exercise.rest}</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                    <p className="text-sm flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">AI Tip: {exercise.tip}</span>
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

export default Workouts;
