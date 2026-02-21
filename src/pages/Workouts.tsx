import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Clock, Zap, Play, CheckCircle2, Sparkles, Flame, Target, TrendingUp, Check } from "lucide-react";
import workoutImage from "@/assets/workout-session.jpg";
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator";
import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder";
import { VoiceGuidedWorkout } from "@/components/VoiceGuidedWorkout";
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-8 pb-24 md:pb-8">
      <div className="text-center space-y-2 md:space-y-3 mb-6 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">Workouts</h1>
        <p className="text-muted-foreground text-sm md:text-lg">Transform your body with personalized plans</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="glass mb-4 md:mb-8 p-1 h-auto w-full">
          <TabsTrigger value="plans" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            My Plans
          </TabsTrigger>
          <TabsTrigger value="create" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Create
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-5 md:space-y-8">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <AIWorkoutGenerator onGenerated={refreshData} />
            <VoiceGuidedWorkout />
          </div>
          
          {workoutPlans.length > 0 && (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {workoutPlans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className="group overflow-hidden glass shadow-elevated hover:shadow-premium transition-all duration-500 hover:scale-[1.02] border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="space-y-2 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    {plan.completed && (
                      <div className="p-2 rounded-full bg-green-500/10 ring-1 ring-green-500/20">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm">{plan.exercises} exercises included</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Duration</span>
                      </div>
                      <p className="text-sm font-semibold">{plan.duration}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Level</span>
                      </div>
                      <p className="text-sm font-semibold">{plan.difficulty}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1 col-span-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Flame className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Calories Burned</span>
                      </div>
                      <p className="text-sm font-semibold">{plan.calories}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full relative overflow-hidden group/btn shadow-lg"
                    variant={plan.completed ? "outline" : "default"}
                    disabled={plan.completed}
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {plan.completed ? (
                        <>
                          <Check className="h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Workout
                        </>
                      )}
                    </span>
                    {!plan.completed && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4 mt-4 md:mt-6">
          <CustomWorkoutBuilder onWorkoutCreated={refreshData} />
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <div className="glass p-4 md:p-6 rounded-xl shadow-elevated">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Exercise Library</h2>
            <p className="text-muted-foreground">Browse our collection of effective exercises</p>
          </div>
          
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => (
              <Card 
                key={index} 
                className="group overflow-hidden glass shadow-elevated hover:shadow-premium transition-all duration-500 hover:scale-[1.02] border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {exercise.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{exercise.muscles}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Sets</p>
                      <p className="text-base font-bold">{exercise.sets.split(' ')[0]}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Reps</p>
                      <p className="text-base font-bold">{exercise.reps.split(' ')[0]}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Rest</p>
                      <p className="text-base font-bold">{exercise.rest.split(' ')[0]}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-primary">Pro Tip</p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{exercise.tip}</p>
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
