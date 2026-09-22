import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, Flame, Trophy, Target, Calendar, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  user: string;
  action: string;
  time: string;
  type: string;
}

interface ActivityViewDialogProps {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}

export const ActivityViewDialog = ({ activity, open, onClose }: ActivityViewDialogProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 10);

  const getIcon = (type: string) => {
    switch(type) {
      case "achievement": return Award;
      case "workout": return Flame;
      case "rank": return Trophy;
      case "challenge": return Target;
      case "streak": return Calendar;
      default: return Award;
    }
  };

  const getDetailedInfo = (type: string) => {
    switch(type) {
      case "achievement":
        return {
          title: "30-Day Challenge Completed",
          description: "Successfully completed all daily workouts for 30 consecutive days",
          stats: [
            { label: "Total Workouts", value: "30" },
            { label: "Calories Burned", value: "12,500" },
            { label: "Time Invested", value: "15 hours" }
          ],
          badge: "Gold Champion"
        };
      case "workout":
        return {
          title: "Intense HIIT Session",
          description: "Completed a 45-minute high-intensity interval training workout",
          stats: [
            { label: "Calories Burned", value: "450" },
            { label: "Duration", value: "45 min" },
            { label: "Exercises", value: "12" }
          ],
          badge: "Workout Warrior"
        };
      case "rank":
        return {
          title: "Leaderboard Achievement",
          description: "Reached #1 position on the monthly leaderboard",
          stats: [
            { label: "Rank", value: "#1" },
            { label: "Total Points", value: "2,850" },
            { label: "Members Surpassed", value: "1,249" }
          ],
          badge: "Top Performer"
        };
      case "challenge":
        return {
          title: "Morning Warriors Challenge",
          description: "Joined the Morning Warriors challenge for early morning workouts",
          stats: [
            { label: "Start Date", value: new Date().toLocaleDateString() },
            { label: "Duration", value: "7 days" },
            { label: "Participants", value: "920" }
          ],
          badge: "Challenge Accepted"
        };
      case "streak":
        return {
          title: "25-Day Streak",
          description: "Maintained consistent daily workouts for 25 consecutive days",
          stats: [
            { label: "Current Streak", value: "25 days" },
            { label: "Longest Streak", value: "30 days" },
            { label: "Total Days Active", value: "87" }
          ],
          badge: "Consistency King"
        };
      default:
        return {
          title: "Fitness Milestone",
          description: "Achieved a new fitness milestone",
          stats: [],
          badge: "Achiever"
        };
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    toast({
      title: liked ? "Like removed" : "Liked! 👍",
      description: liked ? undefined : "Showed support for this achievement",
    });
  };

  const handleComment = () => {
    toast({
      title: "Coming Soon",
      description: "Comment feature will be available soon",
    });
  };

  const handleShare = () => {
    toast({
      title: "Link Copied! 📋",
      description: "Activity link copied to clipboard",
    });
  };

  if (!activity) return null;

  const Icon = getIcon(activity.type);
  const details = getDetailedInfo(activity.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {activity.user.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{activity.user}</DialogTitle>
              <DialogDescription className="text-xs">{activity.time}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{details.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{details.description}</p>
              <Badge className="bg-primary">{details.badge}</Badge>
            </CardContent>
          </Card>

          {details.stats.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Activity Stats</h4>
                <div className="space-y-3">
                  {details.stats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-around gap-2 sm:gap-0 py-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 sm:flex-none ${liked ? "text-primary" : ""}`}
              onClick={handleLike}
            >
              <ThumbsUp className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs sm:text-sm">{likes} Likes</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={handleComment}>
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Comment</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Share</span>
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground text-center">
                💪 Motivate {activity.user.split(' ')[0]} by liking and commenting!
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
