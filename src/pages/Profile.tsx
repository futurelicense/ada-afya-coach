import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalSetting } from "@/components/GoalSetting";
import { ProgressExport } from "@/components/ProgressExport";
import { ProgressPhotos } from "@/components/ProgressPhotos";
import { ProgressPhotoComparison } from "@/components/ProgressPhotoComparison";
import { User, Edit, Target, TrendingUp, Award, Calendar, Flame, Activity, Save, X, Bell, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { userDataService, UserProfile, Goal } from "@/lib/userDataService";
import { gamificationService } from "@/lib/gamificationService";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import heroImage from "@/assets/reference/profile-hero.png";

const Profile = () => {
  const { toast } = useToast();
  const { permission, subscribed, subscribe, unsubscribe } = usePushNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [totalStats, setTotalStats] = useState({ totalWorkouts: 0, totalCaloriesBurned: 0, totalMealsLogged: 0, goalsAchieved: 0, currentStreak: 0 });
  const [achievements, setAchievements] = useState<{ id: string; name: string; description: string; earned: boolean; date: string | null }[]>([]);
  const [weeklyData, setWeeklyData] = useState<Awaited<ReturnType<typeof userDataService.getWeeklyChartData>>>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    userDataService.getProfile().then(p => { setProfile(p); setEditForm(p); });
    userDataService.getTotalStats().then(setTotalStats);
    userDataService.getWeeklyChartData().then(setWeeklyData);
    userDataService.getGoals().then(setGoals);
    gamificationService.getData().then(data => {
      setAchievements(data.badges.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        earned: b.earned,
        date: b.earnedDate ? b.earnedDate.toLocaleDateString() : null,
      })));
    });
  }, []);

  const startEditing = () => {
    setEditForm(profile ? { ...profile } : {
      name: '', email: '', age: 25, fitnessLevel: 'intermediate', goals: [],
      weight: 70, targetWeight: 75, height: 170, location: '', joinDate: new Date().toISOString().split('T')[0],
      role: 'user', onboardingDone: false,
    });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    await userDataService.saveProfile(editForm);
    setProfile(editForm);
    setIsEditing(false);
    toast({ title: "Profile Updated!", description: "Your profile has been saved." });
  };

  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'WF';

  const userStats = [
    { icon: Flame, label: "Total Calories Burned", value: totalStats.totalCaloriesBurned.toLocaleString(), change: `${totalStats.totalWorkouts} workouts`, color: "text-primary" },
    { icon: Activity, label: "Total Workouts", value: totalStats.totalWorkouts.toString(), change: "completed", color: "text-secondary" },
    { icon: Target, label: "Goals Achieved", value: totalStats.goalsAchieved.toString(), change: "goals", color: "text-info" },
    { icon: Calendar, label: "Current Streak", value: `${totalStats.currentStreak} days`, change: totalStats.currentStreak >= 7 ? "🔥" : "Keep going!", color: "text-success" },
  ];

  const weekWorkoutGoal = goals.find(g => g.type === 'workouts') || { current: weeklyData.filter(d => d.workouts > 0).length, target: 6 };
  const weightGoal = profile ? { current: profile.weight, target: profile.targetWeight } : { current: 0, target: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card
        className="relative min-h-[190px] overflow-hidden rounded-2xl border-primary/10 shadow-sm"
        style={{ background: "linear-gradient(110deg, hsl(150 55% 96%) 0%, hsl(145 52% 92%) 58%, hsl(158 48% 88%) 100%)" }}
      >
        {!isEditing && (
          <div className="absolute bottom-0 right-[12%] top-0 hidden w-[34%] lg:block">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eaf9f1] via-transparent to-transparent" />
          </div>
        )}
        {!isEditing && <span className="absolute right-6 top-8 hidden max-w-[9rem] text-center font-script text-2xl leading-tight text-primary lg:block">Better People, Healthier Tomorrows</span>}
        <CardContent className="p-6 lg:p-8 relative z-10">
          {isEditing && editForm ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div>
                  <Label>Current Weight (kg)</Label>
                  <Input type="number" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Target Weight (kg)</Label>
                  <Input type="number" value={editForm.targetWeight} onChange={e => setEditForm({ ...editForm, targetWeight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input type="number" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveProfile}><Save className="mr-2 h-4 w-4" />Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:pr-[48%]">
              <Avatar className="h-28 w-28 border-4 border-white shadow-card">
                <AvatarFallback className="bg-gradient-primary text-white text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile?.name || 'Set up your profile'}</h1>
                  <Badge className="bg-secondary text-secondary-foreground w-fit mx-auto md:mx-0">
                    {profile?.fitnessLevel ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) : 'Intermediate'} Level
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  {profile?.joinDate ? `Member since ${new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Welcome to WeFit!'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile?.weight && <Badge variant="outline">Weight: {profile.weight}kg</Badge>}
                  {profile?.age && <Badge variant="outline">Age: {profile.age}</Badge>}
                  {profile?.location && <Badge variant="outline">{profile.location}</Badge>}
                </div>
              </div>
              <Button onClick={startEditing} className="shrink-0 bg-emerald-600 hover:bg-emerald-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {userStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-border/60 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm">
            <CardContent className="flex min-h-[112px] items-center justify-between p-4 sm:p-5">
              <div>
                <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-2xl font-black sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-semibold text-emerald-600">↑ {stat.change}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm"><stat.icon className={`h-6 w-6 ${stat.color}`} /></span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-muted/70 p-1">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4 mt-6">
          <div className="grid items-start gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Current Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-emerald-50/60 p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Workout Goal</span>
                  <span className="font-medium">{weekWorkoutGoal.current} / {weekWorkoutGoal.target} workouts</span>
                </div>
                <Progress className="h-2.5" value={Math.min((weekWorkoutGoal.current / weekWorkoutGoal.target) * 100, 100)} />
              </div>
              {profile && (
                <div className="rounded-xl bg-sky-50/60 p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weight Goal Progress</span>
                    <span className="font-medium">{weightGoal.current}kg / {weightGoal.target}kg</span>
                  </div>
                  <Progress className="h-2.5" value={weightGoal.target > 0 ? Math.min((weightGoal.current / weightGoal.target) * 100, 100) : 0} />
                </div>
              )}
              <div className="rounded-xl bg-amber-50/60 p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Calories Burned</span>
                  <span className="font-medium">{totalStats.totalCaloriesBurned.toLocaleString()} cal</span>
                </div>
                <Progress className="h-2.5" value={Math.min(totalStats.totalCaloriesBurned / 300, 100)} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                This Week's Activity
              </CardTitle>
              <CardDescription>Your workout consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`h-20 rounded-lg flex items-center justify-center mb-2 transition-smooth ${
                        day.workouts > 0
                          ? "bg-secondary text-secondary-foreground shadow-card"
                          : "bg-muted"
                      }`}
                    >
                      {day.workouts > 0 ? (
                        <div>
                          <Flame className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-[10px]">{day.workouts} workout{day.workouts === 1 ? "" : "s"}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">-</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{day.day}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" />Achievements &amp; Milestones</span><Badge variant="outline">{achievements.filter(a => a.earned).length} earned</Badge></CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {achievements.slice(0, 4).map(a => (
                <div key={a.id} className={`rounded-xl p-3 text-center ${a.earned ? "bg-amber-50" : "bg-muted/50 opacity-60"}`}>
                  <Award className={`mx-auto mb-1 h-6 w-6 ${a.earned ? "text-amber-500" : "text-muted-foreground"}`} />
                  <p className="line-clamp-2 text-[11px] font-bold">{a.name}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          </div>
          </div>

          <Card className="overflow-hidden border-violet-100 bg-gradient-to-r from-violet-50 via-white to-emerald-50 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-xl">✨</span>
              <div>
                <h3 className="font-black">Personal Insights</h3>
                <p className="mt-1 text-sm text-muted-foreground">Great progress this week, {profile?.name?.split(" ")[0] || "champ"}! You completed {totalStats.totalWorkouts} total workouts and built a {totalStats.currentStreak}-day streak. Keep moving toward your goals.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-6">
          <GoalSetting />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressPhotos />
            <ProgressPhotoComparison />
          </div>

          <ProgressExport
            stats={{
              totalWorkouts: totalStats.totalWorkouts,
              caloriesBurned: totalStats.totalCaloriesBurned,
              currentStreak: totalStats.currentStreak,
              goalsAchieved: totalStats.goalsAchieved,
            }}
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Your Achievements
              </CardTitle>
              <CardDescription>Milestones you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-smooth ${
                      achievement.earned
                        ? "bg-gradient-card shadow-card hover-scale"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${achievement.earned ? "bg-secondary" : "bg-muted"}`}>
                        <Award className={`h-5 w-5 ${achievement.earned ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        {achievement.earned && achievement.date && (
                          <Badge variant="outline" className="text-xs">Earned {achievement.date}</Badge>
                        )}
                        {!achievement.earned && (
                          <Badge variant="outline" className="text-xs">Locked</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Push notifications */}
      {"Notification" in window && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Push Notifications
            </CardTitle>
            <CardDescription>Get reminders for workouts, streaks, and live sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {subscribed ? "Notifications enabled" : "Stay on track with smart reminders"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {permission === "denied"
                    ? "Blocked — enable in your browser settings"
                    : subscribed
                    ? "You'll be notified for streak reminders & live sessions"
                    : "Streak reminders, trainer going live, challenge alerts"}
                </p>
              </div>
              {subscribed ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={async () => { await unsubscribe(); toast({ title: "Notifications disabled" }); }}
                  aria-label="Disable push notifications"
                >
                  <BellOff className="h-4 w-4" /> Disable
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-2 shrink-0"
                  disabled={permission === "denied"}
                  onClick={async () => {
                    const ok = await subscribe();
                    toast(ok
                      ? { title: "Notifications enabled!", description: "You'll get reminders to keep your streak." }
                      : { title: "Could not enable", description: "Check your browser notification settings.", variant: "destructive" }
                    );
                  }}
                  aria-label="Enable push notifications"
                >
                  <Bell className="h-4 w-4" /> Enable
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
