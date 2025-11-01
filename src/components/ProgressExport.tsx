import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProgressExportProps {
  stats: {
    totalWorkouts: number;
    caloriesBurned: number;
    currentStreak: number;
    goalsAchieved: number;
  };
}

export const ProgressExport = ({ stats }: ProgressExportProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    return `💪 My FitNaija Progress:\n\n✅ ${stats.totalWorkouts} Workouts Completed\n🔥 ${stats.caloriesBurned.toLocaleString()} Calories Burned\n⚡ ${stats.currentStreak} Day Streak\n🎯 ${stats.goalsAchieved} Goals Achieved\n\nJoin me on FitNaija! 🇳🇬`;
  };

  const shareProgress = async () => {
    const text = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My FitNaija Progress',
          text: text,
        });
        toast({
          title: "Shared Successfully! 🎉",
          description: "Your progress has been shared",
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied to Clipboard! 📋",
      description: "Paste it anywhere to share your progress",
    });
  };

  const downloadProgress = () => {
    const data = {
      timestamp: new Date().toISOString(),
      ...stats,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitnaija-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded! 📥",
      description: "Your progress has been saved",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Preview */}
        <div className="p-4 bg-gradient-card rounded-lg border text-center">
          <p className="text-lg font-bold mb-2">My FitNaija Journey 🇳🇬</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{stats.caloriesBurned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{stats.goalsAchieved}</p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={shareProgress} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button variant="outline" onClick={copyToClipboard} className="w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        <Button variant="secondary" onClick={downloadProgress} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Data
        </Button>
      </CardContent>
    </Card>
  );
};
