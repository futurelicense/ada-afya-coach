import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Flame, Droplets, TrendingUp, Sparkles, Plus, Zap, Target, Scan, Trash2,
  Clock, BarChart3, Coffee, Soup, Moon, Apple, Leaf,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { GamificationPanel } from "@/components/GamificationPanel";
import { CircularProgress } from "@/components/CircularProgress";
import { DataUpdatePrompt } from "@/components/DataUpdatePrompt";
import { ScanFoodButton } from "@/components/ScanFoodButton";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";
import { NumberTicker } from "@/components/NumberTicker";
import heroImage from "@/assets/hero-fitness.jpg";
import workoutImage from "@/assets/workout-session.jpg";

const MEAL_ICON: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Soup,
  dinner: Moon,
  snack: Apple,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { todayWorkouts, todayMeals, todayStats, weeklyStats, completeExercise, markMealEaten, updateWaterIntake, deleteWorkout, deleteMeal } = useUserData();
  const [greeting, setGreeting] = useState("");
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    userDataService.getCurrentStreak().then(setStreak);
  }, [todayWorkouts]);

  const weekWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);

  const handleAddWater = (amount: number) => {
    updateWaterIntake(amount);
    toast({ title: `+${amount}L water added 💧`, description: `Total: ${((todayStats?.waterIntake || 0) + amount).toFixed(1)}L` });
  };

  const handleDeleteWorkout = async (id: string) => {
    await deleteWorkout(id);
    toast({ title: "Workout removed", description: "Workout has been deleted" });
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    toast({ title: "Meal removed", description: "Meal has been deleted" });
  };

  const stats = [
    { icon: Flame,    label: "Calories Burned",   numValue: todayStats?.caloriesBurned ?? 0, value: "",                             suffix: " kcal", color: "text-primary",      bgGradient: "from-primary/10 to-primary/5",     iconBg: "bg-primary/10" },
    { icon: Activity, label: "Workouts This Week", numValue: weekWorkouts,                    value: "",                             suffix: "",      color: "text-secondary",    bgGradient: "from-secondary/10 to-secondary/5", iconBg: "bg-secondary/10" },
    { icon: Droplets, label: "Water Intake",        numValue: todayStats?.waterIntake ?? 0,   value: "",                             suffix: "L",     color: "text-info",         bgGradient: "from-info/10 to-info/5",           iconBg: "bg-info/10",       decimals: 1 },
    { icon: Zap,      label: "Current Streak",      numValue: streak,                         value: "",                             suffix: " days", color: "text-success",      bgGradient: "from-success/10 to-success/5",     iconBg: "bg-success/10" },
  ];

  const featuredWorkout = todayWorkouts[0];
  const featuredExercises = featuredWorkout?.exercises.map(ex => ({ ...ex, workoutId: featuredWorkout.id, sets: `${ex.sets}x${ex.reps}` })) ?? [];

  const allExercises = todayWorkouts.flatMap(w =>
    w.exercises.map(ex => ({ ...ex, workoutId: w.id, sets: `${ex.sets}x${ex.reps}` }))
  );

  const workoutProgress = allExercises.length > 0
    ? (allExercises.filter(ex => ex.completed).length / allExercises.length) * 100 : 0;

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const consumedCalories = todayMeals.filter(m => m.eaten).reduce((sum, m) => sum + m.calories, 0);
  const mealProgress = totalCalories > 0 ? (consumedCalories / totalCalories) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <DataUpdatePrompt />

      {/* Greeting */}
      <div className="relative overflow-hidden rounded-3xl shadow-premium border border-primary/10"
           style={{ background: "linear-gradient(135deg, hsl(150 45% 94%) 0%, hsl(140 40% 90%) 100%)" }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-[80px] pointer-events-none float" style={{ animationDelay: "2s" }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(158 60% 20%) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-display font-black text-foreground">
                {greeting}! 👋
              </h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5">
                <Sparkles className="h-3 w-3" /> AI Powered
              </Badge>
            </div>
            <p className="text-muted-foreground text-base lg:text-lg">
              {streak > 0 ? `${streak}-day streak — keep it going! 🔥` : "Ready to crush your fitness goals today?"}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => navigate("/workouts")} className="shadow-glow gap-2 bg-primary hover:bg-primary/90">
                <Target className="h-4 w-4" /> Start Workout
              </Button>
              <ScanFoodButton variant="secondary" className="shadow-gold" />
              <Button variant="outline" onClick={() => navigate("/nutrition")} className="gap-2">
                Meal Plan
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-2 shrink-0">
            <span className="font-script text-2xl text-primary -rotate-2">Stronger, Happier You</span>
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-premium border-4 border-white">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="glass rounded-xl px-3 py-2 text-center max-w-[10rem] -mt-4 shadow-card">
              <p className="text-[11px] text-muted-foreground leading-snug">"Small steps today, big results tomorrow."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={stat.label}
            className={cn("group overflow-hidden relative border border-border/40 hover:border-primary/25 hover:shadow-premium transition-all duration-300 stagger-item", mounted && "animate-scale-in")}
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", stat.bgGradient)} />
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: `var(--gradient-${idx < 2 ? "primary" : "gold"})` }} />
            <CardContent className="p-4 lg:p-5 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</p>
                <div className={cn("p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300", stat.iconBg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <p className={cn("text-2xl lg:text-3xl font-display font-black", stat.color)}>
                <NumberTicker value={stat.numValue} suffix={stat.suffix} decimals={(stat as any).decimals} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress + Water Intake */}
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
            <Button size="sm" className="w-full" onClick={() => navigate("/workouts")}>Continue Workout</Button>
          </CardContent>
        </Card>

        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-stretch">
              <Flame className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold">Nutrition Goals</h3>
            </div>
            <CircularProgress value={mealProgress} color="hsl(var(--secondary))" />
            <p className="text-sm text-muted-foreground text-center">
              {consumedCalories} / {totalCalories} calories consumed
            </p>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/nutrition")}>Log a Meal</Button>
          </CardContent>
        </Card>

        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-stretch">
              <Droplets className="h-5 w-5 text-info" />
              <h3 className="font-semibold">Hydration</h3>
            </div>
            <CircularProgress value={todayStats ? (todayStats.waterIntake / 3) * 100 : 0} color="hsl(var(--info))" />
            <p className="text-sm text-muted-foreground text-center">
              {todayStats?.waterIntake?.toFixed(1) || 0}L of 3L daily goal
            </p>
            <div className="flex gap-2 w-full">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleAddWater(0.25)}>+0.25L</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleAddWater(0.5)}>+0.5L</Button>
              <Button size="sm" className="flex-1 text-xs" onClick={() => handleAddWater(1)}>+1L</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamification */}
      <GamificationPanel />

      {/* Today's Workout */}
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle className="text-2xl">Today's Workout Plan</CardTitle>
                <CardDescription>AI-generated based on your goals</CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate("/workouts")} className="shadow-glow">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!featuredWorkout || featuredExercises.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">No workouts planned for today</p>
              <Button onClick={() => navigate("/workouts")} className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />Generate Workout
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-[220px_1fr] gap-5">
              <div className="relative rounded-2xl overflow-hidden h-40 md:h-full min-h-[160px]">
                <img src={workoutImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-lg leading-tight">{featuredWorkout.name}</p>
                  <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredWorkout.duration} min</span>
                    <span className="flex items-center gap-1 capitalize"><BarChart3 className="h-3 w-3" /> {featuredWorkout.difficulty}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-3">
                  {featuredExercises.map((exercise, idx) => (
                    <div
                      key={`${exercise.workoutId}-${exercise.name}`}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group stagger-item",
                        exercise.completed ? "glass bg-secondary/5 border-secondary/30 shadow-card" : "glass hover:shadow-elevated hover:border-primary/30"
                      )}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => completeExercise(exercise.workoutId, exercise.name)}>
                        <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300", exercise.completed ? "bg-secondary border-secondary shadow-glow" : "border-muted group-hover:border-primary group-hover:scale-110")}>
                          {exercise.completed ? <span className="text-white text-sm font-bold">✓</span> : <span className="text-muted-foreground text-xl group-hover:scale-110 transition-transform">•</span>}
                        </div>
                        <div>
                          <p className="font-semibold">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">{exercise.sets}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={exercise.completed ? "default" : "outline"} className={exercise.completed ? "shadow-glow" : ""}>
                          {exercise.completed ? "Done" : "Pending"}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteWorkout(exercise.workoutId)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10"><Flame className="h-5 w-5 text-secondary" /></div>
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
                <Plus className="mr-2 h-4 w-4" />Generate Meal Plan
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {todayMeals.map((meal, idx) => {
                  const MealIcon = MEAL_ICON[meal.mealType] ?? Soup;
                  return (
                    <div
                      key={meal.id}
                      className={cn(
                        "relative rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 group stagger-item cursor-pointer",
                        meal.eaten ? "glass bg-primary/5 border-primary/30 shadow-card" : "glass hover:shadow-elevated hover:border-secondary/30"
                      )}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      onClick={() => markMealEaten(meal.id)}
                    >
                      <Button
                        size="sm" variant="ghost" className="h-6 w-6 p-0 absolute top-2 right-2 z-10"
                        onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        meal.eaten ? "bg-primary text-white shadow-glow" : "bg-secondary/10 text-secondary"
                      )}>
                        <MealIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] capitalize mb-1">{meal.mealType}</Badge>
                        <p className="font-semibold text-sm leading-tight">{meal.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{meal.calories} kcal</p>
                      </div>
                      <Badge variant={meal.eaten ? "default" : "outline"} className={cn("w-fit text-[10px]", meal.eaten ? "shadow-glow" : "")}>
                        {meal.eaten ? "Eaten" : "Planned"}
                      </Badge>
                    </div>
                  );
                })}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10"><TrendingUp className="h-5 w-5 text-secondary" /></div>
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Workout Completion</span><span className="font-medium">{Math.round(workoutProgress)}%</span></div>
                <Progress value={workoutProgress} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Nutrition Goals Met</span><span className="font-medium">{Math.round(mealProgress)}%</span></div>
                <Progress value={mealProgress} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Hydration Target</span><span className="font-medium">{todayStats ? Math.round((todayStats.waterIntake / 3) * 100) : 0}%</span></div>
                <Progress value={todayStats ? (todayStats.waterIntake / 3) * 100 : 0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card overflow-hidden relative flex flex-col justify-center"
              style={{ background: "linear-gradient(160deg, hsl(150 45% 95%) 0%, hsl(140 40% 91%) 100%)" }}>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <CardContent className="p-6 relative z-10 text-center space-y-2">
            <Leaf className="h-8 w-8 text-primary mx-auto" />
            <p className="font-display font-bold text-lg">You're doing great!</p>
            <p className="text-sm text-muted-foreground">Consistent effort today builds a healthier, happier you tomorrow.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
