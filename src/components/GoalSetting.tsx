import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

export const GoalSetting = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Lose Weight',
      type: 'weight',
      target: 70,
      current: 75,
      unit: 'kg',
      deadline: '2025-12-31',
      completed: false,
    },
    {
      id: '2',
      title: 'Weekly Workouts',
      type: 'workouts',
      target: 5,
      current: 3,
      unit: 'workouts',
      deadline: '2025-12-31',
      completed: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'weight',
    target: 0,
    current: 0,
    unit: 'kg',
    deadline: '',
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all goal details",
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      completed: false,
    };

    setGoals([...goals, goal]);
    setShowForm(false);
    setNewGoal({
      title: '',
      type: 'weight',
      target: 0,
      current: 0,
      unit: 'kg',
      deadline: '',
    });

    toast({
      title: "Goal Created!",
      description: `"${goal.title}" has been added to your goals`,
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast({
      title: "Goal Removed",
      description: "Goal has been deleted",
    });
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.type === 'weight' && goal.current > goal.target) {
      return ((goal.current - goal.target) / goal.current) * 100;
    }
    return (goal.current / goal.target) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            My Goals
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Set and track your fitness objectives</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Lose 5kg"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Goal Type</Label>
                <Select value={newGoal.type} onValueChange={(v) => setNewGoal({ ...newGoal, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="workouts">Workouts</SelectItem>
                    <SelectItem value="calories">Calories</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="kg, workouts, etc."
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current">Current Value</Label>
                <Input
                  id="current"
                  type="number"
                  value={newGoal.current || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, current: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="target">Target Value</Label>
                <Input
                  id="target"
                  type="number"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addGoal} className="flex-1">Create Goal</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const isCompleted = progress >= 100;

          return (
            <Card key={goal.id} className={`hover-scale shadow-card ${isCompleted ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {goal.title}
                      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-primary">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round(progress)}% complete
                  </p>
                </div>

                <Badge variant={isCompleted ? "default" : "secondary"}>
                  {isCompleted ? "Completed! 🎉" : "In Progress"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No goals set yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Goal
          </Button>
        </Card>
      )}
    </div>
  );
};
