import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  name: string;
  duration: number; // seconds
  rest: number; // seconds
  formCues: string[];
}

const workoutExercises: Exercise[] = [
  {
    name: "Push-ups",
    duration: 30,
    rest: 15,
    formCues: [
      "Keep your body in a straight line",
      "Lower your chest to the ground",
      "Push back up with control",
      "Halfway there, keep going!",
      "Final 10 seconds, finish strong!"
    ]
  },
  {
    name: "Squats",
    duration: 30,
    rest: 15,
    formCues: [
      "Feet shoulder-width apart",
      "Keep your knees behind your toes",
      "Lower down like sitting in a chair",
      "You're doing great!",
      "Almost done, push through!"
    ]
  },
  {
    name: "Plank",
    duration: 30,
    rest: 15,
    formCues: [
      "Engage your core",
      "Keep your body straight",
      "Don't let your hips sag",
      "Hold steady, you got this!",
      "Final seconds, stay strong!"
    ]
  },
  {
    name: "Jumping Jacks",
    duration: 30,
    rest: 15,
    formCues: [
      "Land softly on your feet",
      "Keep a steady rhythm",
      "Arms all the way up",
      "Great energy, keep it up!",
      "Last few seconds!"
    ]
  },
];

export const VoiceGuidedWorkout = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workoutExercises[0].duration);
  const [isResting, setIsResting] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cueIndex, setCueIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = workoutExercises[currentExerciseIndex];
  const totalExercises = workoutExercises.length;
  const progress = ((currentExerciseIndex) / totalExercises) * 100;

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for current phase
          if (isResting) {
            // Rest is over, move to next exercise
            if (currentExerciseIndex < totalExercises - 1) {
              const nextExercise = workoutExercises[currentExerciseIndex + 1];
              speak(`Get ready for ${nextExercise.name}`);
              setCurrentExerciseIndex(currentExerciseIndex + 1);
              setIsResting(false);
              setCueIndex(0);
              return nextExercise.duration;
            } else {
              // Workout complete
              speak("Workout complete! Great job!");
              setIsActive(false);
              toast({
                title: "Workout Complete! 🎉",
                description: "Amazing work! You crushed it!",
              });
              return 0;
            }
          } else {
            // Exercise is over, start rest
            speak("Rest time");
            setIsResting(true);
            return currentExercise.rest;
          }
        }

        // Provide form cues during exercise
        if (!isResting) {
          const exerciseDuration = currentExercise.duration;
          const elapsed = exerciseDuration - prev;
          const cueInterval = exerciseDuration / currentExercise.formCues.length;
          
          if (elapsed % cueInterval === 0 && cueIndex < currentExercise.formCues.length) {
            speak(currentExercise.formCues[cueIndex]);
            setCueIndex(cueIndex + 1);
          }
        }

        // Countdown announcements
        if (prev === 10 && !isResting) {
          speak("10 seconds left");
        } else if (prev === 3 && isResting) {
          speak("3, 2, 1");
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isResting, currentExerciseIndex, cueIndex]);

  const startWorkout = () => {
    setIsActive(true);
    setCurrentExerciseIndex(0);
    setTimeLeft(workoutExercises[0].duration);
    setIsResting(false);
    setCueIndex(0);
    speak(`Let's start with ${workoutExercises[0].name}`);
  };

  const pauseWorkout = () => {
    setIsActive(false);
    speak("Workout paused");
  };

  const resetWorkout = () => {
    setIsActive(false);
    setCurrentExerciseIndex(0);
    setTimeLeft(workoutExercises[0].duration);
    setIsResting(false);
    setCueIndex(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const skipExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextExercise = workoutExercises[currentExerciseIndex + 1];
      speak(`Skipping to ${nextExercise.name}`);
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimeLeft(nextExercise.duration);
      setIsResting(false);
      setCueIndex(0);
    }
  };

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice-Guided Workout
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              toast({
                title: voiceEnabled ? "Voice disabled" : "Voice enabled",
                description: voiceEnabled ? "Workout guidance muted" : "Workout guidance will speak",
              });
            }}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Exercise {currentExerciseIndex + 1} of {totalExercises}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Exercise */}
        <div className="text-center p-6 bg-gradient-card rounded-lg">
          <Badge className="mb-4" variant={isResting ? "secondary" : "default"}>
            {isResting ? "Rest" : "Exercise"}
          </Badge>
          <h3 className="text-3xl font-bold mb-2">{currentExercise.name}</h3>
          <div className="text-6xl font-bold text-primary my-6">
            {timeLeft}
          </div>
          <p className="text-sm text-muted-foreground">seconds</p>
        </div>

        {/* Form Cues */}
        {!isResting && (
          <div className="p-4 bg-secondary/10 rounded-lg">
            <p className="text-sm font-medium mb-2">Current Form Cue:</p>
            <p className="text-muted-foreground">
              {currentExercise.formCues[Math.min(cueIndex, currentExercise.formCues.length - 1)]}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startWorkout} className="flex-1" size="lg">
              <Play className="mr-2 h-5 w-5" />
              {currentExerciseIndex === 0 && timeLeft === workoutExercises[0].duration ? 'Start Workout' : 'Resume'}
            </Button>
          ) : (
            <Button onClick={pauseWorkout} className="flex-1" size="lg" variant="secondary">
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          )}
          
          <Button onClick={skipExercise} size="lg" variant="outline" disabled={currentExerciseIndex >= totalExercises - 1}>
            <SkipForward className="h-5 w-5" />
          </Button>
          
          <Button onClick={resetWorkout} size="lg" variant="outline">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Exercise List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Workout Exercises:</p>
          {workoutExercises.map((exercise, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-smooth ${
                idx === currentExerciseIndex ? 'bg-primary/10 border-primary' : 'bg-muted/50'
              } ${idx < currentExerciseIndex ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{exercise.name}</span>
                <span className="text-sm text-muted-foreground">{exercise.duration}s</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
