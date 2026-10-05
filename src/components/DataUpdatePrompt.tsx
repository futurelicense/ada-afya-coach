import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, Target, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { userDataService } from "@/lib/userDataService";
import { useUserData } from "@/hooks/useUserData";

export const DataUpdatePrompt = () => {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserData();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  useEffect(() => {
    if (!profile) return;
    if (profile.weight > 0 && profile.height > 0) return;
    if (sessionStorage.getItem("wefit_stats_prompt") === "1") return;
    setOpen(true);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setWeight(profile.weight ? String(profile.weight) : "");
      setHeight(profile.height ? String(profile.height) : "");
      setTargetWeight(profile.targetWeight ? String(profile.targetWeight) : "");
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (!weight || !height) {
      toast({
        title: "Missing information",
        description: "Enter weight and height",
        variant: "destructive",
      });
      return;
    }
    const current = profile ?? await userDataService.getProfile();
    if (!current) {
      toast({ variant: "destructive", title: "Sign in required" });
      return;
    }
    await updateProfile({
      weight: parseFloat(weight),
      height: parseFloat(height),
      targetWeight: targetWeight ? parseFloat(targetWeight) : current.targetWeight,
    });
    sessionStorage.setItem("wefit_stats_prompt", "1");
    toast({ title: "Stats updated", description: "Saved to your profile." });
    setOpen(false);
  };

  const handleSkip = () => {
    sessionStorage.setItem("wefit_stats_prompt", "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) sessionStorage.setItem("wefit_stats_prompt", "1"); setOpen(next); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Update your stats</DialogTitle>
          <DialogDescription className="text-center text-sm">
            These values are stored on your WeFit profile so Ada can keep plans accurate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Current weight (kg)
            </Label>
            <Input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Height (cm)
            </Label>
            <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="targetWeight" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target weight (kg) — optional
            </Label>
            <Input id="targetWeight" type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1 w-full">Skip for now</Button>
          <Button onClick={() => void handleUpdate()} className="flex-1 w-full">Save to profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
