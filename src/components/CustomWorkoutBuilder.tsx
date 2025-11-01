import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userDataService } from "@/lib/userDataService";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  muscles: string;
}

const availableExercises = [
  { name: "Push-ups", muscles: "Chest, Triceps" },
  { name: "Squats", muscles: "Legs, Glutes" },
  { name: "Plank", muscles: "Core" },
  { name: "Lunges", muscles: "Legs" },
  { name: "Burpees", muscles: "Full Body" },
  { name: "Mountain Climbers", muscles: "Core, Cardio" },
  { name: "Jumping Jacks", muscles: "Cardio" },
  { name: "Dips", muscles: "Triceps, Chest" },
  { name: "Pull-ups", muscles: "Back, Biceps" },
  { name: "Deadlifts", muscles: "Back, Legs" },
  { name: "Bench Press", muscles: "Chest" },
  { name: "Shoulder Press", muscles: "Shoulders" },
];

export const CustomWorkoutBuilder = ({ onWorkoutCreated }: { onWorkoutCreated?: () => void }) => {
  const { toast } = useToast();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);

  const addExercise = (exercise: typeof availableExercises[0]) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        ...exercise,
        sets: 3,
        reps: 12,
      },
    ]);
    setShowExerciseList(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: 'sets' | 'reps', value: number) => {
    const updated = [...selectedExercises];
    updated[index][field] = value;
    setSelectedExercises(updated);
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please give your workout a name",
        variant: "destructive",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }

    const workout = {
      id: Date.now().toString(),
      name: workoutName,
      duration: selectedExercises.length * 5,
      difficulty: 'intermediate' as const,
      calories: selectedExercises.length * 50,
      exercises: selectedExercises.map(ex => ({
        ...ex,
        completed: false,
      })),
      date: new Date().toISOString().split('T')[0],
      completed: false,
      caloriesBurned: 0,
    };

    userDataService.addWorkout(workout);

    toast({
      title: "Workout Created! 💪",
      description: `"${workoutName}" has been added to your plan`,
    });

    setWorkoutName("");
    setSelectedExercises([]);
    onWorkoutCreated?.();
  };

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Custom Workout Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workout Name */}
        <div>
          <Label htmlFor="workout-name">Workout Name</Label>
          <Input
            id="workout-name"
            placeholder="e.g., Morning Power Session"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        {/* Selected Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Exercises ({selectedExercises.length})</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExerciseList(!showExerciseList)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </div>

          {showExerciseList && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
              {availableExercises.map((ex, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="justify-start h-auto py-2 px-3"
                  onClick={() => addExercise(ex)}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.muscles}</p>
                  </div>
                </Button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {selectedExercises.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">No exercises added yet</p>
              </div>
            ) : (
              selectedExercises.map((exercise, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                  <div className="flex-1">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.muscles}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <Label className="text-xs text-muted-foreground mb-1">Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        className="w-16 h-8 text-center"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <Label className="text-xs text-muted-foreground mb-1">Reps</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        className="w-16 h-8 text-center"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeExercise(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        {selectedExercises.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="secondary">
              {selectedExercises.length} exercises
            </Badge>
            <Badge variant="secondary">
              ~{selectedExercises.length * 5} minutes
            </Badge>
            <Badge variant="secondary">
              ~{selectedExercises.length * 50} calories
            </Badge>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={saveWorkout} className="w-full" size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Workout
        </Button>
      </CardContent>
    </Card>
  );
};
