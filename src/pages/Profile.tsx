import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Edit, Target, TrendingUp, Award, Calendar, Flame, Activity } from "lucide-react";

const Profile = () => {
  const userStats = [
    { icon: Flame, label: "Total Calories Burned", value: "28,450", change: "+12%", color: "text-primary" },
    { icon: Activity, label: "Total Workouts", value: "124", change: "+8%", color: "text-secondary" },
    { icon: Target, label: "Goals Achieved", value: "18", change: "+3", color: "text-blue-500" },
    { icon: Calendar, label: "Current Streak", value: "30 days", change: "Best!", color: "text-yellow-500" },
  ];

  const achievements = [
    { name: "First Workout", description: "Completed your first workout", earned: true, date: "Jan 15, 2025" },
    { name: "Week Warrior", description: "7 consecutive days of workouts", earned: true, date: "Jan 22, 2025" },
    { name: "Calorie Crusher", description: "Burned 10,000 calories", earned: true, date: "Feb 5, 2025" },
    { name: "Month Master", description: "30 day workout streak", earned: true, date: "Feb 14, 2025" },
    { name: "Nutrition Pro", description: "Hit nutrition goals for 14 days", earned: false, date: null },
    { name: "Community Star", description: "Top 10 in leaderboard", earned: false, date: null },
  ];

  const weeklyProgress = [
    { day: "Mon", completed: true, calories: 420 },
    { day: "Tue", completed: true, calories: 380 },
    { day: "Wed", completed: true, calories: 450 },
    { day: "Thu", completed: true, calories: 390 },
    { day: "Fri", completed: true, calories: 410 },
    { day: "Sat", completed: false, calories: 0 },
    { day: "Sun", completed: false, calories: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-primary text-white text-3xl font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">John Doe</h1>
                <Badge className="bg-secondary text-secondary-foreground w-fit mx-auto md:mx-0">
                  Intermediate Level
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">Member since January 2025</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline">Goal: Build Muscle</Badge>
                <Badge variant="outline">Age: 28</Badge>
                <Badge variant="outline">Lagos, Nigeria</Badge>
              </div>
            </div>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
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
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4 mt-6">
          {/* Current Goals */}
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
                  <span className="font-medium">5 / 6 workouts</span>
                </div>
                <Progress value={83} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weight Goal Progress</span>
                  <span className="font-medium">72kg / 75kg</span>
                </div>
                <Progress value={96} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Calorie Goal</span>
                  <span className="font-medium">28,450 / 30,000 cal</span>
                </div>
                <Progress value={95} />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
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
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`h-20 rounded-lg flex items-center justify-center mb-2 transition-smooth ${
                        day.completed
                          ? "bg-secondary text-secondary-foreground shadow-card"
                          : "bg-muted"
                      }`}
                    >
                      {day.completed ? (
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
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-smooth ${
                      achievement.earned
                        ? "bg-gradient-card shadow-card hover-scale"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          achievement.earned ? "bg-yellow-500" : "bg-muted"
                        }`}
                      >
                        <Award
                          className={`h-5 w-5 ${
                            achievement.earned ? "text-white" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <Badge variant="outline" className="text-xs">
                            Earned {achievement.date}
                          </Badge>
                        )}
                        {!achievement.earned && (
                          <Badge variant="outline" className="text-xs">
                            Locked
                          </Badge>
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
