import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  AlertTriangle, 
  Target, 
  Utensils,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { UserHealthProfile, foodScanService } from '@/lib/foodScanService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface HealthProfileSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const healthConditionOptions = [
  { id: 'diabetes', label: 'Diabetes', icon: '🩺' },
  { id: 'hypertension', label: 'High Blood Pressure', icon: '❤️' },
  { id: 'heart-disease', label: 'Heart Disease', icon: '💗' },
  { id: 'cholesterol', label: 'High Cholesterol', icon: '🫀' },
  { id: 'kidney-disease', label: 'Kidney Disease', icon: '🫘' },
  { id: 'celiac', label: 'Celiac Disease', icon: '🌾' },
  { id: 'ibs', label: 'IBS/Digestive Issues', icon: '🫃' },
  { id: 'none', label: 'No conditions', icon: '✨' },
];

const allergyOptions = [
  { id: 'peanuts', label: 'Peanuts/Groundnuts', icon: '🥜' },
  { id: 'shellfish', label: 'Shellfish/Crayfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'dairy', label: 'Dairy/Milk', icon: '🥛' },
  { id: 'gluten', label: 'Gluten/Wheat', icon: '🍞' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'none', label: 'No allergies', icon: '✅' },
];

const wellnessGoalOptions = [
  { id: 'weight-loss', label: 'Lose Weight', icon: '⚖️' },
  { id: 'weight-gain', label: 'Gain Weight', icon: '💪' },
  { id: 'muscle-gain', label: 'Build Muscle', icon: '🏋️' },
  { id: 'maintain-weight', label: 'Maintain Weight', icon: '⚡' },
  { id: 'eat-healthier', label: 'Eat Healthier', icon: '🥗' },
  { id: 'manage-condition', label: 'Manage Health Condition', icon: '🩺' },
  { id: 'more-energy', label: 'More Energy', icon: '🔋' },
  { id: 'better-sleep', label: 'Better Sleep', icon: '😴' },
];

const dietPreferenceOptions = [
  { id: 'balanced', label: 'Balanced Diet', description: 'No restrictions' },
  { id: 'low-carb', label: 'Low Carb', description: 'Reduced carbohydrates' },
  { id: 'high-protein', label: 'High Protein', description: 'Focus on protein' },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
];

export const HealthProfileSetup = ({ open, onOpenChange, onComplete }: HealthProfileSetupProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserHealthProfile>(() => foodScanService.getHealthProfile());
  const { toast } = useToast();

  const totalSteps = 4;

  const toggleArrayItem = (array: string[], item: string) => {
    if (item === 'none') {
      return ['none'];
    }
    const filtered = array.filter(i => i !== 'none');
    if (filtered.includes(item)) {
      return filtered.filter(i => i !== item);
    }
    return [...filtered, item];
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save profile
      foodScanService.saveHealthProfile(profile);
      toast({
        title: "Profile Saved!",
        description: "Your health profile has been updated.",
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return profile.dietPreference !== undefined;
      case 2: return profile.healthConditions.length > 0;
      case 3: return profile.allergies.length > 0;
      case 4: return profile.wellnessGoals.length > 0;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Set Up Your Health Profile
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  idx + 1 <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-4">
          {step === 1 && (
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-3 p-3 glass rounded-xl">
                <Utensils className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Diet Preference</h3>
                  <p className="text-sm text-muted-foreground">What's your eating style?</p>
                </div>
              </div>
              
              <RadioGroup
                value={profile.dietPreference}
                onValueChange={(v) => setProfile({ ...profile, dietPreference: v as UserHealthProfile['dietPreference'] })}
                className="space-y-2"
              >
                {dietPreferenceOptions.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={option.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                      profile.dietPreference === option.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-3 p-3 glass rounded-xl">
                <Heart className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Health Conditions</h3>
                  <p className="text-sm text-muted-foreground">Select any that apply to you</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {healthConditionOptions.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`condition-${option.id}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      profile.healthConditions.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      id={`condition-${option.id}`}
                      checked={profile.healthConditions.includes(option.id)}
                      onCheckedChange={() => {
                        setProfile({
                          ...profile,
                          healthConditions: toggleArrayItem(profile.healthConditions, option.id),
                        });
                      }}
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-3 p-3 glass rounded-xl">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="font-semibold">Allergies & Intolerances</h3>
                  <p className="text-sm text-muted-foreground">We'll flag these ingredients</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {allergyOptions.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`allergy-${option.id}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      profile.allergies.includes(option.id)
                        ? "border-orange-500 bg-orange-500/5 shadow-md" 
                        : "border-border hover:border-orange-500/50"
                    )}
                  >
                    <Checkbox
                      id={`allergy-${option.id}`}
                      checked={profile.allergies.includes(option.id)}
                      onCheckedChange={() => {
                        setProfile({
                          ...profile,
                          allergies: toggleArrayItem(profile.allergies, option.id),
                        });
                      }}
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-3 p-3 glass rounded-xl">
                <Target className="h-5 w-5 text-secondary" />
                <div>
                  <h3 className="font-semibold">Wellness Goals</h3>
                  <p className="text-sm text-muted-foreground">What are you working towards?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {wellnessGoalOptions.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`goal-${option.id}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      profile.wellnessGoals.includes(option.id)
                        ? "border-secondary bg-secondary/5 shadow-md" 
                        : "border-border hover:border-secondary/50"
                    )}
                  >
                    <Checkbox
                      id={`goal-${option.id}`}
                      checked={profile.wellnessGoals.includes(option.id)}
                      onCheckedChange={() => {
                        setProfile({
                          ...profile,
                          wellnessGoals: profile.wellnessGoals.includes(option.id)
                            ? profile.wellnessGoals.filter(g => g !== option.id)
                            : [...profile.wellnessGoals, option.id],
                        });
                      }}
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </Label>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-sm font-medium">Daily Limits (optional)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Calories</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={profile.dailyCalorieLimit || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        dailyCalorieLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sodium (mg)</Label>
                    <Input
                      type="number"
                      placeholder="2300"
                      value={profile.dailySodiumLimit || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        dailySodiumLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sugar (g)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={profile.dailySugarLimit || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        dailySugarLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 pt-2 border-t flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={!canProceed()}
            className="flex-1 gap-2"
          >
            {step === totalSteps ? 'Save Profile' : 'Continue'}
            {step < totalSteps && <ChevronRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
