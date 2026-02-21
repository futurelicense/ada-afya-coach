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
import { LocalNigerianIntegration } from "@/components/LocalNigerianIntegration";
import { User, Edit, Target, TrendingUp, Award, Calendar, Flame, Activity, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { userDataService, UserProfile } from "@/lib/userDataService";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [totalStats, setTotalStats] = useState({ totalWorkouts: 0, totalCaloriesBurned: 0, totalMealsLogged: 0, goalsAchieved: 0, currentStreak: 0 });
  const [achievements, setAchievements] = useState(userDataService.getAchievements());
  const [weeklyData, setWeeklyData] = useState(userDataService.getWeeklyChartData());

  useEffect(() => {
    const p = userDataService.getProfile();
    setProfile(p);
    setEditForm(p);
    setTotalStats(userDataService.getTotalStats());
    setAchievements(userDataService.checkAndUpdateAchievements());
    setWeeklyData(userDataService.getWeeklyChartData());
  }, []);

  const startEditing = () => {
    setEditForm(profile ? { ...profile } : {
      name: '', email: '', age: 25, fitnessLevel: 'intermediate', goals: [],
      weight: 70, targetWeight: 75, height: 170, location: '', joinDate: new Date().toISOString().split('T')[0],
    });
    setIsEditing(true);
  };

  const saveProfile = () => {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    userDataService.saveProfile(editForm);
    setProfile(editForm);
    setIsEditing(false);
    toast({ title: "Profile Updated!", description: "Your profile has been saved." });
  };

  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'WF';

  const userStats = [
    { icon: Flame, label: "Total Calories Burned", value: totalStats.totalCaloriesBurned.toLocaleString(), change: `${totalStats.totalWorkouts} workouts`, color: "text-primary" },
    { icon: Activity, label: "Total Workouts", value: totalStats.totalWorkouts.toString(), change: "completed", color: "text-secondary" },
    { icon: Target, label: "Goals Achieved", value: totalStats.goalsAchieved.toString(), change: "goals", color: "text-blue-500" },
    { icon: Calendar, label: "Current Streak", value: `${totalStats.currentStreak} days`, change: totalStats.currentStreak >= 7 ? "🔥" : "Keep going!", color: "text-yellow-500" },
  ];

  const goals = userDataService.getGoals();
  const weekWorkoutGoal = goals.find(g => g.type === 'workouts') || { current: weeklyData.filter(d => d.workouts > 0).length, target: 6 };
  const weightGoal = profile ? { current: profile.weight, target: profile.targetWeight } : { current: 0, target: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
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
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
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
              <Button onClick={startEditing}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat) => (
          <Card key={stat.label} className="hover-scale shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Current Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Workout Goal</span>
                  <span className="font-medium">{weekWorkoutGoal.current} / {weekWorkoutGoal.target} workouts</span>
                </div>
                <Progress value={Math.min((weekWorkoutGoal.current / weekWorkoutGoal.target) * 100, 100)} />
              </div>
              {profile && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weight Goal Progress</span>
                    <span className="font-medium">{weightGoal.current}kg / {weightGoal.target}kg</span>
                  </div>
                  <Progress value={weightGoal.target > 0 ? Math.min((weightGoal.current / weightGoal.target) * 100, 100) : 0} />
                </div>
              )}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Calories Burned</span>
                  <span className="font-medium">{totalStats.totalCaloriesBurned.toLocaleString()} cal</span>
                </div>
                <Progress value={Math.min(totalStats.totalCaloriesBurned / 300, 100)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                This Week's Activity
              </CardTitle>
              <CardDescription>Your workout consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
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
                          <p className="text-xs">{day.calories}</p>
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
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-6">
          <GoalSetting />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressPhotos />
            <ProgressPhotoComparison />
          </div>

          <LocalNigerianIntegration />
          
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
                <Award className="h-5 w-5 text-yellow-500" />
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
                      <div className={`p-2 rounded-full ${achievement.earned ? "bg-yellow-500" : "bg-muted"}`}>
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
    </div>
  );
};

export default Profile;
