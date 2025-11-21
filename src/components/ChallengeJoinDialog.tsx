import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Users, Flame, Target, TrendingUp, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: number;
  name: string;
  participants: number;
  daysLeft: number;
  progress: number;
  reward: string;
}

interface ChallengeJoinDialogProps {
  challenge: Challenge | null;
  open: boolean;
  onClose: () => void;
}

export const ChallengeJoinDialog = ({ challenge, open, onClose }: ChallengeJoinDialogProps) => {
  const { toast } = useToast();
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  
  const participants = [
    { name: "Chioma A.", progress: 85, rank: 1 },
    { name: "Tunde O.", progress: 78, rank: 2 },
    { name: "Ngozi E.", progress: 72, rank: 3 },
    { name: "You", progress: challenge?.progress || 0, rank: 4 },
    { name: "Emeka N.", progress: 65, rank: 5 },
  ];

  const messages = [
    { user: "Chioma A.", text: "Great progress everyone! Keep it up! 💪", time: "2h ago" },
    { user: "Tunde O.", text: "Just completed day 18. Feeling strong!", time: "5h ago" },
    { user: "Ngozi E.", text: "Who wants to be my accountability partner?", time: "1d ago" },
  ];

  const handleJoin = () => {
    const challenges = JSON.parse(localStorage.getItem('joined_challenges') || '[]');
    challenges.push({
      id: challenge?.id,
      name: challenge?.name,
      joinedDate: new Date().toISOString(),
      progress: 0,
      status: 'active'
    });
    localStorage.setItem('joined_challenges', JSON.stringify(challenges));

    setJoined(true);
    toast({
      title: "Welcome to the Challenge! 🎉",
      description: `You've joined ${challenge?.name}. Good luck!`,
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Your message has been posted to the challenge feed",
    });
    setMessage("");
  };

  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            {challenge.name}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {challenge.participants.toLocaleString()} participants
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {challenge.daysLeft} days left
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!joined ? (
            <>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Challenge Reward
                </h4>
                <p className="text-sm">{challenge.reward}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Challenge Details</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Complete daily fitness activities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Track your progress and share with the community
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Connect with other participants for motivation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Earn badges and points for consistency
                  </li>
                </ul>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Performers
                  </h4>
                  <div className="space-y-2">
                    {participants.slice(0, 3).map((p) => (
                      <div key={p.rank} className="flex items-center gap-3">
                        <Badge variant="outline">#{p.rank}</Badge>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <Progress value={p.progress} className="h-1" />
                        </div>
                        <span className="text-sm font-semibold">{p.progress}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4 mt-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-2xl font-bold">{challenge.progress}%</span>
                  </div>
                  <Progress value={challenge.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Keep going! You're doing great
                  </p>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Daily Tasks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Complete 30 min workout</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Log your meals</span>
                        <Badge>Done</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Drink 3L water</span>
                        <Badge>Done</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-4">
                <div className="space-y-2">
                  {participants.map((p) => (
                    <Card key={p.rank}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={p.rank <= 3 ? "default" : "outline"}>
                            #{p.rank}
                          </Badge>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{p.name}</p>
                            <Progress value={p.progress} className="h-1 mt-1" />
                          </div>
                          <span className="font-bold">{p.progress}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {messages.map((msg, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{msg.user}</span>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Send a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          {!joined ? (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleJoin}>
                <Users className="mr-2 h-4 w-4" />
                Join Challenge
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
