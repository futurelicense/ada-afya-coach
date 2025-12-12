import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Flame, 
  AlertCircle,
  Sparkles,
  ChefHat,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookmarkPlus,
  Share2,
  Info
} from "lucide-react";
import { ScanResult, FoodItem, foodScanService } from '@/lib/foodScanService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FoodScanResultProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ScanResult;
  onRescan: () => void;
  onSelectAlternative: (food: FoodItem) => void;
}

export const FoodScanResult = ({ 
  open, 
  onOpenChange, 
  result, 
  onRescan,
  onSelectAlternative 
}: FoodScanResultProps) => {
  const [portionSize, setPortionSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showPortionAdjust, setShowPortionAdjust] = useState(false);
  const { toast } = useToast();

  const getVerdictConfig = (verdict: ScanResult['verdict']) => {
    switch (verdict) {
      case 'suitable':
        return {
          icon: CheckCircle2,
          label: 'Suitable',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10',
          borderColor: 'border-secondary/30',
        };
      case 'caution':
        return {
          icon: AlertTriangle,
          label: 'Consume with Caution',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
        };
      case 'not-recommended':
        return {
          icon: XCircle,
          label: 'Not Recommended',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
        };
    }
  };

  const getPortionMultiplier = () => {
    switch (portionSize) {
      case 'small': return 0.5;
      case 'medium': return 1;
      case 'large': return 1.5;
    }
  };

  const adjustedCalories = Math.round(result.food.calories * getPortionMultiplier());
  const verdictConfig = getVerdictConfig(result.verdict);
  const VerdictIcon = verdictConfig.icon;

  const handleSaveToHistory = () => {
    foodScanService.saveScanToHistory(result);
    toast({
      title: "Saved!",
      description: "This scan has been saved to your history.",
    });
  };

  const handleFeedback = (correct: boolean) => {
    toast({
      title: correct ? "Thanks for confirming!" : "Thanks for the feedback!",
      description: correct 
        ? "This helps improve our accuracy." 
        : "We'll use this to improve our food recognition.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Food Analysis: ${result.food.name}`,
        text: `${result.food.name} - ${verdictConfig.label}\n${adjustedCalories} calories`,
      });
    } else {
      navigator.clipboard.writeText(`${result.food.name} - ${verdictConfig.label}\n${adjustedCalories} calories`);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Food Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Food Identified */}
          <Card className="glass border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{result.food.name}</h3>
                  {result.food.localName && (
                    <p className="text-sm text-muted-foreground">{result.food.localName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {result.food.origin}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {result.food.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Flame className="h-5 w-5" />
                    <span className="text-2xl font-bold">{adjustedCalories}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">calories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verdict */}
          <Card className={cn("border-2", verdictConfig.borderColor, verdictConfig.bgColor)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-full", verdictConfig.bgColor)}>
                  <VerdictIcon className={cn("h-6 w-6", verdictConfig.color)} />
                </div>
                <div>
                  <h4 className={cn("font-bold text-lg", verdictConfig.color)}>
                    {verdictConfig.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your health profile
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why This Matters */}
          {result.reasonsForYou.length > 0 && (
            <Card className="glass border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Why This Matters for You
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {result.reasonsForYou.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Nutrition Flags & Alerts */}
          {(result.nutritionFlags.length > 0 || result.ingredientAlerts.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.nutritionFlags.length > 0 && (
                <Card className="glass border-0 shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Nutrition Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {result.nutritionFlags.map((flag, idx) => (
                        <Badge key={idx} variant="outline" className="border-orange-500/30 text-orange-500">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {result.ingredientAlerts.length > 0 && (
                <Card className="glass border-0 shadow-card border-destructive/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Ingredient Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {result.ingredientAlerts.map((alert, idx) => (
                        <li key={idx} className="text-sm text-destructive">{alert}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Portion Guidance */}
          <Card className="glass border-0 shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Portion Guidance
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPortionAdjust(!showPortionAdjust)}
                >
                  Adjust
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm">{result.portionGuidance}</p>
              <p className="text-xs text-muted-foreground">
                Standard portion: {result.food.portionSize}
              </p>
              
              {showPortionAdjust && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm">Adjust portion size:</Label>
                    <RadioGroup
                      value={portionSize}
                      onValueChange={(v) => setPortionSize(v as typeof portionSize)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small" className="text-sm cursor-pointer">Small (½)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="text-sm cursor-pointer">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="text-sm cursor-pointer">Large (1.5×)</Label>
                      </div>
                    </RadioGroup>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="glass p-2 rounded-lg">
                        <p className="font-bold text-primary">{adjustedCalories}</p>
                        <p className="text-muted-foreground">cal</p>
                      </div>
                      <div className="glass p-2 rounded-lg">
                        <p className="font-bold">{Math.round(result.food.protein * getPortionMultiplier())}g</p>
                        <p className="text-muted-foreground">protein</p>
                      </div>
                      <div className="glass p-2 rounded-lg">
                        <p className="font-bold">{Math.round(result.food.carbs * getPortionMultiplier())}g</p>
                        <p className="text-muted-foreground">carbs</p>
                      </div>
                      <div className="glass p-2 rounded-lg">
                        <p className="font-bold">{Math.round(result.food.fats * getPortionMultiplier())}g</p>
                        <p className="text-muted-foreground">fats</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Suggested Alternatives */}
          {result.alternatives.length > 0 && (
            <Card className="glass border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Suggested Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {result.alternatives.map((alt) => (
                    <div 
                      key={alt.id}
                      className="flex items-center justify-between p-3 glass rounded-xl cursor-pointer hover:shadow-md transition-all"
                      onClick={() => onSelectAlternative(alt)}
                    >
                      <div>
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-xs text-muted-foreground">{alt.calories} cal</p>
                      </div>
                      <Badge variant="secondary" className="text-secondary">
                        Try this
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confidence & Feedback */}
          <Card className="glass border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      result.confidence === 'high' && 'border-secondary text-secondary',
                      result.confidence === 'medium' && 'border-primary text-primary',
                      result.confidence === 'low' && 'border-orange-500 text-orange-500'
                    )}
                  >
                    {result.confidence} confidence
                  </Badge>
                  {result.isEstimated && (
                    <span className="text-xs text-muted-foreground">(estimated values)</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleFeedback(true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleFeedback(false)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="p-4 pt-0 flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={handleSaveToHistory}>
              <BookmarkPlus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:flex-1">
            <Button variant="outline" onClick={onRescan} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Scan Another
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
