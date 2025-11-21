import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Users, Flame, Award, Star, Target, Zap, Calendar, Volume2, Camera, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChallengeJoinDialog } from "@/components/ChallengeJoinDialog";
import { ActivityViewDialog } from "@/components/ActivityViewDialog";
import { useState } from "react";

const Community = () => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState<typeof challenges[0] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<typeof activityFeed[0] | null>(null);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  
  const topUsers = [
    { name: "Chioma A.", calories: 28500, workouts: 24, streak: 30, rank: 1 },
    { name: "Tunde O.", calories: 26800, workouts: 22, streak: 28, rank: 2 },
    { name: "Ngozi E.", calories: 25200, workouts: 21, streak: 25, rank: 3 },
    { name: "Emeka N.", calories: 24100, workouts: 20, streak: 22, rank: 4 },
    { name: "Blessing M.", calories: 23800, workouts: 19, streak: 20, rank: 5 },
    { name: "Ahmed Y.", calories: 22900, workouts: 18, streak: 18, rank: 6 },
    { name: "Funke A.", calories: 21500, workouts: 17, streak: 15, rank: 7 },
    { name: "David I.", calories: 20800, workouts: 16, streak: 14, rank: 8 },
  ];

  const communityStats = [
    { icon: Users, label: "Active Members", value: "12,450", color: "text-primary" },
    { icon: Flame, label: "Total Calories Burned", value: "2.3M", color: "text-secondary" },
    { icon: TrendingUp, label: "Workouts This Month", value: "48,920", color: "text-blue-500" },
    { icon: Award, label: "Goals Achieved", value: "9,834", color: "text-yellow-500" },
  ];

  const challenges = [
    { 
      id: 1, 
      name: "30-Day Fitness Challenge", 
      participants: 3240, 
      daysLeft: 12, 
      progress: 60,
      reward: "Gold Badge + 1000pts",
      icon: Target 
    },
    { 
      id: 2, 
      name: "Burn 5000 Calories Week", 
      participants: 1850, 
      daysLeft: 3, 
      progress: 75,
      reward: "Silver Badge + 500pts",
      icon: Flame 
    },
    { 
      id: 3, 
      name: "Morning Warriors", 
      participants: 920, 
      daysLeft: 5, 
      progress: 40,
      reward: "Bronze Badge + 250pts",
      icon: Zap 
    },
  ];

  const activityFeed = [
    { user: "Chioma A.", action: "completed 30-Day Challenge", time: "2h ago", type: "achievement" },
    { user: "Tunde O.", action: "burned 450 calories", time: "4h ago", type: "workout" },
    { user: "Ngozi E.", action: "reached #1 on leaderboard", time: "6h ago", type: "rank" },
    { user: "Emeka N.", action: "started Morning Warriors challenge", time: "8h ago", type: "challenge" },
    { user: "Blessing M.", action: "achieved 25-day streak", time: "12h ago", type: "streak" },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Trophy, color: "bg-yellow-500", text: "text-yellow-500" };
    if (rank === 2) return { icon: Trophy, color: "bg-gray-400", text: "text-gray-400" };
    if (rank === 3) return { icon: Trophy, color: "bg-orange-600", text: "text-orange-600" };
    return { icon: Star, color: "bg-muted", text: "text-muted-foreground" };
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "achievement": return Award;
      case "workout": return Flame;
      case "rank": return Trophy;
      case "challenge": return Target;
      case "streak": return Calendar;
      default: return Star;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Community</h1>
        <p className="text-muted-foreground mt-2">Connect, compete, and grow together</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {communityStats.map((stat) => (
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

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Monthly Leaderboard
              </CardTitle>
              <CardDescription>Top performers in your city this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((user) => {
                  const badge = getRankBadge(user.rank);
                  return (
                    <div
                      key={user.rank}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-smooth hover:shadow-md ${
                        user.rank <= 3 ? "bg-gradient-card shadow-card" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                              {user.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -top-1 -right-1 ${badge.color} rounded-full p-1`}>
                            <badge.icon className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{user.name}</p>
                            {user.rank <= 3 && (
                              <Badge className={badge.text} variant="outline">
                                #{user.rank}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.workouts} workouts • {user.streak} day streak
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{user.calories.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">calories burned</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover-scale shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <challenge.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{challenge.daysLeft}d left</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{challenge.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{challenge.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants.toLocaleString()}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {challenge.reward}
                    </Badge>
                  </div>
                  <Button className="w-full" onClick={() => {
                    setSelectedChallenge(challenge);
                    setChallengeDialogOpen(true);
                  }}>Join Challenge</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Community Activity
              </CardTitle>
              <CardDescription>Recent achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity, idx) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-bold">{activity.user}</span>
                          {" "}{activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedActivity(activity);
                        setActivityDialogOpen(true);
                      }}>View</Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Featured Features Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Explore FitNaija Features</CardTitle>
          <CardDescription>Discover powerful tools to enhance your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="hover-scale cursor-pointer shadow-card bg-gradient-card"
              onClick={() => navigate('/workouts')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Volume2 className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Voice-Guided Workouts 🎙️</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time voice coaching with form cues and timer
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-scale cursor-pointer shadow-card bg-gradient-card"
              onClick={() => navigate('/profile')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Camera className="h-6 w-6 text-secondary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Progress Photo Comparison 📸</h3>
                <p className="text-sm text-muted-foreground">
                  Track visual changes with before/after photo comparison
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-scale cursor-pointer shadow-card bg-gradient-card"
              onClick={() => navigate('/profile')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Local Integration 🇳🇬</h3>
                <p className="text-sm text-muted-foreground">
                  Find gyms, trainers, and nutrition services near you
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Banner */}
      <Card className="shadow-card gradient-hero text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">You're Part of Something Amazing!</h3>
          <p className="text-white/90 mb-4">
            Together, our community has burned over 2.3 million calories this month. Keep pushing and inspire others!
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <p className="text-3xl font-bold">15,240</p>
              <p className="text-sm text-white/80">Members in Nigeria</p>
            </div>
            <div>
              <p className="text-3xl font-bold">92%</p>
              <p className="text-sm text-white/80">Success Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-sm text-white/80">Community Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ChallengeJoinDialog
        challenge={selectedChallenge}
        open={challengeDialogOpen}
        onClose={() => setChallengeDialogOpen(false)}
      />
      
      <ActivityViewDialog
        activity={selectedActivity}
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
      />
    </div>
  );
};

export default Community;
