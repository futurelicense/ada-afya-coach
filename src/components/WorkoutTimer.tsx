import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface WorkoutTimerProps {
  exerciseName: string;
  sets: number;
  reps: number;
  restTime?: number;
  onComplete?: () => void;
}

export const WorkoutTimer = ({ exerciseName, sets, reps, restTime = 60, onComplete }: WorkoutTimerProps) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && isResting && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            setIsRunning(false);
            if (soundEnabled) playBeep();
            return restTime;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isResting, timeLeft, restTime, soundEnabled]);

  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  };

  const startRest = () => {
    setIsResting(true);
    setIsRunning(true);
    setTimeLeft(restTime);
  };

  const completeSet = () => {
    if (currentSet < sets) {
      setCurrentSet((prev) => prev + 1);
      startRest();
    } else {
      onComplete?.();
    }
  };

  const resetTimer = () => {
    setCurrentSet(1);
    setIsResting(false);
    setIsRunning(false);
    setTimeLeft(restTime);
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-glow border-primary">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>{exerciseName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Set Progress */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: sets }).map((_, idx) => (
            <div
              key={idx}
              className={`h-3 flex-1 rounded-full transition-all ${
                idx < currentSet ? 'bg-primary' : idx === currentSet - 1 ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Current Status */}
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Set {currentSet} of {sets}
          </Badge>
          <p className="text-4xl font-bold mt-4">{reps} reps</p>
        </div>

        {/* Rest Timer */}
        {isResting && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Rest Time</p>
            <div className="text-6xl font-bold text-primary">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isResting ? (
            <Button 
              className="flex-1" 
              size="lg"
              onClick={completeSet}
            >
              {currentSet === sets ? "Complete Exercise" : "Complete Set"}
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              size="lg"
              variant="secondary"
              onClick={togglePause}
            >
              {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={resetTimer}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Skip Rest */}
        {isResting && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => {
              setIsResting(false);
              setIsRunning(false);
              setTimeLeft(restTime);
            }}
          >
            Skip Rest
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
