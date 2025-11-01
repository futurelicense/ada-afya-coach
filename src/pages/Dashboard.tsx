import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Droplets, Heart, TrendingUp, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { aiService } from "@/lib/aiService";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { todayWorkouts, todayMeals, todayStats, weeklyStats, completeExercise, markMealEaten, updateWaterIntake, refreshData } = useUserData();
  const [coachTip, setCoachTip] = useState("");

  useEffect(() => {
    setCoachTip(aiService.getCoachTip());
  }, [todayStats]);

  const weekWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);
  
  const stats = [
    { icon: Flame, label: "Calories Burned", value: todayStats?.caloriesBurned.toLocaleString() || "0", color: "text-primary" },
    { icon: Activity, label: "Workouts This Week", value: weekWorkouts.toString(), color: "text-secondary" },
    { icon: Droplets, label: "Water Intake", value: `${todayStats?.waterIntake || 0}L`, color: "text-blue-500" },
    { icon: Heart, label: "Avg Heart Rate", value: "72 bpm", color: "text-red-500" },
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome Back! 💪</h1>
          <p className="text-muted-foreground mt-2">Let's crush today's goals together</p>
        </div>
        <Badge className="bg-secondary text-secondary-foreground gap-2">
          <Sparkles className="h-4 w-4" />
          AI Powered
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover-scale shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Workout */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Today's Workout Plan</CardTitle>
              <CardDescription>AI-generated based on your goals</CardDescription>
            </div>
            <Button onClick={() => navigate("/workouts")}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {allExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workouts planned for today</p>
              <Button onClick={() => navigate("/workouts")}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Workout
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {allExercises.slice(0, 4).map((exercise) => (
                  <div
                    key={`${exercise.workoutId}-${exercise.name}`}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-smooth cursor-pointer hover:shadow-md ${
                      exercise.completed ? "bg-secondary/10 border-secondary" : "bg-card"
                    }`}
                    onClick={() => completeExercise(exercise.workoutId, exercise.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        exercise.completed ? "bg-secondary border-secondary" : "border-muted"
                      }`}>
                        {exercise.completed && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">{exercise.sets}</p>
                      </div>
                    </div>
                    <Badge variant={exercise.completed ? "default" : "outline"}>
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
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Today's Meal Plan</CardTitle>
              <CardDescription>Nigerian-inspired nutrition</CardDescription>
            </div>
            <Button onClick={() => navigate("/nutrition")}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayMeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meals planned for today</p>
              <Button onClick={() => navigate("/nutrition")}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Meal Plan
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-smooth cursor-pointer hover:shadow-md ${
                      meal.eaten ? "bg-primary/10 border-primary" : "bg-card"
                    }`}
                    onClick={() => markMealEaten(meal.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        meal.eaten ? "bg-primary border-primary" : "border-muted"
                      }`}>
                        {meal.eaten && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.mealType} • {meal.calories} cal</p>
                      </div>
                    </div>
                    <Badge variant={meal.eaten ? "default" : "outline"}>
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

      {/* AI Coach Tip */}
      <Card className="shadow-glow border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Coach Ada's Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {coachTip}
          </p>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Weekly Progress
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
