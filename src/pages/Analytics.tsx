import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Activity, Flame, Droplets, BarChart3, Calendar, Target, Zap
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { userDataService } from "@/lib/userDataService";

const Analytics = () => {
  const [weeklyData, setWeeklyData] = useState(userDataService.getWeeklyChartData());
  const [totalStats, setTotalStats] = useState(userDataService.getTotalStats());
  const [profile, setProfile] = useState(userDataService.getProfile());

  useEffect(() => {
    setWeeklyData(userDataService.getWeeklyChartData());
    setTotalStats(userDataService.getTotalStats());
    setProfile(userDataService.getProfile());
  }, []);

  const monthlyStats = {
    totalWorkouts: totalStats.totalWorkouts,
    totalCalories: totalStats.totalCaloriesBurned,
    avgHeartRate: 142,
    activeMinutes: totalStats.totalWorkouts * 30,
    goalProgress: 85,
  };

  const bodyMetrics = profile ? [
    { metric: "Weight", current: `${profile.weight}kg`, target: `${profile.targetWeight}kg`, progress: profile.targetWeight > 0 ? Math.min((profile.weight / profile.targetWeight) * 100, 100) : 0, trend: `${profile.weight > 0 ? (profile.weight - profile.targetWeight > 0 ? '+' : '') + (profile.weight - profile.targetWeight).toFixed(1) : 0}kg` },
    { metric: "BMI", current: profile.height > 0 ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : "—", target: "24.0", progress: 85, trend: "Normal" },
  ] : [
    { metric: "Weight", current: "—", target: "—", progress: 0, trend: "Set profile" },
    { metric: "BMI", current: "—", target: "—", progress: 0, trend: "Set profile" },
  ];

  const allMeals = userDataService.getMeals().filter(m => m.eaten);
  const nutritionBreakdown = {
    protein: { current: allMeals.reduce((s, m) => s + m.protein, 0), target: 150, percentage: 0 },
    carbs: { current: allMeals.reduce((s, m) => s + m.carbs, 0), target: 250, percentage: 0 },
    fats: { current: allMeals.reduce((s, m) => s + m.fats, 0), target: 65, percentage: 0 },
    calories: { current: allMeals.reduce((s, m) => s + m.calories, 0), target: 2600, percentage: 0 },
  };
  Object.keys(nutritionBreakdown).forEach(key => {
    const k = key as keyof typeof nutritionBreakdown;
    nutritionBreakdown[k].percentage = Math.min(Math.round((nutritionBreakdown[k].current / nutritionBreakdown[k].target) * 100), 100);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Progress Analytics</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Track your fitness journey with real data
            </p>
          </div>
          <Badge className="gradient-premium text-white border-0 h-fit shadow-glow">
            <BarChart3 className="mr-1 h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      <AICoachPanel />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d shadow-elevated overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-smooth" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-primary/10"><Activity className="h-6 w-6 text-primary" /></div>
                <Badge variant="outline" className="bg-primary/5 border-primary/20">{totalStats.totalWorkouts} total</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Workouts</p>
              <p className="text-3xl font-bold">{monthlyStats.totalWorkouts}</p>
              <div className="mt-4"><CircularProgress value={Math.min(totalStats.totalWorkouts * 10, 100)} size={60} strokeWidth={6} showLabel={false} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d shadow-elevated overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-smooth" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-secondary/10"><Flame className="h-6 w-6 text-secondary" /></div>
                <Badge variant="outline" className="bg-secondary/5 border-secondary/20">{totalStats.currentStreak}d streak</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Calories Burned</p>
              <p className="text-3xl font-bold">{monthlyStats.totalCalories.toLocaleString()}</p>
              <div className="mt-4"><CircularProgress value={Math.min(totalStats.totalCaloriesBurned / 100, 100)} size={60} strokeWidth={6} showLabel={false} color="hsl(var(--secondary))" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d shadow-elevated overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-smooth" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10"><Activity className="h-6 w-6 text-blue-500" /></div>
                <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20">Meals</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Meals Logged</p>
              <p className="text-3xl font-bold">{totalStats.totalMealsLogged}</p>
              <div className="mt-4"><CircularProgress value={Math.min(totalStats.totalMealsLogged * 5, 100)} size={60} strokeWidth={6} showLabel={false} color="rgb(59, 130, 246)" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d shadow-elevated overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-smooth" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-yellow-500/10"><Calendar className="h-6 w-6 text-yellow-500" /></div>
                <Badge variant="outline" className="bg-yellow-500/5 border-yellow-500/20">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Minutes</p>
              <p className="text-3xl font-bold">{monthlyStats.activeMinutes}</p>
              <div className="mt-4"><CircularProgress value={Math.min(monthlyStats.activeMinutes / 10, 100)} size={60} strokeWidth={6} showLabel={false} color="rgb(234, 179, 8)" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="body">Body Metrics</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Workouts Completed</CardTitle>
                <CardDescription>Daily workout frequency this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                    <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-secondary" />Calories Burned</CardTitle>
                <CardDescription>Weekly calorie burn trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                    <Area type="monotone" dataKey="calories" stroke="hsl(var(--secondary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-blue-500" />Water Intake</CardTitle>
              <CardDescription>Daily hydration tracking (Liters)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 3.5]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                  <Line type="monotone" dataKey="water" stroke="rgb(59, 130, 246)" strokeWidth={3} dot={{ fill: 'rgb(59, 130, 246)', r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-4 mt-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Body Composition</CardTitle>
              <CardDescription>Based on your profile data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bodyMetrics.map((metric, idx) => (
                  <div key={idx} className="group relative p-6 rounded-2xl border glass hover:shadow-premium transition-smooth overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-smooth" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-xl">{metric.metric}</h4>
                        <Badge className="gradient-premium text-white border-0">{metric.trend}</Badge>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Current</span>
                        <span className="font-bold text-3xl text-primary">{metric.current}</span>
                      </div>
                      <div className="relative h-3 mb-3">
                        <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
                          <div className="h-full gradient-primary transition-all duration-1000 ease-out rounded-full" style={{ width: `${metric.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Target</span>
                        <span className="font-medium text-lg">{metric.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Macro Breakdown</CardTitle>
                <CardDescription>Total intake from logged meals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(nutritionBreakdown).map(([key, data]) => (
                  <div key={key} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold capitalize text-lg">{key}</h4>
                      <div className="text-right">
                        <span className="font-bold text-2xl text-primary">{data.current}</span>
                        <span className="text-muted-foreground text-sm"> / {data.target}</span>
                      </div>
                    </div>
                    <div className="relative h-4 mb-1">
                      <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-primary transition-all duration-1000 ease-out group-hover:shadow-glow rounded-full" style={{ width: `${data.percentage}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-right font-medium text-primary">{data.percentage}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Daily Progress</CardTitle>
                <CardDescription>Visual macro achievement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(nutritionBreakdown).map(([key, data]) => (
                    <div key={key} className="flex flex-col items-center gap-3">
                      <CircularProgress 
                        value={data.percentage} 
                        size={120} 
                        strokeWidth={10}
                        color={key === 'protein' ? 'hsl(var(--primary))' : key === 'carbs' ? 'hsl(var(--secondary))' : key === 'fats' ? 'rgb(234, 179, 8)' : 'rgb(59, 130, 246)'}
                      />
                      <div className="text-center">
                        <p className="font-semibold capitalize">{key}</p>
                        <p className="text-xs text-muted-foreground">{data.current} / {data.target}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
