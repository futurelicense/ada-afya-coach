import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, Target, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const DataUpdatePrompt = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  useEffect(() => {
    // Check last update time
    const lastUpdate = localStorage.getItem('last_stats_update');
    const now = new Date().getTime();
    
    // Prompt every 7 days (604800000 ms) or if never updated
    if (!lastUpdate || now - parseInt(lastUpdate) > 604800000) {
      // Show after 5 seconds on mount
      const timer = setTimeout(() => setOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUpdate = () => {
    if (!weight || !height) {
      toast({
        title: "Missing Information",
        description: "Please enter your weight and height",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    const stats = {
      weight: parseFloat(weight),
      height: parseFloat(height),
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      lastUpdated: new Date().toISOString(),
      bmi: (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    };

    localStorage.setItem('user_stats', JSON.stringify(stats));
    localStorage.setItem('last_stats_update', new Date().getTime().toString());

    // Add to history
    const history = JSON.parse(localStorage.getItem('stats_history') || '[]');
    history.push({
      ...stats,
      date: new Date().toISOString()
    });
    localStorage.setItem('stats_history', JSON.stringify(history));

    toast({
      title: "Stats Updated! 📊",
      description: "Your progress data has been updated successfully",
    });

    setOpen(false);
    setWeight("");
    setHeight("");
    setTargetWeight("");
  };

  const handleSkip = () => {
    localStorage.setItem('last_stats_update', new Date().getTime().toString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Update Your Stats</DialogTitle>
          <DialogDescription className="text-center">
            Keep your progress tracking accurate by updating your current measurements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Current Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="targetWeight" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Weight (kg) - Optional
            </Label>
            <Input
              id="targetWeight"
              type="number"
              step="0.1"
              placeholder="65.0"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Regular updates help you track your progress more accurately and receive better AI recommendations
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button onClick={handleUpdate} className="flex-1">
            Update Stats
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
