import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Droplets, Heart, TrendingUp, Sparkles, Plus, Zap, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { AICoachPanel } from "@/components/AICoachPanel";
import { AIChatCoach } from "@/components/AIChatCoach";
import { GamificationPanel } from "@/components/GamificationPanel";
import { CircularProgress } from "@/components/CircularProgress";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { todayWorkouts, todayMeals, todayStats, weeklyStats, completeExercise, markMealEaten, updateWaterIntake, refreshData } = useUserData();
  const [greeting, setGreeting] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const weekWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);
  
  const stats = [
    { 
      icon: Flame, 
      label: "Calories Burned", 
      value: todayStats?.caloriesBurned.toLocaleString() || "0", 
      color: "text-primary",
      bgGradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10"
    },
    { 
      icon: Activity, 
      label: "Workouts This Week", 
      value: weekWorkouts.toString(), 
      color: "text-secondary",
      bgGradient: "from-secondary/10 to-secondary/5",
      iconBg: "bg-secondary/10"
    },
    { 
      icon: Droplets, 
      label: "Water Intake", 
      value: `${todayStats?.waterIntake || 0}L`, 
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-blue-500/5",
      iconBg: "bg-blue-500/10"
    },
    { 
      icon: Zap, 
      label: "Current Streak", 
      value: "5 days", 
      color: "text-orange-500",
      bgGradient: "from-orange-500/10 to-orange-500/5",
      iconBg: "bg-orange-500/10"
    },
  ];

  const allExercises = todayWorkouts.flatMap(w => 
    w.exercises.map(ex => ({
      ...ex,
      workoutId: w.id,
      sets: `${ex.sets}x${ex.reps}`,
    }))
  );

  const workoutProgress = allExercises.length > 0 
    ? (allExercises.filter(ex => ex.completed).length / allExercises.length) * 100 
    : 0;

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const consumedCalories = todayMeals.filter(m => m.eaten).reduce((sum, m) => sum + m.calories, 0);
  const mealProgress = totalCalories > 0 ? (consumedCalories / totalCalories) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Personalized Greeting */}
      <div className="glass rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] float"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] float" style={{ animationDelay: '2s' }}></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gradient">{greeting}! 👋</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-2">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">Ready to crush your fitness goals today?</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/workouts")} className="shadow-glow gap-2">
              <Target className="h-4 w-4" />
              Start Workout
            </Button>
            <Button variant="outline" onClick={() => navigate("/nutrition")} className="gap-2">
              View Meal Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, idx) => (
          <Card 
            key={stat.label} 
            className={cn(
              "glass hover:shadow-premium transition-all duration-300 stagger-item group overflow-hidden relative border-0",
              mounted && "animate-scale-in"
            )}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.bgGradient)}></div>
            <CardContent className="p-4 lg:p-6 relative z-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-transform duration-300", stat.iconBg)}>
                    <stat.icon className={cn("h-5 w-5 lg:h-6 lg:w-6", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview with Circular Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-stretch">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Workout Progress</h3>
            </div>
            <CircularProgress value={workoutProgress} gradient />
            <p className="text-sm text-muted-foreground text-center">
              {allExercises.filter(ex => ex.completed).length} of {allExercises.length} exercises completed
            </p>
          </CardContent>
        </Card>

        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-stretch">
              <Flame className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Nutrition Goals</h3>
            </div>
            <CircularProgress value={mealProgress} gradient />
            <p className="text-sm text-muted-foreground text-center">
              {consumedCalories} / {totalCalories} calories consumed
            </p>
          </CardContent>
        </Card>

        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-stretch">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Hydration</h3>
            </div>
            <CircularProgress value={todayStats ? (todayStats.waterIntake / 3) * 100 : 0} />
            <p className="text-sm text-muted-foreground text-center">
              {todayStats?.waterIntake || 0}L of 3L daily goal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Coach Chat & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIChatCoach />
        <GamificationPanel />
      </div>

      {/* AI Coach Panel */}
      <AICoachPanel />

      {/* Today's Workout */}
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Today's Workout Plan</CardTitle>
                <CardDescription>AI-generated based on your goals</CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate("/workouts")} className="shadow-glow">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {allExercises.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">No workouts planned for today</p>
              <Button onClick={() => navigate("/workouts")} className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Generate Workout
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {allExercises.slice(0, 4).map((exercise, idx) => (
                  <div
                    key={`${exercise.workoutId}-${exercise.name}`}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer group stagger-item",
                      exercise.completed 
                        ? "glass bg-secondary/5 border-secondary/30 shadow-card" 
                        : "glass hover:shadow-elevated hover:border-primary/30"
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => completeExercise(exercise.workoutId, exercise.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        exercise.completed 
                          ? "bg-secondary border-secondary shadow-glow" 
                          : "border-muted group-hover:border-primary group-hover:scale-110"
                      )}>
                        {exercise.completed ? (
                          <span className="text-white text-sm font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground text-xl group-hover:scale-110 transition-transform">•</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">{exercise.sets}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={exercise.completed ? "default" : "outline"}
                      className={exercise.completed ? "shadow-glow" : ""}
                    >
                      {exercise.completed ? "Done" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round(workoutProgress)}%</span>
                </div>
                <Progress value={workoutProgress} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Flame className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Today's Meal Plan</CardTitle>
                <CardDescription>Nigerian-inspired nutrition</CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate("/nutrition")} className="shadow-glow">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-muted-foreground mb-4">No meals planned for today</p>
              <Button onClick={() => navigate("/nutrition")} className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Generate Meal Plan
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {todayMeals.map((meal, idx) => (
                  <div
                    key={meal.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer group stagger-item",
                      meal.eaten 
                        ? "glass bg-primary/5 border-primary/30 shadow-card" 
                        : "glass hover:shadow-elevated hover:border-secondary/30"
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => markMealEaten(meal.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        meal.eaten 
                          ? "bg-primary border-primary shadow-glow" 
                          : "border-muted group-hover:border-secondary group-hover:scale-110"
                      )}>
                        {meal.eaten ? (
                          <span className="text-white text-sm font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground text-xl group-hover:scale-110 transition-transform">•</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.mealType} • {meal.calories} cal</p>
                      </div>
                    </div>
                    <Badge 
                      variant={meal.eaten ? "default" : "outline"}
                      className={meal.eaten ? "shadow-glow" : ""}
                    >
                      {meal.eaten ? "Eaten" : "Planned"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Daily Calories</span>
                  <span className="font-medium">{consumedCalories} / {totalCalories} cal</span>
                </div>
                <Progress value={mealProgress} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary/10">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Workout Completion</span>
                <span className="font-medium">{Math.round(workoutProgress)}%</span>
              </div>
              <Progress value={workoutProgress} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Nutrition Goals Met</span>
                <span className="font-medium">{Math.round(mealProgress)}%</span>
              </div>
              <Progress value={mealProgress} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Hydration Target</span>
                <span className="font-medium">{todayStats ? Math.round((todayStats.waterIntake / 3) * 100) : 0}%</span>
              </div>
              <Progress value={todayStats ? (todayStats.waterIntake / 3) * 100 : 0} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
