import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Droplets, Heart, TrendingUp, Sparkles, Plus, Zap, Target, Award, Scan, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { GamificationPanel } from "@/components/GamificationPanel";
import { CircularProgress } from "@/components/CircularProgress";
import { DataUpdatePrompt } from "@/components/DataUpdatePrompt";
import { ScanFoodButton } from "@/components/ScanFoodButton";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { userDataService } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";
import { paystackService } from "@/lib/paystackService";
import { track } from "@/lib/analytics";
import { NumberTicker } from "@/components/NumberTicker";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Verify Paystack payment when user returns from checkout
  useEffect(() => {
    const payment   = searchParams.get('payment');
    const reference = searchParams.get('reference') ?? searchParams.get('trxref');
    if (payment !== 'success' || !reference) return;

    // Remove query params immediately to avoid re-running on refresh
    setSearchParams({}, { replace: true });

    paystackService.verifyPayment(reference).then(({ plan }) => {
      track.paymentCompleted(plan);
      toast({
        title:       `Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)}! 🎉`,
        description: 'Your subscription is now active. Enjoy full access.',
      });
    }).catch(() => {
      toast({
        variant:     'destructive',
        title:       'Payment check failed',
        description: 'We could not confirm your payment. Contact support if your card was charged.',
      });
    });
  }, []);

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
    { icon: Droplets, label: "Water Intake",        numValue: todayStats?.waterIntake ?? 0,   value: "",                             suffix: "L",     color: "text-blue-500",     bgGradient: "from-blue-500/10 to-blue-500/5",   iconBg: "bg-blue-500/10",  decimals: 1 },
    { icon: Zap,      label: "Current Streak",      numValue: streak,                         value: "",                             suffix: " days", color: "text-amber-500",    bgGradient: "from-amber-500/10 to-amber-500/5", iconBg: "bg-amber-500/10" },
  ];

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
           style={{ background: "linear-gradient(135deg, hsl(265 48% 9%) 0%, hsl(270 53% 6%) 100%)" }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-[80px] pointer-events-none float" style={{ animationDelay: "2s" }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-display font-black text-white">
                {greeting}! 👋
              </h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5">
                <Sparkles className="h-3 w-3" /> AI Powered
              </Badge>
            </div>
            <p className="text-white/50 text-base lg:text-lg">
              {streak > 0 ? `${streak}-day streak — keep it going! 🔥` : "Ready to crush your fitness goals today?"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/workouts")} className="shadow-glow gap-2 bg-primary hover:bg-primary/90">
              <Target className="h-4 w-4" /> Start Workout
            </Button>
            <ScanFoodButton variant="secondary" className="shadow-gold" />
            <Button variant="outline" onClick={() => navigate("/nutrition")}
                    className="gap-2 border-white/20 text-white hover:bg-white/10">
              Meal Plan
            </Button>
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
      <Card className="glass shadow-card hover:shadow-premium transition-all duration-300 border-0">
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
          {allExercises.length === 0 ? (
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
            <>
              <div className="space-y-3">
                {allExercises.slice(0, 4).map((exercise, idx) => (
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
            </>
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
              <div className="space-y-3">
                {todayMeals.map((meal, idx) => (
                  <div
                    key={meal.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group stagger-item",
                      meal.eaten ? "glass bg-primary/5 border-primary/30 shadow-card" : "glass hover:shadow-elevated hover:border-secondary/30"
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => markMealEaten(meal.id)}>
                      <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300", meal.eaten ? "bg-primary border-primary shadow-glow" : "border-muted group-hover:border-secondary group-hover:scale-110")}>
                        {meal.eaten ? <span className="text-white text-sm font-bold">✓</span> : <span className="text-muted-foreground text-xl group-hover:scale-110 transition-transform">•</span>}
                      </div>
                      <div>
                        <p className="font-semibold">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.mealType} • {meal.calories} cal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={meal.eaten ? "default" : "outline"} className={meal.eaten ? "shadow-glow" : ""}>
                        {meal.eaten ? "Eaten" : "Planned"}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteMeal(meal.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
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
    </div>
  );
};

export default Dashboard;
