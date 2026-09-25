import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Flame, Droplets, BarChart3, Calendar, Target, Dumbbell, Utensils, Clock, Trophy, Leaf
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { Goal, userDataService, UserProfile } from "@/lib/userDataService";
import { PageHero } from "@/components/PageHero";
import heroImage from "@/assets/reference/analytics-hero.png";

const EMPTY_TOTAL_STATS = { totalWorkouts: 0, totalCaloriesBurned: 0, totalActiveMinutes: 0, totalMealsLogged: 0, goalsAchieved: 0, currentStreak: 0 };

const Analytics = () => {
  const [weeklyData, setWeeklyData] = useState<Awaited<ReturnType<typeof userDataService.getWeeklyChartData>>>([]);
  const [totalStats, setTotalStats] = useState(EMPTY_TOTAL_STATS);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allMeals, setAllMeals] = useState<Awaited<ReturnType<typeof userDataService.getMeals>>>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    userDataService.getWeeklyChartData().then(setWeeklyData);
    userDataService.getTotalStats().then(setTotalStats);
    userDataService.getProfile().then(setProfile);
    userDataService.getMeals().then(meals => setAllMeals(meals.filter(m => m.eaten)));
    userDataService.getGoals().then(setGoals);
  }, []);

  const goalProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => {
        const progress = goal.type === "weight" && goal.startValue > goal.target
          ? ((goal.startValue - goal.current) / Math.max(goal.startValue - goal.target, 1)) * 100
          : (goal.current / Math.max(goal.target, 1)) * 100;
        return sum + Math.max(0, Math.min(progress, 100));
      }, 0) / goals.length)
    : 0;

  const monthlyStats = {
    totalWorkouts: totalStats.totalWorkouts,
    totalCalories: totalStats.totalCaloriesBurned,
    activeMinutes: totalStats.totalActiveMinutes,
    goalProgress,
  };

  const weightGoal = goals.find(goal => goal.type === "weight");
  const weightProgress = weightGoal
    ? Math.max(0, Math.min(
        weightGoal.startValue > weightGoal.target
          ? ((weightGoal.startValue - weightGoal.current) / Math.max(weightGoal.startValue - weightGoal.target, 1)) * 100
          : (weightGoal.current / Math.max(weightGoal.target, 1)) * 100,
        100,
      ))
    : 0;
  const bmi = profile && profile.height > 0 ? profile.weight / ((profile.height / 100) ** 2) : null;
  const bodyMetrics = profile ? [
    { metric: "Weight", current: `${profile.weight}kg`, target: `${profile.targetWeight}kg`, progress: weightProgress, trend: `${profile.weight > 0 ? (profile.weight - profile.targetWeight > 0 ? '+' : '') + (profile.weight - profile.targetWeight).toFixed(1) : 0}kg` },
    { metric: "BMI", current: bmi ? bmi.toFixed(1) : "—", target: "18.5–24.9", progress: bmi ? Math.max(0, Math.min(100, 100 - Math.abs(bmi - 22) * 12)) : 0, trend: bmi ? (bmi < 18.5 ? "Below range" : bmi > 24.9 ? "Above range" : "Healthy range") : "Set profile" },
  ] : [
    { metric: "Weight", current: "—", target: "—", progress: 0, trend: "Set profile" },
    { metric: "BMI", current: "—", target: "—", progress: 0, trend: "Set profile" },
  ];

  const today = new Date().toISOString().split("T")[0];
  const todayMeals = allMeals.filter(meal => meal.date === today);
  const nutritionBreakdown = {
    protein: { current: todayMeals.reduce((s, m) => s + m.protein, 0), target: 150, percentage: 0 },
    carbs: { current: todayMeals.reduce((s, m) => s + m.carbs, 0), target: 250, percentage: 0 },
    fats: { current: todayMeals.reduce((s, m) => s + m.fats, 0), target: 65, percentage: 0 },
    calories: { current: todayMeals.reduce((s, m) => s + m.calories, 0), target: 2600, percentage: 0 },
  };
  Object.keys(nutritionBreakdown).forEach(key => {
    const k = key as keyof typeof nutritionBreakdown;
    nutritionBreakdown[k].percentage = Math.min(Math.round((nutritionBreakdown[k].current / nutritionBreakdown[k].target) * 100), 100);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="Progress Analytics"
        subtitle="Track your fitness journey with real data."
        image={heroImage}
        scriptText="Small Steps, Big Results"
        quote="A healthier you. A brighter tomorrow."
        actions={
          <Badge className="gradient-premium text-white border-0 h-fit shadow-glow">
            <BarChart3 className="mr-1 h-3 w-3" />
            Live Data
          </Badge>
        }
      />

      <AICoachPanel />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Workouts", value: monthlyStats.totalWorkouts, note: `${totalStats.totalWorkouts} total`, icon: Dumbbell, tone: "text-emerald-600 bg-emerald-50", wash: "from-emerald-50/80" },
          { label: "Calories Burned", value: monthlyStats.totalCalories.toLocaleString(), note: `${totalStats.currentStreak}d streak`, icon: Flame, tone: "text-orange-500 bg-orange-50", wash: "from-rose-50/80" },
          { label: "Meals Logged", value: totalStats.totalMealsLogged, note: "healthy choices", icon: Utensils, tone: "text-teal-600 bg-teal-50", wash: "from-sky-50/80" },
          { label: "Active Minutes", value: monthlyStats.activeMinutes, note: `${monthlyStats.goalProgress}% goals`, icon: Clock, tone: "text-amber-500 bg-amber-50", wash: "from-amber-50/80" },
        ].map(stat => (
          <Card key={stat.label} className={`overflow-hidden border-border/60 bg-gradient-to-br ${stat.wash} to-white shadow-sm`}>
            <CardContent className="flex min-h-[118px] items-center justify-between p-4 sm:p-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
                  <span className="text-xs font-semibold text-muted-foreground sm:text-sm">{stat.label}</span>
                </div>
                <p className="text-2xl font-black tracking-tight sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">↑ {stat.note}</p>
              </div>
              <div className="flex h-14 items-end gap-1 opacity-50">
                {[35, 55, 42, 72].map((h, i) => <i key={i} className="w-2 rounded-t bg-current text-primary" style={{ height: `${h}%` }} />)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3 rounded-xl bg-muted/70 p-1">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="body">Body Metrics</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Workouts Completed</CardTitle>
                <CardDescription>Daily workout frequency this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={210}>
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

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-secondary" />Calories Burned</CardTitle>
                <CardDescription>Weekly calorie burn trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={210}>
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

          <div className="grid gap-4 lg:grid-cols-[1.35fr_.75fr_.75fr]">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-info" />Water Intake</CardTitle>
                <CardDescription>Daily hydration tracking (Liters)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 3.5]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                    <Bar dataKey="water" fill="rgb(96, 165, 250)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-700">Weekly Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="rounded-lg bg-amber-50 p-2"><Trophy className="mr-2 inline h-4 w-4 text-amber-500" />Most active workout days</p>
                <p className="rounded-lg bg-sky-50 p-2"><Droplets className="mr-2 inline h-4 w-4 text-sky-500" />Hydration progress tracked</p>
                <p className="rounded-lg bg-rose-50 p-2"><Flame className="mr-2 inline h-4 w-4 text-orange-500" />{totalStats.currentStreak}-day streak</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-emerald-100 bg-gradient-to-b from-emerald-50 to-white shadow-sm">
              <CardContent className="flex h-full min-h-[250px] flex-col items-center justify-center p-6 text-center">
                <Leaf className="mb-3 h-12 w-12 text-emerald-500" />
                <h3 className="text-lg font-black text-emerald-900">You&apos;re Doing Great!</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Consistent effort today builds a healthier, happier you tomorrow.</p>
                <Badge className="mt-5 bg-emerald-600">Keep Going →</Badge>
              </CardContent>
            </Card>
          </div>
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
