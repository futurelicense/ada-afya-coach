// Local storage service for user data
export interface UserProfile {
  name: string;
  email: string;
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  weight: number;
  targetWeight: number;
  height: number;
  location: string;
  joinDate: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  caloriesBurned: number;
  completed: boolean;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    muscles: string;
    completed: boolean;
  }>;
}

export interface MealLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  eaten: boolean;
}

export interface DailyStats {
  date: string;
  caloriesBurned: number;
  workoutsCompleted: number;
  waterIntake: number;
  caloriesConsumed: number;
}

export interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date: string | null;
}

class UserDataService {
  private readonly PROFILE_KEY = 'wefit_profile';
  private readonly WORKOUTS_KEY = 'wefit_workouts';
  private readonly MEALS_KEY = 'wefit_meals';
  private readonly STATS_KEY = 'wefit_stats';
  private readonly GOALS_KEY = 'wefit_goals';
  private readonly ACHIEVEMENTS_KEY = 'wefit_achievements';

  constructor() {
    // Migrate old keys
    this.migrateKeys();
  }

  private migrateKeys() {
    const oldKeys = [
      ['fitnaija_profile', this.PROFILE_KEY],
      ['fitnaija_workouts', this.WORKOUTS_KEY],
      ['fitnaija_meals', this.MEALS_KEY],
      ['fitnaija_stats', this.STATS_KEY],
    ];
    oldKeys.forEach(([oldKey, newKey]) => {
      const data = localStorage.getItem(oldKey);
      if (data && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, data);
      }
    });
  }

  // Profile Management
  getProfile(): UserProfile | null {
    const data = localStorage.getItem(this.PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Workout Management
  getWorkouts(): WorkoutSession[] {
    const data = localStorage.getItem(this.WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addWorkout(workout: WorkoutSession): void {
    const workouts = this.getWorkouts();
    workouts.push(workout);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  updateWorkout(id: string, updates: Partial<WorkoutSession>): void {
    const workouts = this.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updates };
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    }
  }

  deleteWorkout(id: string): void {
    const workouts = this.getWorkouts().filter(w => w.id !== id);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  getTodayWorkouts(): WorkoutSession[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getWorkouts().filter(w => w.date === today);
  }

  // Meal Management
  getMeals(): MealLog[] {
    const data = localStorage.getItem(this.MEALS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addMeal(meal: MealLog): void {
    const meals = this.getMeals();
    meals.push(meal);
    localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
  }

  updateMeal(id: string, updates: Partial<MealLog>): void {
    const meals = this.getMeals();
    const index = meals.findIndex(m => m.id === id);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...updates };
      localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
    }
  }

  deleteMeal(id: string): void {
    const meals = this.getMeals().filter(m => m.id !== id);
    localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
  }

  getTodayMeals(): MealLog[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getMeals().filter(m => m.date === today);
  }

  // Stats Management
  getStats(): DailyStats[] {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getTodayStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.getStats();
    const todayStats = stats.find(s => s.date === today);
    
    if (todayStats) return todayStats;

    const workouts = this.getTodayWorkouts();
    const meals = this.getTodayMeals();
    
    return {
      date: today,
      caloriesBurned: workouts.reduce((sum, w) => sum + (w.completed ? w.caloriesBurned : 0), 0),
      workoutsCompleted: workouts.filter(w => w.completed).length,
      waterIntake: 0,
      caloriesConsumed: meals.reduce((sum, m) => sum + (m.eaten ? m.calories : 0), 0),
    };
  }

  updateTodayStats(updates: Partial<DailyStats>): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.getStats();
    const index = stats.findIndex(s => s.date === today);
    
    if (index !== -1) {
      stats[index] = { ...stats[index], ...updates };
    } else {
      stats.push({ ...this.getTodayStats(), ...updates });
    }
    
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  getWeeklyStats(): DailyStats[] {
    const stats = this.getStats();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return stats.filter(s => {
      const statDate = new Date(s.date);
      return statDate >= weekAgo && statDate <= today;
    });
  }

  // Streak calculation
  getCurrentStreak(): number {
    const allWorkouts = this.getWorkouts().filter(w => w.completed);
    if (allWorkouts.length === 0) return 0;

    const uniqueDates = [...new Set(allWorkouts.map(w => w.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Must include today or yesterday to count as active streak
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diff = (current.getTime() - next.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // Aggregate stats
  getTotalStats() {
    const workouts = this.getWorkouts();
    const completed = workouts.filter(w => w.completed);
    const totalCalories = completed.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const meals = this.getMeals();
    const goals = this.getGoals();
    
    return {
      totalWorkouts: completed.length,
      totalCaloriesBurned: totalCalories,
      totalMealsLogged: meals.filter(m => m.eaten).length,
      goalsAchieved: goals.filter(g => g.completed).length,
      currentStreak: this.getCurrentStreak(),
    };
  }

  // Goals Management
  getGoals(): Goal[] {
    const data = localStorage.getItem(this.GOALS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addGoal(goal: Goal): void {
    const goals = this.getGoals();
    goals.push(goal);
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
  }

  updateGoal(id: string, updates: Partial<Goal>): void {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    }
  }

  deleteGoal(id: string): void {
    const goals = this.getGoals().filter(g => g.id !== id);
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
  }

  // Achievements
  getAchievements(): Achievement[] {
    const data = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    if (data) return JSON.parse(data);
    
    // Default achievements
    return [
      { id: '1', name: 'First Workout', description: 'Complete your first workout', earned: false, date: null },
      { id: '2', name: 'Week Warrior', description: '7 consecutive days of workouts', earned: false, date: null },
      { id: '3', name: 'Calorie Crusher', description: 'Burn 10,000 total calories', earned: false, date: null },
      { id: '4', name: 'Meal Master', description: 'Log 50 meals', earned: false, date: null },
      { id: '5', name: 'Hydration Hero', description: 'Hit 3L water goal 7 days', earned: false, date: null },
      { id: '6', name: 'Goal Getter', description: 'Complete 5 goals', earned: false, date: null },
    ];
  }

  checkAndUpdateAchievements(): Achievement[] {
    const achievements = this.getAchievements();
    const stats = this.getTotalStats();
    const today = new Date().toISOString().split('T')[0];

    // First Workout
    if (!achievements[0].earned && stats.totalWorkouts >= 1) {
      achievements[0] = { ...achievements[0], earned: true, date: today };
    }
    // Week Warrior
    if (!achievements[1].earned && stats.currentStreak >= 7) {
      achievements[1] = { ...achievements[1], earned: true, date: today };
    }
    // Calorie Crusher
    if (!achievements[2].earned && stats.totalCaloriesBurned >= 10000) {
      achievements[2] = { ...achievements[2], earned: true, date: today };
    }
    // Meal Master
    if (!achievements[3].earned && stats.totalMealsLogged >= 50) {
      achievements[3] = { ...achievements[3], earned: true, date: today };
    }
    // Goal Getter
    if (!achievements[5].earned && stats.goalsAchieved >= 5) {
      achievements[5] = { ...achievements[5], earned: true, date: today };
    }

    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return achievements;
  }

  // Weekly activity data for charts
  getWeeklyChartData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    return days.map((day, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = this.getWorkouts().filter(w => w.date === dateStr && w.completed);
      const dayMeals = this.getMeals().filter(m => m.date === dateStr && m.eaten);
      const dayStats = this.getStats().find(s => s.date === dateStr);
      
      return {
        day,
        date: dateStr,
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
        water: dayStats?.waterIntake || 0,
        caloriesConsumed: dayMeals.reduce((sum, m) => sum + m.calories, 0),
      };
    });
  }
}

export const userDataService = new UserDataService();
