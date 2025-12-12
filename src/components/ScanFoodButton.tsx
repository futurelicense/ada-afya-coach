import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scan, Settings2 } from "lucide-react";
import { FoodScanner } from './FoodScanner';
import { FoodScanResult } from './FoodScanResult';
import { HealthProfileSetup } from './HealthProfileSetup';
import { FoodItem, ScanResult, foodScanService } from '@/lib/foodScanService';
import { cn } from '@/lib/utils';

interface ScanFoodButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const ScanFoodButton = ({ 
  variant = 'default', 
  size = 'default',
  className,
  showLabel = true 
}: ScanFoodButtonProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const handleFoodSelected = (food: FoodItem) => {
    setSelectedFood(food);
    setShowScanner(false);
    
    // Check if user has a health profile set up
    const profile = foodScanService.getHealthProfile();
    const hasProfile = profile.healthConditions.length > 0 || 
                       profile.allergies.length > 0 || 
                       profile.wellnessGoals.length > 0;
    
    if (!hasProfile) {
      setShowProfileSetup(true);
    } else {
      analyzeFood(food);
    }
  };

  const analyzeFood = (food: FoodItem) => {
    const profile = foodScanService.getHealthProfile();
    const result = foodScanService.analyzeFood(food, profile);
    setScanResult(result);
    setShowResult(true);
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    if (selectedFood) {
      analyzeFood(selectedFood);
    }
  };

  const handleRescan = () => {
    setShowResult(false);
    setScanResult(null);
    setShowScanner(true);
  };

  const handleSelectAlternative = (food: FoodItem) => {
    setShowResult(false);
    setSelectedFood(food);
    analyzeFood(food);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setShowScanner(true)}
        className={cn("gap-2", className)}
      >
        <Scan className="h-4 w-4" />
        {showLabel && <span>Scan Food</span>}
      </Button>

      <FoodScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onFoodSelected={handleFoodSelected}
      />

      <HealthProfileSetup
        open={showProfileSetup}
        onOpenChange={setShowProfileSetup}
        onComplete={handleProfileComplete}
      />

      {scanResult && (
        <FoodScanResult
          open={showResult}
          onOpenChange={setShowResult}
          result={scanResult}
          onRescan={handleRescan}
          onSelectAlternative={handleSelectAlternative}
        />
      )}
    </>
  );
};
