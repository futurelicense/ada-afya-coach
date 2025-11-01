import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Activity, 
  Flame, 
  Droplets, 
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";

const Analytics = () => {
  // Mock data for charts and analytics
  const weeklyData = [
    { day: "Mon", workouts: 1, calories: 420, water: 2.5 },
    { day: "Tue", workouts: 1, calories: 380, water: 3.0 },
    { day: "Wed", workouts: 1, calories: 450, water: 2.8 },
    { day: "Thu", workouts: 1, calories: 390, water: 2.2 },
    { day: "Fri", workouts: 1, calories: 410, water: 3.1 },
    { day: "Sat", workouts: 0, calories: 0, water: 1.8 },
    { day: "Sun", workouts: 0, calories: 0, water: 2.0 },
  ];

  const monthlyStats = {
    totalWorkouts: 24,
    totalCalories: 9840,
    avgHeartRate: 142,
    activeMinutes: 720,
    goalProgress: 85,
  };

  const bodyMetrics = [
    { metric: "Weight", current: "72kg", target: "75kg", progress: 96, trend: "+3kg" },
    { metric: "Body Fat", current: "18%", target: "15%", progress: 67, trend: "-3%" },
    { metric: "Muscle Mass", current: "62kg", target: "65kg", progress: 80, trend: "+2kg" },
    { metric: "BMI", current: "23.5", target: "24.0", progress: 92, trend: "+0.5" },
  ];

  const nutritionBreakdown = {
    protein: { current: 145, target: 150, percentage: 97 },
    carbs: { current: 220, target: 250, percentage: 88 },
    fats: { current: 58, target: 65, percentage: 89 },
    calories: { current: 2450, target: 2600, percentage: 94 },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your fitness journey with AI-powered insights</p>
        </div>
        <Badge variant="secondary" className="h-fit">
          <BarChart3 className="mr-1 h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      {/* AI Coach Panel */}
      <AICoachPanel />

      {/* Monthly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-scale shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <Badge variant="outline">+8%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Workouts</p>
            <p className="text-3xl font-bold mt-1">{monthlyStats.totalWorkouts}</p>
          </CardContent>
        </Card>

        <Card className="hover-scale shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-5 w-5 text-secondary" />
              <Badge variant="outline">+12%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Calories Burned</p>
            <p className="text-3xl font-bold mt-1">{monthlyStats.totalCalories.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="hover-scale shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <Badge variant="outline">Avg</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Heart Rate</p>
            <p className="text-3xl font-bold mt-1">{monthlyStats.avgHeartRate} bpm</p>
          </CardContent>
        </Card>

        <Card className="hover-scale shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline">Target</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Active Minutes</p>
            <p className="text-3xl font-bold mt-1">{monthlyStats.activeMinutes}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="body">Body Metrics</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        {/* Weekly Progress */}
        <TabsContent value="weekly" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Activity Overview
              </CardTitle>
              <CardDescription>Your activity for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workout Chart */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Workouts Completed
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`h-24 rounded-lg flex items-center justify-center transition-smooth ${
                        day.workouts > 0 ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted'
                      }`}>
                        <div>
                          <p className="text-2xl font-bold">{day.workouts}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{day.day}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calories Chart */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Calories Burned
                </h4>
                <div className="space-y-2">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <p className="text-sm font-medium w-12">{day.day}</p>
                      <div className="flex-1">
                        <Progress value={(day.calories / 500) * 100} />
                      </div>
                      <p className="text-sm font-bold w-16 text-right">{day.calories} cal</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydration Chart */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Water Intake (Liters)
                </h4>
                <div className="space-y-2">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <p className="text-sm font-medium w-12">{day.day}</p>
                      <div className="flex-1">
                        <Progress value={(day.water / 3.5) * 100} />
                      </div>
                      <p className="text-sm font-bold w-16 text-right">{day.water}L</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Metrics */}
        <TabsContent value="body" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Body Composition Tracking
              </CardTitle>
              <CardDescription>Monitor your physical transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bodyMetrics.map((metric, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-gradient-card shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg">{metric.metric}</h4>
                      <Badge variant="secondary">{metric.trend}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-bold text-primary text-lg">{metric.current}</span>
                      </div>
                      <Progress value={metric.progress} className="h-3" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-medium">{metric.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition */}
        <TabsContent value="nutrition" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Nutrition Breakdown
              </CardTitle>
              <CardDescription>Daily macro targets and intake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(nutritionBreakdown).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{key}</h4>
                      <div className="text-right">
                        <span className="font-bold text-primary">{data.current}</span>
                        <span className="text-muted-foreground text-sm"> / {data.target}</span>
                        <span className="text-xs text-muted-foreground ml-2">({data.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
