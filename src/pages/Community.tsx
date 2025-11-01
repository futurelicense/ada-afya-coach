import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, Flame, Award, Star } from "lucide-react";

const Community = () => {
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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Trophy, color: "bg-yellow-500", text: "text-yellow-500" };
    if (rank === 2) return { icon: Trophy, color: "bg-gray-400", text: "text-gray-400" };
    if (rank === 3) return { icon: Trophy, color: "bg-orange-600", text: "text-orange-600" };
    return { icon: Star, color: "bg-muted", text: "text-muted-foreground" };
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

      {/* Leaderboard */}
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
    </div>
  );
};

export default Community;
