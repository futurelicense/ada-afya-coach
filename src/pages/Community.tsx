import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Users, Flame, Award, Star, Target, Zap, Calendar, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { useCommunity, ActivityItem, Challenge, LeaderboardEntry } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import heroImage from "@/assets/hero-fitness.jpg";

const ACTIVITY_ICONS: Record<string, typeof Flame> = {
  achievement: Award,
  workout:     Flame,
  rank:        Trophy,
  challenge:   Target,
  streak:      Calendar,
  meal:        Zap,
  joined:      Users,
};

function daysLeft(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000));
}

function progressPct(current = 0, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

// ── Leaderboard row ─────────────────────────────────
function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  const medal  = entry.rank === 1 ? "bg-yellow-500" : entry.rank === 2 ? "bg-gray-400" : "bg-orange-600";

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${isTop3 ? "bg-gradient-card shadow-card" : "bg-card"}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {entry.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isTop3 && (
            <div className={`absolute -top-1 -right-1 ${medal} rounded-full p-1`}>
              <Trophy className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold">{entry.name}</p>
            {isTop3 && <Badge variant="outline" className="text-xs">#{entry.rank}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{entry.total_workouts} workouts • {entry.streak} day streak</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-primary">{(entry.points ?? 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
}

// ── Challenge card ──────────────────────────────────
function ChallengeCard({
  challenge,
  onJoin,
  joining,
}: {
  challenge: Challenge;
  onJoin: (id: string) => void;
  joining: boolean;
}) {
  const days = daysLeft(challenge.ends_at);
  const pct  = challenge.joined ? progressPct(challenge.current_value, challenge.target_value) : 0;
  const completed = Boolean(challenge.completed_at);

  return (
    <Card className="hover-scale shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{challenge.title}</CardTitle>
          {completed ? (
            <Badge className="bg-success/10 text-success border-success/20 text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          ) : challenge.joined ? (
            <Badge className="bg-success/10 text-success border-success/20 text-xs">Joined</Badge>
          ) : null}
        </div>
        <CardDescription className="text-xs">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{challenge.participant_count.toLocaleString()} participants</span>
          <span className={`font-medium ${days <= 3 ? "text-destructive" : "text-muted-foreground"}`}>{days}d left</span>
        </div>

        {challenge.joined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{challenge.current_value ?? 0}/{challenge.target_value} {challenge.target_unit}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Updates automatically from your logged activity.</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          🏆 {challenge.reward_description ?? `${challenge.reward_points} points`}
        </div>

        {!challenge.joined && (
          <Button size="sm" className="w-full" disabled={joining} onClick={() => onJoin(challenge.id)}>
            {joining ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Target className="mr-2 h-3.5 w-3.5" />}
            {joining ? "Joining…" : "Join Challenge"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Activity item ────────────────────────────────────
function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = ACTIVITY_ICONS[item.action_type] ?? Star;
  const colorMap: Record<string, string> = {
    achievement: "text-yellow-500 bg-yellow-500/10",
    workout:     "text-red-500 bg-red-500/10",
    rank:        "text-primary bg-primary/10",
    challenge:   "text-secondary bg-secondary/10",
    streak:      "text-orange-500 bg-orange-500/10",
    meal:        "text-green-500 bg-green-500/10",
    joined:      "text-blue-500 bg-blue-500/10",
  };
  const colors = colorMap[item.action_type] ?? "text-muted-foreground bg-muted";

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border hover:shadow-sm transition-all">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <span className="font-bold">{item.username}</span>
          {' '}{item.action_description}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ── Main Community page ──────────────────────────────
const Community = () => {
  const {
    leaderboard,
    challenges,
    activityFeed,
    loading,
    error,
    joiningChallengeId,
    joinChallenge,
    refresh,
  } = useCommunity();
  const { toast } = useToast();

  async function handleJoin(id: string) {
    const result = await joinChallenge(id);
    toast(result.ok
      ? { title: "Challenge joined! 💪", description: "Track your progress in the Challenges tab." }
      : { title: "Could not join", description: result.message ?? "Please try again.", variant: "destructive" }
    );
  }

  const communityStats = [
    { icon: Users,     label: "Active Members",         value: leaderboard.length ? `${leaderboard.length}+` : "—",   color: "text-primary" },
    { icon: Flame,     label: "Active Challenges",       value: challenges.length.toString(),                          color: "text-secondary" },
    { icon: TrendingUp,label: "Activities This Week",    value: activityFeed.length.toString(),                        color: "text-info" },
    { icon: Award,     label: "Top Streak (days)",       value: leaderboard[0] ? leaderboard[0].streak.toString() : "—", color: "text-success" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="Stronger Together"
        subtitle="Connect, compete, and grow with a supportive fitness community across Nigeria and beyond."
        pills={[
          { icon: Users, label: "Share progress" },
          { icon: Trophy, label: "Join challenges" },
          { icon: Zap, label: "Stay motivated" },
        ]}
        scriptText="Better People, Healthier Tomorrows"
        quote="Fitness is better together."
        image={heroImage}
      />

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-destructive">Community data could not be loaded</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {communityStats.map(stat => (
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

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                All-Time Leaderboard
              </CardTitle>
              <CardDescription>Top performers ranked by total points</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leaderboard.length === 0 ? (
                <EmptyState icon={Trophy} title="No rankings yet" description="Complete a workout to appear on the leaderboard." />
              ) : (
                <div className="space-y-3">
                  {leaderboard.map(entry => <LeaderboardRow key={entry.rank} entry={entry} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges */}
        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Active Challenges</h2>
              <p className="text-sm text-muted-foreground">Join once—progress and rewards update automatically from your activity</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : challenges.length === 0 ? (
              <Card className="shadow-card">
                <EmptyState icon={Target} title="No active challenges" description="New community challenges will appear here — check back soon." />
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map(c => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    onJoin={handleJoin}
                    joining={joiningChallengeId === c.id}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Activity Feed */}
        <TabsContent value="activity" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Community Activity
                <Badge className="bg-success/10 text-success border-success/20 text-xs ml-auto animate-pulse">Live</Badge>
              </CardTitle>
              <CardDescription>Real-time activity from WeFit members</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : activityFeed.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No activity yet" description="Complete a workout to show up in the community feed." />
              ) : (
                <div className="space-y-2">
                  {activityFeed.map(item => <ActivityRow key={item.id} item={item} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
