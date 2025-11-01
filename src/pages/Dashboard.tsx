import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Droplets, Heart, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Flame, label: "Calories Burned", value: "1,240", color: "text-primary" },
    { icon: Activity, label: "Workouts This Week", value: "4", color: "text-secondary" },
    { icon: Droplets, label: "Water Intake", value: "2.5L", color: "text-blue-500" },
    { icon: Heart, label: "Avg Heart Rate", value: "72 bpm", color: "text-red-500" },
  ];

  const todayWorkout = [
    { name: "Push-ups", sets: "3x12", completed: true },
    { name: "Squats", sets: "4x15", completed: true },
    { name: "Plank", sets: "3x45s", completed: false },
    { name: "Jump Rope", sets: "3x2min", completed: false },
  ];

  const todayMeals = [
    { name: "Moi Moi & Pap", calories: 380, time: "Breakfast", eaten: true },
    { name: "Jollof Rice & Grilled Chicken", calories: 520, time: "Lunch", eaten: true },
    { name: "Efo Riro with Ponmo", calories: 450, time: "Dinner", eaten: false },
  ];

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
          <div className="space-y-3">
            {todayWorkout.map((exercise) => (
              <div
                key={exercise.name}
                className={`flex items-center justify-between p-4 rounded-lg border transition-smooth ${
                  exercise.completed ? "bg-secondary/10 border-secondary" : "bg-card"
                }`}
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
              <span className="font-medium">50%</span>
            </div>
            <Progress value={50} />
          </div>
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
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div
                key={meal.name}
                className={`flex items-center justify-between p-4 rounded-lg border transition-smooth ${
                  meal.eaten ? "bg-primary/10 border-primary" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    meal.eaten ? "bg-primary border-primary" : "border-muted"
                  }`}>
                    {meal.eaten && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.time} • {meal.calories} cal</p>
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
              <span className="font-medium">900 / 1,800 cal</span>
            </div>
            <Progress value={50} />
          </div>
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
            Great job staying consistent! Your body is adapting well to the routine. Consider increasing your water intake by 500ml to optimize recovery. Keep pushing! 🔥
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
                <span className="font-medium">80%</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Nutrition Goals Met</span>
                <span className="font-medium">75%</span>
              </div>
              <Progress value={75} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Hydration Target</span>
                <span className="font-medium">90%</span>
              </div>
              <Progress value={90} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
