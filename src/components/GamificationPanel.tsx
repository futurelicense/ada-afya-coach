import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Star, TrendingUp, Award, Lock } from "lucide-react";
import { gamificationService, UserGamification } from "@/lib/gamificationService";
import { useUserData } from "@/hooks/useUserData";

export const GamificationPanel = () => {
  const [gamification, setGamification] = useState<UserGamification>(gamificationService.getData());
  const { todayStats, weeklyStats } = useUserData();

  useEffect(() => {
    // Update gamification data based on user activity
    const totalWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);
    
    // Check badges
    gamificationService.checkWorkoutBadges(totalWorkouts);
    gamificationService.checkCalorieBadge(todayStats?.caloriesBurned || 0);
    
    // Update streak if there's activity
    if (totalWorkouts > 0) {
      gamificationService.updateStreak();
    }
    
    setGamification(gamificationService.getData());
  }, [todayStats, weeklyStats]);

  const pointsToNextLevel = (gamification.level * 1000) - gamification.points;
  const levelProgress = ((gamification.points % 1000) / 1000) * 100;
  
  const earnedBadges = gamificationService.getEarnedBadges();
  const unearnedBadges = gamificationService.getUnearnedBadges();

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Your Progress & Achievements
        </CardTitle>
        <CardDescription>Level up by staying consistent with workouts and nutrition</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Level & Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">Level {gamification.level}</p>
              <p className="text-sm text-muted-foreground mt-1">{pointsToNextLevel} XP to next level</p>
              <Progress value={levelProgress} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-3xl font-bold text-secondary">{gamification.currentStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
              <p className="text-xs text-muted-foreground mt-2">Longest: {gamification.longestStreak} days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold">{gamification.points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total XP</p>
              <p className="text-xs text-muted-foreground mt-2">{earnedBadges.length} badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">
              Earned ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({unearnedBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-3 mt-4">
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No badges earned yet</p>
                <p className="text-sm text-muted-foreground">Complete workouts and meals to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <Card key={badge.id} className="hover-scale cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                      {badge.earnedDate && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {new Date(badge.earnedDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {unearnedBadges.map((badge) => (
                <Card key={badge.id} className="relative opacity-60 hover-scale cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {badge.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
