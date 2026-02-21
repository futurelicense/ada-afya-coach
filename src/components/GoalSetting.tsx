import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, Check, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userDataService, Goal } from "@/lib/userDataService";

export const GoalSetting = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'weight',
    target: 0,
    current: 0,
    unit: 'kg',
    deadline: '',
  });

  useEffect(() => {
    setGoals(userDataService.getGoals());
  }, []);

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({ title: "Missing Information", description: "Please fill in all goal details", variant: "destructive" });
      return;
    }

    if (editingId) {
      userDataService.updateGoal(editingId, { ...newGoal, completed: false });
      toast({ title: "Goal Updated!", description: `"${newGoal.title}" has been updated` });
      setEditingId(null);
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        completed: false,
      };
      userDataService.addGoal(goal);
      toast({ title: "Goal Created!", description: `"${goal.title}" has been added to your goals` });
    }

    setShowForm(false);
    setNewGoal({ title: '', type: 'weight', target: 0, current: 0, unit: 'kg', deadline: '' });
    saveGoals(userDataService.getGoals());
  };

  const deleteGoal = (id: string) => {
    userDataService.deleteGoal(id);
    saveGoals(userDataService.getGoals());
    toast({ title: "Goal Removed", description: "Goal has been deleted" });
  };

  const editGoal = (goal: Goal) => {
    setEditingId(goal.id);
    setNewGoal({
      title: goal.title,
      type: goal.type,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      deadline: goal.deadline,
    });
    setShowForm(true);
  };

  const updateProgress = (id: string, current: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const completed = current >= goal.target;
    userDataService.updateGoal(id, { current, completed });
    saveGoals(userDataService.getGoals());
    if (completed) {
      toast({ title: "🎉 Goal Completed!", description: `You've achieved "${goal.title}"!` });
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.type === 'weight' && goal.current > goal.target) {
      const totalToLose = goal.current;
      const lost = goal.current - goal.target;
      return Math.min((lost / totalToLose) * 100, 100);
    }
    return Math.min((goal.current / goal.target) * 100, 100);
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
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setNewGoal({ title: '', type: 'weight', target: 0, current: 0, unit: 'kg', deadline: '' }); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input id="title" placeholder="e.g., Lose 5kg" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Goal Type</Label>
                <Select value={newGoal.type} onValueChange={(v) => setNewGoal({ ...newGoal, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="workouts">Workouts</SelectItem>
                    <SelectItem value="calories">Calories</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Input placeholder="kg, workouts, etc." value={newGoal.unit} onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Value</Label>
                <Input type="number" value={newGoal.current || ''} onChange={(e) => setNewGoal({ ...newGoal, current: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Target Value</Label>
                <Input type="number" value={newGoal.target || ''} onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal} className="flex-1">{editingId ? 'Update Goal' : 'Create Goal'}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const isCompleted = goal.completed || progress >= 100;

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
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => editGoal(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

                {!isCompleted && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Update progress"
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            updateProgress(goal.id, val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Press Enter</span>
                  </div>
                )}

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
